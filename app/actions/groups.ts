"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";


export async function getGroupDiscoveryPack(page: number = 0, limit: number = 10, groupType: string = "Party") {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("gloo_user_id")?.value;

    if (!userId) throw new Error("Unauthorized");

    // 1. Group of the user (to exclude from discovery and to get search preferences)
    const userGroup = await prisma.group.findUnique({
      where: { hostId: userId },
    });

    if (!userGroup) throw new Error("User group not found");

    // 2. DB query
    const groups = await prisma.group.findMany({
      where: {
        // own group should not appear in discovery
        id: { not: userGroup.id },
        
        // type of party
        isPartyMode: groupType === "Party",
        
        groupGender: userGroup.seekingGender === "Any" ? undefined : userGroup.seekingGender,
        
        // age filter
        ageMin: { gte: userGroup.searchAgeMin },
        ageMax: { lte: userGroup.searchAgeMax },
      },
      take: limit,
      skip: page * limit,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        hostName: true,
        description: true,
        membersCount: true,
        ageMin: true,
        ageMax: true,
        groupGender: true,
        images: true,

        likesReceived: {
          where: {
            fromGroupId: userGroup.id
          },
          select: {
            id: true
          }
        }
      }
    });

    // 3. Frontend answer formatting
    const formattedGroups = groups.map(group => {
      const { likesReceived, ...restOfGroup } = group;
      return {
        ...restOfGroup,
        hasLiked: likesReceived.length > 0
      };
    });

    return { groups: formattedGroups };
  } catch (error) {
    console.error("Error fetching groups:", error);
    return { error: "Failed to load groups" };
  }
}

export async function toggleGroupLike(toGroupId: string) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("gloo_user_id")?.value;

    if (!userId) throw new Error("Unauthorized");

    // Buscar el grupo del usuario que está dando el like
    const userGroup = await prisma.group.findUnique({
      where: { hostId: userId },
      select: { id: true }
    });

    if (!userGroup) throw new Error("User group not found. Create a profile first.");

    // Verificar si el like ya existe
    const existingLike = await prisma.groupLike.findUnique({
      where: {
        fromGroupId_toGroupId: {
          fromGroupId: userGroup.id,
          toGroupId: toGroupId
        }
      }
    });

    if (existingLike) {
      // Si ya le dio like, lo quitamos (Unlike)
      await prisma.groupLike.delete({
        where: { id: existingLike.id }
      });
      return { success: true, isLiked: false };
    } else {
      // Si no hay like, lo creamos
      await prisma.groupLike.create({
        data: {
          fromGroupId: userGroup.id,
          toGroupId: toGroupId
        }
      });
      return { success: true, isLiked: true };
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return { error: "Failed to process like" };
  }
}