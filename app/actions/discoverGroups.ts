"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

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

  // 1. Get current user's group to use their location and preferences
  const userGroup = await prisma.group.findUnique({
    where: { userId },
  });

  if (!userGroup || !userGroup.latitude || !userGroup.longitude) {
    const teaserGroup = await prisma.group.findFirst({
      where: {
        userId: { not: userId } // Prevent showing the user themselves if a partial record exists
      },
      include: {
        user: {
          select: { name: true, image: true }
        }
      }
    });

    return {
      groups: teaserGroup ? [teaserGroup] : [],
      hasNoGroup: true // Flag passed to client to trigger the restriction modal
    };
  }

  const limit = 10;
  const skip = page * limit;

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

  // 2. Fetch groups (Basic bounding box for proximity, then refine in JS)
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
        select: { name: true, image: true }
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

  const groups = filteredGroups.slice(skip, skip + limit);

  return { groups };
}

/**
 * Toggles a symbolic like between groups.
 */
export async function toggleLike(toGroupId: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("gloo_user_id")?.value;
  if (!userId) return { error: "Unauthorized" };

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
  } else {
    await prisma.groupLike.create({
      data: { fromGroupId: fromGroup.id, toGroupId },
    });
    return { liked: true };
  }
}