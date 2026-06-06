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


/**
 * Startet eine neue Pre-Party (4 Stunden Timer)
 */
export async function startPreParty(latitude: number, longitude: number, description: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("gloo_user_id")?.value;
  if (!userId) return { error: "Nicht autorisiert" };

  try {
    const group = await prisma.group.findUnique({ where: { userId } });
    if (!group) return { error: "Du musst zuerst eine Gruppe erstellen, um hosten zu können." };

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
    return { error: "Fehler beim Starten der Party" };
  }
}

/**
 * Beendet die Pre-Party manuell vor Ablauf der Zeit
 */
export async function stopPreParty() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("gloo_user_id")?.value;
  if (!userId) return { error: "Nicht autorisiert" };

  try {
    await prisma.event.deleteMany({ where: { ownerId: userId } });
    return { success: true };
  } catch (error) {
    console.error("Error stopping pre-party:", error);
    return { error: "Fehler beim Beenden der Party" };
  }
}

/**
 * Lädt alle aktiven Pre-Partys für die Karte. 
 * Blockiert Gastnutzer aus Datenschutzgründen.
 */
export async function getActiveEvents() {
  const cookieStore = await cookies();
  const isGuest = cookieStore.get("gloo_is_guest")?.value === "true";

  // Gastnutzer sehen keine Privat-Marker
  if (isGuest) return [];

  const now = new Date();
  try {
    return await prisma.event.findMany({
      where: { 
        endTime: { gt: now }
      },
      include: {
        owner: {
          select: {
            name: true,
            group: true
          }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching active events:", error);
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
      where: { 
        ownerId: userId,
        endTime: { gt: now }
      }
    });
  } catch (error) {
    return null;
  }
}