"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Compass, Map, MessageSquare, User, LogIn, Gamepad2 } from "lucide-react";

interface NavigationProps {
  isGuest?: boolean;
  onSecureClick?: (e: React.MouseEvent) => void;
}

export default function Navigation({ isGuest, onSecureClick }: NavigationProps) {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("Dashboard");

  const navItems = [
    {
      label: t("navGroups"), // "Groups" / "Discover"
      href: `/${locale}/pre-party`,
      icon: Compass,
    },
    {
      label: t("enterGames") || "Games", // "Games" 
      href: `/${locale}/games`,
      icon: Gamepad2,
    },
    {
      label: t("navMap"), // "Map"
      href: `/${locale}/map`,
      icon: Map,
    },
    {
      label: t("navMessages"), // "Messages"
      href: `/${locale}/messages`,
      icon: MessageSquare,
    },
    {
      label: t("navProfile"), // "My Profile"
      href: `/${locale}/profile`,
      icon: User,
    },
  ];

  const handleNavigation = (e: React.MouseEvent, item: any) => {
    if (isGuest && item.id !== 'Home' && item.id !== 'Login' && onSecureClick) {
      onSecureClick(e);
      return;
    }


    router.push(`/${locale}${item.path}`);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10 z-40 px-4 pb-5 pt-3 safe-bottom">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Check if the current route matches the navigation item link to apply active styling
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 min-w-0 transition-all duration-200 relative group"
            >
              {/* Icon layout with dynamic color matching Gloo's brand alignment */}
              <div
                className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "text-[#FF725E] scale-110" 
                    : "text-gray-500 group-hover:text-gray-300"
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>

              {/* Text label with overflow protection for smaller smartphone screens */}
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
            </Link>
          );
        })}
      </div>
    </nav>
  );
}