"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const MAX_LIKES_PER_WINDOW = 10;

const likeRateLimit = (globalThis as any).__GLOO_LIKE_RATE_LIMITER ||= new Map<string, { count: number; windowStart: number }>();

/**
 * Fetches groups in packs of 10 for the discovery carousel.
 * Filters by distance, gender preferences, and party mode.
 */
export async function getDiscoveryGroups({
  page = 0,
  distance,
  isPartyMode = false,
}: {
  page: number;
  distance: number;
  isPartyMode?: boolean;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("gloo_user_id")?.value;

  if (!userId) return { error: "Unauthorized" };

  try {
    const userGroup = await prisma.group.findUnique({
      where: { userId },
    });

    if (!userGroup || userGroup.latitude === null || userGroup.longitude === null) {
      return { groups: [] }; 
    }

    function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const R = 6371; // Earth radius in km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    const rawGroups = await prisma.group.findMany({
    where: {
      userId: { not: userId }, // Exclude own group
      isPartyMode: isPartyMode,
      gender: userGroup.searchGender === 'MIXED' ? undefined : userGroup.searchGender,
      // Basic coordinates filter (approximate range)
      latitude: {
        gte: userGroup.latitude - (distance / 111),
        lte: userGroup.latitude + (distance / 111),
      },
      longitude: {
        gte: userGroup.longitude - (distance / 111),
        lte: userGroup.longitude + (distance / 111),
      },
    },
    take: 100,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, image: true }
      }
    }
  });

  const filteredGroups = rawGroups
    .map((group) => ({
      ...group,
      distance: getDistanceKm(
        userGroup.latitude ?? 0,
        userGroup.longitude ?? 0,
        group.latitude ?? 0,
        group.longitude ?? 0,
      ),
    }))
    .filter((group) =>
      group.distance <= distance &&
      (userGroup.searchAgeMin == null || userGroup.searchAgeMax == null
        ? true
        : group.ageMax >= userGroup.searchAgeMin && group.ageMin <= userGroup.searchAgeMax)
    );

    const likedGroupRecords = await prisma.groupLike.findMany({
    where: { fromGroupId: userGroup.id },
    select: { toGroupId: true },
  });
  const likedGroupIds = new Set(likedGroupRecords.map((like) => like.toGroupId));

  const mutualLikeRecords = await prisma.groupLike.findMany({
    where: {
      fromGroupId: { in: filteredGroups.map((group) => group.id) },
      toGroupId: userGroup.id,
    },
    select: { fromGroupId: true },
  });
  const mutualLikeGroupIds = new Set(mutualLikeRecords.map((like) => like.fromGroupId));

  const limit = 10;
    const skip = page * limit;

    const groups = filteredGroups
      .slice(skip, skip + limit)
      .map((group) => ({
        ...group,
        createdAt: group.createdAt.toISOString(),
        updatedAt: group.updatedAt.toISOString(),
        likedByCurrentUser: likedGroupIds.has(group.id),
        isMutualLike: mutualLikeGroupIds.has(group.id),
      }));

    return { groups };

    } catch (error) {
    console.error("Critical error in getDiscoveryGroups:", error);
    return { error: "Failed to fetch groups" }; 
  }
}

/**
 * Toggles a symbolic like between groups.
 */
export async function toggleLike(toGroupId: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("gloo_user_id")?.value;
  if (!userId) return { error: "Unauthorized" };

  const now = Date.now();
  const existingRate = likeRateLimit.get(userId);
  if (existingRate && now - existingRate.windowStart < RATE_LIMIT_WINDOW_MS) {
    if (existingRate.count >= MAX_LIKES_PER_WINDOW) {
      return { error: "Rate limit exceeded. Please wait a moment before liking again." };
    }
    existingRate.count += 1;
    likeRateLimit.set(userId, existingRate);
  } else {
    likeRateLimit.set(userId, { count: 1, windowStart: now });
  }

  const fromGroup = await prisma.group.findUnique({ where: { userId } });
  if (!fromGroup) return { error: "Group not found" };

  const existingLike = await prisma.groupLike.findUnique({
    where: {
      fromGroupId_toGroupId: {
        fromGroupId: fromGroup.id,
        toGroupId,
      },
    },
  });

  if (existingLike) {
    await prisma.groupLike.delete({ where: { id: existingLike.id } });
    return { liked: false };
  }

  const toGroup = await prisma.group.findUnique({
    where: { id: toGroupId },
    select: { id: true, userId: true },
  });

  if (!toGroup) {
    return { error: "Target group not found" };
  }

  const createdLike = await prisma.groupLike.create({
    data: { fromGroupId: fromGroup.id, toGroupId },
  });

  const reciprocalLike = await prisma.groupLike.findUnique({
    where: {
      fromGroupId_toGroupId: {
        fromGroupId: toGroupId,
        toGroupId: fromGroup.id,
      },
    },
  });

  let matched = false;
  if (reciprocalLike) {
    matched = true;

    const existingChat = await prisma.chat.findFirst({
      where: {
        OR: [
          { hostAId: userId, hostBId: toGroup.userId },
          { hostAId: toGroup.userId, hostBId: userId },
        ],
      },
    });

    if (!existingChat) {
      const newChat = await prisma.chat.create({
        data: {
          hostAId: userId,
          hostBId: toGroup.userId,
        },
      });

      await prisma.message.create({
        data: {
          chatId: newChat.id,
          senderId: userId,
          text: "Your groups matched! Start chatting now.",
        },
      });
    }
  }

  return { liked: true, matched };
}