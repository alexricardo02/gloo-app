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
    return { error: "User location not found" };
  }

  const limit = 10;
  const skip = page * limit;

  // 2. Fetch groups (Basic bounding box for proximity or simple filter)
  // Note: For real distance calculation, a raw SQL query with Haversine formula is better.
  // This is a simplified version using Prisma filters.
  const groups = await prisma.group.findMany({
    where: {
      userId: { not: userId }, // Exclude own group
      isPartyMode: isPartyMode,
      gender: userGroup.searchGender === 'ANY' ? undefined : (userGroup.searchGender as any),
      // Basic coordinates filter (approximate range)
      latitude: {
        gte: userGroup.latitude - (distance / 111), 
        lte: userGroup.latitude + (distance / 111)
      },
    },
    take: limit,
    skip: skip,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, image: true }
      }
    }
  });

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