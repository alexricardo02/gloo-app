"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAsGuest(locale: string) {
  // 1. Unique id
  const guestId = crypto.randomUUID();
  
  // 2. Cookies from the browser
  const cookieStore = await cookies();

  // 3. Save the guest session cookie
  cookieStore.set("gloo_is_guest", "true", {
    path: "/",
    maxAge: 60 * 60 * 24, // 24hs
    httpOnly: true,       // avoid xss
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  // 4. save the temporary guest ID cookie
  cookieStore.set("gloo_guest_id", guestId, {
    path: "/",
    maxAge: 60 * 60 * 24,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  redirect(`/${locale}/dashboard`);
}

export async function clearGuestSession() {
  const cookieStore = await cookies();
  cookieStore.delete("gloo_is_guest");
  cookieStore.delete("gloo_guest_id");
}