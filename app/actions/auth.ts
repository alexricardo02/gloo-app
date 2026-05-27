"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


export async function registerUser(formData: FormData, locale: string) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const username = formData.get("username") as string;
  const name = formData.get("name") as string;

  const birthDateRaw = formData.get("birthDate") as string;
  if (!birthDateRaw) return { error: "Date of birth is required" };

  const birthDate = new Date(birthDateRaw);

  // Age validation
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }


  if (age < 18) {
    return { error: "You must be at least 18 years old to register." };
  }
  // encrypt password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Create user in database
    const user = await prisma.user.create({
      data: {
        email,
        username,
        name,
        password: hashedPassword,
        birthDate,
        isGuest: false,
      },
    });

    // Create session with cookies
    const cookieStore = await cookies();
    cookieStore.set("gloo_user_id", user.id, { httpOnly: true, path: "/" });
    cookieStore.delete("gloo_is_guest"); // if it was a guest user, remove the guest cookie
  } catch (error) {
    return { error: "Email already exists" };
  }
  redirect(`/${locale}/profile/create-group?from=register`);
}

export async function loginUser(formData: FormData, locale: string) {
  const identifier = formData.get("identifier") as string;
  const password = formData.get("password") as string;

  // Search user
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { username: identifier }
      ]
    }
  });
  
  if (!user) return { error: "Invalid credentials" };

  // Validate password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return { error: "Invalid credentials" };

  // Create session with cookies
  const cookieStore = await cookies();
  cookieStore.set("gloo_user_id", user.id, { httpOnly: true, path: "/" });
  cookieStore.delete("gloo_is_guest"); 

  redirect(`/${locale}/search-groups`);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("gloo_user_id")?.value;
  if (!userId) return null;

  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      username: true,
      image: true,
    }
  });
}

export async function logOutAction(locale: string) {
  const cookieStore = await cookies();
  
  cookieStore.delete("gloo_user_id");
  
  const guestId = crypto.randomUUID();
  
  cookieStore.set("gloo_is_guest", "true", {
    path: "/",
    maxAge: 60 * 60 * 24,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  cookieStore.set("gloo_guest_id", guestId, {
    path: "/",
    maxAge: 60 * 60 * 24,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  redirect(`/${locale}/login`);
}