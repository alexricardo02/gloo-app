"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Meldet einen Nutzer als Gast an, indem temporäre Cookies gesetzt werden.
 */
export async function loginAsGuest(locale: string) {
  // 1. Unique id generieren
  const guestId = crypto.randomUUID();
  
  // 2. Cookies-Instanz holen
  const cookieStore = await cookies();

  // 3. Guest-Flag setzen (für UI-Zustände wie Blur/Paywall)
  cookieStore.set("gloo_is_guest", "true", {
    path: "/",
    maxAge: 60 * 60 * 24, // 24 Stunden gültig
    httpOnly: true,       // Schutz gegen XSS
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  // 4. Temporäre Guest-ID speichern (wichtig für GameScores laut Prisma-Schema)
  cookieStore.set("gloo_guest_id", guestId, {
    path: "/",
    maxAge: 60 * 60 * 24,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  // Nach dem Setzen der Cookies zum Dashboard weiterleiten
  redirect(`/${locale}/dashboard`);
}

/**
 * Löscht die Gast-Sitzung (z.B. beim echten Login oder Logout).
 */
export async function clearGuestSession() {
  const cookieStore = await cookies();
  cookieStore.delete("gloo_is_guest");
  cookieStore.delete("gloo_guest_id");
}

/**
 * Prüft serverseitig, ob der aktuelle Nutzer ein Gast ist.
 * Wird in Server Components oder anderen Server Actions verwendet.
 */
export async function checkIsGuest() {
  const cookieStore = await cookies();
  return cookieStore.get("gloo_is_guest")?.value === "true";
}

/**
 * Erhält die aktuelle Guest-ID aus den Cookies.
 * Nützlich, um GameScores in der DB einem Gast zuzuordnen.
 */
export async function getGuestId() {
  const cookieStore = await cookies();
  return cookieStore.get("gloo_guest_id")?.value || null;
}