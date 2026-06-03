"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

/**
 * Sends a message to an existing chat. Validates that the sender
 * is a participant, the text is non-empty, and persists to the DB.
 * Returns the created message so the client can optimistically render.
 */
export async function sendMessage(chatId: string, text: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("gloo_user_id")?.value;

  if (!userId) return { error: "Unauthorized" };

  const trimmed = text.trim();
  if (!trimmed) return { error: "Message cannot be empty" };

  try {
    // Verify that the caller is a participant of this chat
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: { hostAId: true, hostBId: true },
    });

    if (!chat) return { error: "Chat not found" };
    if (chat.hostAId !== userId && chat.hostBId !== userId) {
      return { error: "Forbidden" };
    }

    const message = await prisma.message.create({
      data: {
        chatId,
        senderId: userId,
        text: trimmed,
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
    });

    return { success: true, message };
  } catch (error) {
    console.error("Error sending message:", error);
    return { error: "Failed to send message. Please check your connection and try again." };
  }
}

/**
 * Loads all messages for a specific chat, ordered chronologically,
 * along with the chat partner's info.
 * Only returns data if the current user is a participant.
 */
export async function getChatMessages(chatId: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("gloo_user_id")?.value;

  if (!userId) return { error: "Unauthorized" };

  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        hostA: { include: { group: true } },
        hostB: { include: { group: true } },
      },
    });

    if (!chat) return { error: "Chat not found" };
    if (chat.hostAId !== userId && chat.hostBId !== userId) {
      return { error: "Forbidden" };
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
    });

    // Determine the chat partner
    const partner = chat.hostAId === userId ? chat.hostB : chat.hostA;
    const partnerGroup = partner.group;

    return {
      success: true,
      messages,
      userId,
      partner: {
        id: partner.id,
        name: partner.name || "Unknown User",
        image: partnerGroup?.photos?.[0] || partner.image || "/images/bg-fallback.jpg",
      },
    };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { error: "Failed to load messages" };
  }
}

/**
 * Finds an existing chat between the current user and the target group's
 * host, or creates a new one. Returns the chatId for navigation.
 */
export async function getOrCreateChat(targetUserId: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("gloo_user_id")?.value;

  if (!userId) return { error: "Unauthorized" };

  if (targetUserId === userId) return { error: "Cannot chat with yourself" };

  try {
    // Look for an existing chat between these two users
    const existing = await prisma.chat.findFirst({
      where: {
        OR: [
          { hostAId: userId, hostBId: targetUserId },
          { hostAId: targetUserId, hostBId: userId },
        ],
      },
      select: { id: true },
    });

    if (existing) return { success: true, chatId: existing.id };

    // Create a new chat
    const chat = await prisma.chat.create({
      data: { hostAId: userId, hostBId: targetUserId },
      select: { id: true },
    });

    return { success: true, chatId: chat.id };
  } catch (error) {
    console.error("Error getting or creating chat:", error);
    return { error: "Failed to open chat" };
  }
}

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
      const lastMessageText = lastMsg?.text || "No messages yet";
      const isMatch = lastMessageText.toLowerCase().includes("match");

      return {
        id: chat.id,
        // Since groups don't have names, we use the host's name
        name: otherHost.name || "Unknown User",
        // Notice we use 'text' as defined in your schema.prisma
        lastMessage: lastMessageText,
        time: lastMsg?.createdAt || chat.createdAt,
        unread: 0, // Will be implemented dynamically later via WebSockets
        isMatch,
        // Fallback sequentially: Group photo -> User profile image -> Fallback image
        image: otherGroup?.photos?.[0] || otherHost.image || "/images/bg-fallback.jpg", 
      };
    });

    // 3. PRIORITIZE MATCHED CHATS THEN NEWEST MESSAGES
    formattedChats.sort((a, b) => {
      if (a.isMatch !== b.isMatch) {
        return a.isMatch ? -1 : 1;
      }
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