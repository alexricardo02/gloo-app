"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function getGroupByUser() {
  const user = await prisma.user.findFirst();
  if (!user) return null;

  return await prisma.group.findUnique({
    where: { userId: user.id },
  });
}

export async function createGroupAction(formData: FormData, locale: string) {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("User not found");

  const membersCount = Number(formData.get("membersCount")) || 1;
  const groupGender = String(formData.get("groupGender") || "ANY");

  const ageMin = Number(formData.get("ageMin")) || 18;
  const ageMax = Number(formData.get("ageMax")) || 30;

  const searchGender = String(formData.get("searchGender") || "ANY");
  const searchAgeMax = Number(formData.get("searchAgeMax")) || 35;
  const maxDistance = Number(formData.get("maxDistance")) || 10;

  const publicProfile = ["true", "on", "1"].includes(
    String(formData.get("publicProfile"))
  );

  const description = String(formData.get("description") || "");

  const instagram: string[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("instagram")) {
      instagram.push(String(value).replace("@", ""));
    }
  }

  const photos: string[] = [];

  await prisma.group.upsert({
    where: { userId: user.id },
    update: {
      membersCount,
      gender: groupGender,
      ageMin,
      ageMax,
      searchGender,
      searchAgeMax,
      maxDistance,
      publicProfile,
      description,
      instagram,
      photos,
    },
    create: {
      userId: user.id,
      membersCount,
      gender: groupGender,
      ageMin,
      ageMax,
      searchGender,
      searchAgeMax,
      maxDistance,
      publicProfile,
      description,
      instagram,
      photos,
    },
  });

  redirect(`/${locale}/profile`);
}
