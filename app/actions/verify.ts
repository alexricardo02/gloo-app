"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function verifyAccountAction(token: string, locale: string) {
  if (!token) return { error: "invalidTokenError" };

  // User lookup by token
  const user = await prisma.user.findUnique({
    where: { verificationToken: token },
  });

  if (!user) {
    return { error: "invalidTokenError" };
  }

  // Mark account as verified and clear token
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      isVerified: true, 
      verificationToken: null 
    },
  });

  // Create session
  const cookieStore = await cookies();
  cookieStore.set("gloo_user_id", user.id, { httpOnly: true, path: "/" });
  cookieStore.delete("gloo_is_guest"); 

  redirect(`/${locale}/search-groups`);
}