"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Navigation from "@/app/components/Navigation";
import { Search, MoreVertical, CheckCheck } from "lucide-react";
import Image from "next/image";

export default function MessagesPage() {
  const locale = useLocale();
  const t = useTranslations("Messages"); 
  const [searchQuery, setSearchQuery] = useState("");

  const chats = [
    {
      id: 1,
      name: "The Party Animals",
      lastMessage: "See you guys at the bar tonight!",
      time: "9:41 AM",
      unread: 2,
      image: "/images/vorgluehen.jpg",
    },
    {
      id: 2,
      name: "Mainz Crew",
      lastMessage: "Is anyone bringing drinks?",
      time: "Yesterday",
      unread: 0,
      image: "/gloo-icon-main.png",
    },
    {
      id: 3,
      name: "Techno Vibes",
      lastMessage: "The DJ is amazing!",
      time: "Wednesday",
      unread: 0,
      image: "/images/bg-fallback.jpg",
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-32">
      
      {/* Header */}
      <div className="p-6 pt-12 flex justify-between items-center">
        <h1 className="text-3xl font-extrabold tracking-tight">
          {t("title")}
        </h1>
        <button className="p-2 bg-[#111111] rounded-full border border-white/5">
          <MoreVertical size={20} className="text-gray-400" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111111] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#FF725E]/50 transition-colors"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="px-2">
        <div className="space-y-1">
          {chats.map((chat) => (
            <button
              key={chat.id}
              className="w-full p-4 flex items-center gap-4 hover:bg-[#111111] transition-colors rounded-[2rem]"
            >
              {/* Avatar */}
              <div className="relative w-14 h-14 flex-shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden border border-white/10">
                  <img
                    src={chat.image}
                    alt={chat.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Online Indicator (Optional) */}
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-black rounded-full"></div>
              </div>

              {/* Chat Info */}
              <div className="flex-1 text-left">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-base line-clamp-1">{chat.name}</h3>
                  <span className="text-[10px] text-gray-500 font-medium">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400 line-clamp-1 flex-1 pr-4">
                    {chat.lastMessage}
                  </p>
                  
                  {chat.unread > 0 ? (
                    <div className="bg-[#FF725E] text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                      {chat.unread}
                    </div>
                  ) : (
                    <CheckCheck size={14} className="text-blue-500" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Empty State Helper (Only visible if no chats) */}
      {chats.length === 0 && (
        <div className="flex flex-col items-center justify-center pt-20 px-10 text-center">
          <div className="w-20 h-20 bg-[#111111] rounded-full flex items-center justify-center mb-4 border border-white/5">
            <Search size={30} className="text-gray-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">{t("emptyTitle")}</h2>
          <p className="text-gray-500 text-sm">
            {t("emptyDesc")}
          </p>
        </div>
      )}

      {/* Navigation Bar */}
      <Navigation/>
      
    </div>
  );
}