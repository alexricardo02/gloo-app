"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";


export async function getVenues() {
  try {
    return await prisma.venue.findMany({
      include: {
        attendees: {
          include: {
            group: {
              select: {
                id: true,
                membersCount: true,
                gender: true,
                photos: true,
                user: {
                  select: {
                    name: true,
                    username: true,
                  }
                }
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching venues:", error);
    return [];
  }
}


export async function toggleVenueAttendance(venueId: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("gloo_user_id")?.value;

  if (!userId) return { error: "Not authorized" };

  try {
    const group = await prisma.group.findUnique({
      where: { userId }
    });

    if (!group) return { error: "You have to create a group first" };

    const existingAttendance = await prisma.venueAttendance.findUnique({
      where: {
        groupId_venueId: {
          groupId: group.id,
          venueId: venueId
        }
      }
    });

    if (existingAttendance) {
      await prisma.venueAttendance.delete({
        where: { id: existingAttendance.id },
      });
      return { success: true, isAttending: false };
    } else {
      await prisma.venueAttendance.deleteMany({
        where: { groupId: group.id },
      });
      await prisma.venueAttendance.create({
        data: {
          groupId: group.id,
          venueId: venueId,
        },
      });
      return { success: true, isAttending: true };
    }
  } catch (error) {
    console.error("Error toggling attendance:", error);
    return { error: "Server error" };
  }
}