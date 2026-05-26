"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Compass, Map, MessageSquare, User, LogIn, Gamepad2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface NavigationProps {
  isGuest?: boolean;
  onSecureClick?: (e: React.MouseEvent) => void;
}

export default function Navigation({ isGuest, onSecureClick }: NavigationProps) {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("Dashboard");

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // 1. Reset the notification badge when the user enters the messages tab
    if (pathname.includes(`/${locale}/messages`)) {
      setUnreadCount(0);
    }

    // 2. Global Subscription to listen for new incoming messages anywhere in the app
    const channel = supabase
      .channel("global_navigation_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Message" },
        () => {
          // If a new message is inserted and the user is NOT on the messages page, increment badge
          if (!pathname.includes(`/${locale}/messages`)) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pathname, locale]);

  const navItems = [
    {
      id: "discover",
      label: t("navGroups"), 
      href: `/${locale}/pre-party`,
      icon: Compass,
    },
    {
      id: "games",
      label: t("enterGames") || "Games", 
      href: `/${locale}/games`,
      icon: Gamepad2,
    },
    {
      id: "map",
      label: t("navMap"), 
      href: `/${locale}/map`,
      icon: Map,
    },
    {
      id: "messages",
      label: t("navMessages"), 
      href: `/${locale}/messages`,
      icon: MessageSquare,
    },
    {
      id: "profile",
      label: t("navProfile"), 
      href: `/${locale}/profile`,
      icon: User,
    },
  ];

  const handleNavigation = (e: React.MouseEvent, item: any) => {
    e.preventDefault(); // Prevent default behavior just in case

    // If the user is a guest, and the click handler is provided, 
    // AND they are trying to access restricted areas (messages, profile)
    if (isGuest && onSecureClick && (item.id === "messages" || item.id === "profile")) {
      onSecureClick(e);
      return;
    }

    // Otherwise (including for 'games', 'discover', and 'map'), navigate normally
    router.push(item.href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10 z-40 px-4 pb-5 pt-3 safe-bottom">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isMessagesTab = item.icon === MessageSquare;

          return (
            <button
              key={item.href}
              onClick={(e) => handleNavigation(e, item)}
              className="flex flex-col items-center justify-center flex-1 min-w-0 transition-all duration-200 relative group bg-transparent border-none cursor-pointer"
            >
              {/* Icon layout with dynamic color matching */}
              <div
                className={`p-1.5 rounded-xl transition-all duration-200 relative ${
                  isActive 
                    ? "text-[#FF725E] scale-110" 
                    : "text-gray-500 group-hover:text-gray-300"
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                
                {/* DYNAMIC NOTIFICATION BADGE */}
                {isMessagesTab && unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF725E] text-black text-[10px] font-black flex items-center justify-center rounded-full border-2 border-black animate-in zoom-in">
                    {unreadCount}
                  </div>
                )}
              </div>

              {/* Text label */}
              <span
                className={`text-[10px] font-bold tracking-wide uppercase mt-0.5 truncate max-w-full block transition-colors duration-200 ${
                  isActive ? "text-[#FF725E]" : "text-gray-500"
                }`}
              >
                {item.label}
              </span>

              {/* Subtle top indicator bar for active states */}
              {isActive && (
                <div className="absolute -top-3 w-8 h-0.5 bg-[#FF725E] rounded-full shadow-[0_0_10px_#FF725E]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}