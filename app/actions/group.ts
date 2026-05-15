"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Gender } from "@prisma/client";
import { cookies } from "next/headers";

export async function getGroupByUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("gloo_user_id")?.value;
  
  if (!userId) return null;

  return await prisma.group.findUnique({
    where: { userId: userId },
  });
}

export async function createGroupAction(formData: FormData, locale: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("gloo_user_id")?.value;
  
  if (!userId) throw new Error("User not found or unauthorized");

  const membersCount = Number(formData.get("membersCount")) || 1;
  const groupGender = (formData.get("groupGender") as Gender) || "ANY";

  const ageMin = Number(formData.get("ageMin")) || 18;
  const ageMax = Number(formData.get("ageMax")) || 30;

  const searchGender = (formData.get("searchGender") as Gender) || "ANY";
  const searchAgeMax = Number(formData.get("searchAgeMax")) || 35;
  const maxDistance = Number(formData.get("maxDistance")) || 10;

  const latitude = parseFloat(formData.get("latitude") as string);
  const longitude = parseFloat(formData.get("longitude") as string);

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


  const keptPhotos = formData.getAll("existingPhotos") as string[];


  const newPhotos: string[] = [];
  const uploadedFiles = formData.getAll("photos") as File[];

  for (const file of uploadedFiles) {
    if (file && typeof file === "object" && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;
      newPhotos.push(base64Image);
    }
  }

  const finalPhotos = [...keptPhotos, ...newPhotos];

  await prisma.group.upsert({
    where: { userId: userId },
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
      photos: finalPhotos,
      latitude: isNaN(latitude) ? null : latitude,
      longitude: isNaN(longitude) ? null : longitude,
    },
    create: {
      userId: userId,
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
      photos: finalPhotos,
      latitude: isNaN(latitude) ? null : latitude,
      longitude: isNaN(longitude) ? null : longitude,
    },
  });

  redirect(`/${locale}/dashboard`);
}