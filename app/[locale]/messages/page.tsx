"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import Navigation from "@/app/components/Navigation";
import { Search, MoreVertical, CheckCheck, Loader2 } from "lucide-react";
import Image from "next/image";
import { getActiveChats } from "@/app/actions/chat";
import { supabase } from "@/lib/supabase";

type ChatPreview = {
  id: string;
  name: string;
  lastMessage: string;
  time: Date | string;
  unread: number;
  image: string;
};

export default function MessagesPage() {
  const locale = useLocale();
  const t = useTranslations("Messages"); 
  const [searchQuery, setSearchQuery] = useState("");

  // States to handle real data fetching
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hook to load chats when entering the page
  const loadChats = useCallback(async () => {
    const response = await getActiveChats();
    if (response.success && response.chats) {
      setChats(response.chats as ChatPreview[]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // 1. Initial load from the database (Prisma)
    loadChats();

    // 2. Subscription to Supabase WebSockets (Realtime)
    const channel = supabase
      .channel("realtime_messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Message" },
        (payload) => {
          // When a new message arrives in the database:
          const newMessage = payload.new;

          setChats((currentChats) => {
            // Check if the message belongs to a chat already in our list
            const chatIndex = currentChats.findIndex((c) => c.id === newMessage.chatId);

            if (chatIndex > -1) {
              // Copy the existing chat and update its data
              const updatedChat = {
                ...currentChats[chatIndex],
                lastMessage: newMessage.text, // New message text
                time: newMessage.createdAt,   // New message time
                unread: currentChats[chatIndex].unread + 1, // Increment unread counter
              };

              // Remove the chat from its old position
              const newChatsList = [...currentChats];
              newChatsList.splice(chatIndex, 1);
              
              // Move it to the top of the list (Dynamic reordering)
              newChatsList.unshift(updatedChat);
              
              return newChatsList;
            } else {
              // If the message is from a NEW chat not in the list, 
              // fetch from the server again to get all data (photo, name, etc.)
              loadChats();
              return currentChats;
            }
          });
        }
      )
      .subscribe();

    // 3. Cleanup: Disconnect from the WebSocket when the user leaves the screen
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadChats]);
  

  const formatMessageTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth();
    
    if (isToday) {
      return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString(locale, { weekday: 'short' });
  };

  // Real-time search filtering
  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-32">
      
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-md z-30 pt-12 pb-4 px-6 border-b border-white/5">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black italic uppercase tracking-tight">{t("title")}</h1>
          <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-500" />
          </div>
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111111] text-sm text-white rounded-full py-3 pl-11 pr-4 border border-white/10 focus:outline-none focus:border-[#FF725E]/50 transition-colors placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* Chat List (Scrollable) */}
      <div className="pt-40 px-4">
        
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-[#FF725E]" size={30} />
          </div>
        )}

        <div className="flex flex-col gap-2">
          {!isLoading && filteredChats.map((chat) => (
            <button 
              key={chat.id}
              className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors text-left group"
            >
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 relative bg-zinc-900">
                  <Image
                    src={chat.image}
                    alt={chat.name}
                    fill
                    className="object-cover"
                  />
                </div>
                {chat.unread > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF725E] rounded-full border-2 border-black" />
                )}
              </div>

              <div className="flex-1 min-w-0 border-b border-white/5 pb-3 group-last:border-0">
                <div className="flex justify-between items-center mb-1 pr-2">
                  {/* CONDITIONAL BOLD TEXT: If there are unread messages, highlight the name */}
                  <h3 className={`text-base truncate ${chat.unread > 0 ? "font-black text-white" : "font-bold text-gray-200"}`}>
                    {chat.name}
                  </h3>
                  <span className={`text-[10px] shrink-0 ml-2 ${chat.unread > 0 ? "text-[#FF725E] font-bold" : "text-gray-500 font-medium"}`}>
                    {formatMessageTime(chat.time)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className={`text-sm line-clamp-1 flex-1 pr-4 ${chat.unread > 0 ? "text-white font-semibold" : "text-gray-400"}`}>
                    {chat.lastMessage}
                  </p>
                  
                  {chat.unread > 0 ? (
                    <div className="bg-[#FF725E] text-black text-[10px] font-black min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center">
                      {chat.unread}
                    </div>
                  ) : (
                    <CheckCheck size={14} className="text-blue-500 shrink-0" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {!isLoading && chats.length === 0 && (
        <div className="flex flex-col items-center justify-center pt-20 px-10 text-center animate-in fade-in">
          <div className="w-20 h-20 bg-[#111111] rounded-full flex items-center justify-center mb-4 border border-white/5">
            <Search size={30} className="text-[#FF725E]/50" />
          </div>
          <h2 className="text-xl font-bold mb-2 uppercase italic tracking-tight">{t("emptyTitle")}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            {t("emptyDesc")}
          </p>
        </div>
      )}

      <Navigation />
    </div>
  );
}