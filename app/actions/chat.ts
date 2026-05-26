"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function getActiveChats() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("gloo_user_id")?.value;

  if (!userId) return { error: "Unauthorized" };

  try {
    // 1. Fetch all chats where the current user is either Host A or Host B
    const chats = await prisma.chat.findMany({
      where: {
        OR: [
          { hostAId: userId },
          { hostBId: userId }
        ]
      },
      include: {
        // Include both hosts and their respective groups to retrieve names and photos
        hostA: {
          include: { group: true }
        },
        hostB: {
          include: { group: true }
        },
        // Fetch ONLY the last message for the preview snippet
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        }
      }
    });

    // 2. Format the data to make it easily consumable by the frontend
    const formattedChats = chats.map(chat => {
      // Determine who the other participant in the chat is
      const isUserHostA = chat.hostAId === userId;
      const otherHost = isUserHostA ? chat.hostB : chat.hostA;
      
      const otherGroup = otherHost.group;
      const lastMsg = chat.messages[0];

      return {
        id: chat.id,
        // Since groups don't have names, we use the host's name
        name: otherHost.name || "Unknown User",
        // Notice we use 'text' as defined in your schema.prisma
        lastMessage: lastMsg?.text || "No messages yet", 
        time: lastMsg?.createdAt || chat.createdAt,
        unread: 0, // Will be implemented dynamically later via WebSockets
        // Fallback sequentially: Group photo -> User profile image -> Fallback image
        image: otherGroup?.photos?.[0] || otherHost.image || "/images/bg-fallback.jpg", 
      };
    });

    // 3. STRICT CHRONOLOGICAL SORTING
    // Sort chats based on the timestamp of the last message (newest first)
    formattedChats.sort((a, b) => {
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();
      return timeB - timeA; 
    });

    return { success: true, chats: formattedChats };
    
  } catch (error) {
    console.error("Error fetching chats:", error);
    return { error: "Failed to fetch chats" };
  }
}