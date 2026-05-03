"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// 1. Login als Gast
export async function loginAsGuest(locale: string) {
  const guestId = crypto.randomUUID();
  const cookieStore = await cookies();

  // Flag für Gast-Status
  cookieStore.set("gloo_is_guest", "true", {
    path: "/",
    maxAge: 60 * 60 * 24, // 24h
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  // Eindeutige Gast-ID (nützlich für temporäre DB-Einträge)
  cookieStore.set("gloo_guest_id", guestId, {
    path: "/",
    maxAge: 60 * 60 * 24,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  redirect(`/${locale}/dashboard`);
}

// 2. Abfrage: Ist es ein Gast?
export async function checkIsGuest() {
  const cookieStore = await cookies();
  return cookieStore.get("gloo_is_guest")?.value === "true";
}

// 3. NEU: Gast-Profil abrufen (Einzelnes Objekt statt Liste)
export async function getGuestProfile() {
  const isGuest = await checkIsGuest();
  
  if (!isGuest) return null;

  // Hier würdest du normalerweise einen "Demo-User" aus deiner DB ziehen.
  // Da du gerade testest, geben wir ein sauberes Mock-Objekt zurück:
  return {
    id: "guest-temp-id",
    name: "GLOO Guest",
    image: "https://i.pravatar.cc/150?u=guest", // Dank deiner Config jetzt erlaubt
    role: "GUEST",
    isPublic: true
  };
}

// 4. Logout
export async function clearGuestSession() {
  const cookieStore = await cookies();
  cookieStore.delete("gloo_is_guest");
  cookieStore.delete("gloo_guest_id");
  
  // Optional: Redirect zur Startseite nach dem Logout
  redirect("/");
}