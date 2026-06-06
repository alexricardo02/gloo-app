"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function getMapSession() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("gloo_user_id")?.value;
  if (!userId) return null;

  const group = await prisma.group.findUnique({ where: { userId } });
  return { userId, groupId: group?.id || null };
}

export async function getOrCreateChatWithUser(targetUserId: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("gloo_user_id")?.value;
  if (!userId) return { error: "Not authorized" };

  let chat = await prisma.chat.findFirst({
    where: {
      OR: [
        { hostAId: userId, hostBId: targetUserId },
        { hostAId: targetUserId, hostBId: userId }
      ]
    }
  });

  if (!chat) {
    chat = await prisma.chat.create({
      data: { hostAId: userId, hostBId: targetUserId }
    });
  }
  return { success: true, chatId: chat.id };
}

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


/**
 * Startet eine neue Pre-Party (4 Stunden Timer)
 */
export async function startPreParty(latitude: number, longitude: number, description: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("gloo_user_id")?.value;
  if (!userId) return { error: "Not authorized" };

  try {
    const group = await prisma.group.findUnique({ where: { userId } });
    if (!group) return { error: "You must create a group first to be able to host." };

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 4 * 60 * 60 * 1000);

    // Sicherheitsmaßnahme: Alte oder hängengebliebene Events dieses Nutzers löschen
    await prisma.event.deleteMany({ where: { ownerId: userId } });

    const newEvent = await prisma.event.create({
      data: {
        title: "Vorglühen",
        description: description || "Wir glühen vor! Kommt vorbei.",
        locationName: "Versteckt (Genauer Ort im Chat)", // Hausnummer bleibt verborgen
        latitude,
        longitude,
        startTime,
        endTime,
        ownerId: userId
      }
    });

    return { success: true, event: newEvent };
  } catch (error) {
    console.error("Error starting pre-party:", error);
    return { error: "Error starting pre-party" };
  }
}

/**
 * Beendet die Pre-Party manuell vor Ablauf der Zeit
 */
export async function stopPreParty() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("gloo_user_id")?.value;
  if (!userId) return { error: "Not authorized" };

  try {
    await prisma.event.deleteMany({ where: { ownerId: userId } });
    return { success: true };
  } catch (error) {
    console.error("Error stopping pre-party:", error);
    return { error: "Error stopping pre-party" };
  }
}

/**
 * Lädt alle aktiven Pre-Partys für die Karte. 
 * Blockiert Gastnutzer aus Datenschutzgründen.
 */
export async function getActiveEvents() {
  const cookieStore = await cookies();
  const isGuest = cookieStore.get("gloo_is_guest")?.value === "true";
  if (isGuest) return [];

  const now = new Date();
  try {
    return await prisma.event.findMany({
      where: { endTime: { gt: now } },
      include: {
        owner: { select: { name: true, group: true } },
        attendees: {
          include: {
            group: {
              select: { id: true, membersCount: true, photos: true, gender: true, user: { select: { name: true, username: true } }}
            }
          }
        }
      }
    });
  } catch (error) {
    return [];
  }
}


export async function getMyActiveEvent() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("gloo_user_id")?.value;
  if (!userId) return null;

  const now = new Date();
  try {
    return await prisma.event.findFirst({
      where: { ownerId: userId, endTime: { gt: now } }
    });
  } catch (error) {
    return null;
  }
}

export async function requestEventAttendance(eventId: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("gloo_user_id")?.value;
  if (!userId) return { error: "Nicht autorisiert" };

  try {
    const group = await prisma.group.findUnique({ where: { userId } });
    if (!group) return { error: "Gruppe erforderlich" };

    await prisma.eventAttendance.deleteMany({ where: { groupId: group.id } });

    await prisma.eventAttendance.create({
      data: { groupId: group.id, eventId: eventId, status: "PENDING" }
    });
    return { success: true };
  } catch (error) {
    return { error: "Fehler" };
  }
}

export async function respondToEventRequest(attendanceId: string, accept: boolean) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("gloo_user_id")?.value;
  if (!userId) return { error: "Nicht autorisiert" };

  try {
    const attendance = await prisma.eventAttendance.findUnique({
      where: { id: attendanceId },
      include: { event: true }
    });

    if (!attendance || attendance.event.ownerId !== userId) return { error: "Forbidden" };

    if (accept) {
      await prisma.eventAttendance.update({
        where: { id: attendanceId },
        data: { status: "ACCEPTED" }
      });
    } else {
      await prisma.eventAttendance.delete({ where: { id: attendanceId } });
    }
    return { success: true };
  } catch (error) {
    return { error: "Fehler" };
  }
}