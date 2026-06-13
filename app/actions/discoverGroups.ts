"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const MAX_LIKES_PER_WINDOW = 10;

const likeRateLimit = (globalThis as any).__GLOO_LIKE_RATE_LIMITER ||= new Map<string, { count: number; windowStart: number }>();

/**
 * ST0-88: Returns a Set of group IDs that the current user has blocked
 * or has been blocked by (both directions).
 */
async function getBlockedGroupIds(userId: string, myGroupId: string): Promise<Set<string>> {
  const blocksByMe = await prisma.groupBlock.findMany({
    where: { blockerId: userId },
    select: { blockedGroupId: true },
  });
  const blockedByMeIds = new Set(blocksByMe.map((b) => b.blockedGroupId));

  const blocksOnMe = await prisma.groupBlock.findMany({
    where: { blockedGroupId: myGroupId },
    select: { blockerId: true },
  });
  const blockedMeUserIds = new Set(blocksOnMe.map((b) => b.blockerId));

  let blockedMeGroupIds = new Set<string>();
  if (blockedMeUserIds.size > 0) {
    const blockedMeGroups = await prisma.group.findMany({
      where: { userId: { in: [...blockedMeUserIds] } },
      select: { id: true },
    });
    blockedMeGroupIds = new Set(blockedMeGroups.map((g) => g.id));
  }

  return new Set([...blockedByMeIds, ...blockedMeGroupIds]);
}

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
      publicProfile: true,
      gender: userGroup.searchGender === 'MIXED' ? undefined : userGroup.searchGender,

      OR: [
          { searchGender: 'MIXED' },
          { searchGender: userGroup.gender }
        ],
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
    .filter((group) => {
      if (group.distance > distance) return false;

      const matchesYourAgePref =
        userGroup.searchAgeMin == null || userGroup.searchAgeMax == null
          ? true
          : group.ageMax >= userGroup.searchAgeMin && group.ageMin <= userGroup.searchAgeMax;

      const matchesTheirAgePref =
        group.searchAgeMin == null || group.searchAgeMax == null
          ? true
          : userGroup.ageMax >= group.searchAgeMin && userGroup.ageMin <= group.searchAgeMax;

      return matchesYourAgePref && matchesTheirAgePref;
    });

    const likedGroupRecords = await prisma.groupLike.findMany({
    where: { fromGroupId: userGroup.id },
    select: { toGroupId: true },
  });
  
  const likedGroupIds = new Set(likedGroupRecords.map((like) => like.toGroupId));

  // ST0-88: Get blocked group IDs (both directions)
  const allBlockedGroupIds = await getBlockedGroupIds(userId, userGroup.id);

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
      .filter((group) => !allBlockedGroupIds.has(group.id))
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
    revalidatePath("/");
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

  revalidatePath("/");
  return { liked: true, matched };
}

/**
 * Retrieves all groups that have liked the current user's group.
 * Returns group details including user info, photos, and mutual like status.
 * Used by the "Gruppen, die dich suchen" / "Groups that like you" feature (ST0-87).
 */
export async function getGroupsThatLikedMe() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("gloo_user_id")?.value;

  if (!userId) return { error: "Unauthorized" };

  try {
    const myGroup = await prisma.group.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!myGroup) return { groups: [] };

    // ST0-88: Get blocked group IDs (both directions)
    const allBlockedGroupIds = await getBlockedGroupIds(userId, myGroup.id);

    // Find all likes where the current group is the target
    const incomingLikes = await prisma.groupLike.findMany({
      where: { toGroupId: myGroup.id },
      include: {
        fromGroup: {
          include: {
            user: {
              select: { id: true, name: true, image: true, username: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (incomingLikes.length === 0) return { groups: [] };

    const fromGroupIds = incomingLikes.map((like) => like.fromGroup.id);

    // Check which of these groups the current user has liked back
    const outgoingLikes = await prisma.groupLike.findMany({
      where: {
        fromGroupId: myGroup.id,
        toGroupId: { in: fromGroupIds },
      },
      select: { toGroupId: true },
    });

    const likedBackIds = new Set(outgoingLikes.map((l) => l.toGroupId));

    const groups = incomingLikes
      .filter((like) => !allBlockedGroupIds.has(like.fromGroup.id))
      .map((like) => ({
      id: like.fromGroup.id,
      userId: like.fromGroup.userId,
      user: like.fromGroup.user,
      photos: like.fromGroup.photos,
      description: like.fromGroup.description,
      membersCount: like.fromGroup.membersCount,
      gender: like.fromGroup.gender,
      ageMin: like.fromGroup.ageMin,
      ageMax: like.fromGroup.ageMax,
      latitude: like.fromGroup.latitude,
      longitude: like.fromGroup.longitude,
      createdAt: like.fromGroup.createdAt.toISOString(),
      likedByCurrentUser: likedBackIds.has(like.fromGroup.id),
      isMutualLike: likedBackIds.has(like.fromGroup.id),
    }));

    return { groups };
  } catch (error) {
    console.error("Error fetching groups that liked me:", error);
    return { error: "Failed to fetch groups" };
  }
}