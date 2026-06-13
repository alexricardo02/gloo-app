"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

/**
 * Helper: checks if either participant in a chat has blocked the other.
 * Returns true if a block exists (conversation should be hidden).
 */
async function isChatBlocked(userId: string, otherUserId: string) {
  const [myGroup, otherGroup] = await Promise.all([
    prisma.group.findUnique({ where: { userId }, select: { id: true } }),
    prisma.group.findUnique({ where: { userId: otherUserId }, select: { id: true } }),
  ]);

  if (!myGroup || !otherGroup) return false;

  const block = await prisma.groupBlock.findFirst({
    where: {
      OR: [
        { blockerId: userId, blockedGroupId: otherGroup.id },
        { blockerId: otherUserId, blockedGroupId: myGroup.id },
      ],
    },
  });

  return block !== null;
}

/**
 * Sends a message to an existing chat. Validates that the sender
 * is a participant, the text is non-empty, the chat is not blocked,
 * and persists to the DB.
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

    const otherUserId = chat.hostAId === userId ? chat.hostBId : chat.hostAId;

    // ST0-88: Prevent messages if either user has blocked the other
    const blocked = await isChatBlocked(userId, otherUserId);
    if (blocked) return { error: "This conversation is no longer available." };

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

    const otherUserId = chat.hostAId === userId ? chat.hostBId : chat.hostAId;

    // ST0-88: Check if either user has blocked the other
    const blocked = await isChatBlocked(userId, otherUserId);
    if (blocked) return { error: "This conversation is no longer available." };

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
    // ST0-88: Get IDs of groups the current user has blocked or been blocked by
    const myGroup = await prisma.group.findUnique({
      where: { userId },
      select: { id: true },
    });

    let blockedGroupIds: string[] = [];
    let blockedByUserIds: string[] = [];

    if (myGroup) {
      // Groups I have blocked
      const blocksByMe = await prisma.groupBlock.findMany({
        where: { blockerId: userId },
        select: { blockedGroupId: true },
      });
      blockedGroupIds = blocksByMe.map((b) => b.blockedGroupId);

      // Users who have blocked my group
      const blocksOnMe = await prisma.groupBlock.findMany({
        where: { blockedGroupId: myGroup.id },
        select: { blockerId: true },
      });
      blockedByUserIds = blocksOnMe.map((b) => b.blockerId);
    }

    // Get userIds for groups I've blocked (to exclude their chats)
    let blockedUserIds: string[] = [];
    if (blockedGroupIds.length > 0) {
      const blockedGroups = await prisma.group.findMany({
        where: { id: { in: blockedGroupIds } },
        select: { userId: true },
      });
      blockedUserIds = blockedGroups.map((g) => g.userId);
    }

    // Combine: users I've blocked + users who blocked me
    const allBlockedUserIds = [...new Set([...blockedUserIds, ...blockedByUserIds])];

    // 1. Fetch all chats where the current user is either Host A or Host B
    const chats = await prisma.chat.findMany({
      where: {
        OR: [
          { hostAId: userId },
          { hostBId: userId }
        ],
        // ST0-88: Exclude chats with blocked users
        ...(allBlockedUserIds.length > 0 ? {
          NOT: [
            { hostAId: { in: allBlockedUserIds }, hostBId: userId },
            { hostAId: userId, hostBId: { in: allBlockedUserIds } },
          ],
        } : {}),
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