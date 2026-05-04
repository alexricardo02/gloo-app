"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Home, Users, Map, MessageSquare, User } from "lucide-react";

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
    { id: 'Home', label: t('navHome'), icon: <Home className="w-6 h-6" />, path: '/dashboard' },
    { id: 'Groups', label: t('navGroups'), icon: <Users className="w-6 h-6" />, path: '/dashboard' },
    { id: 'Map', label: t('navMap'), icon: <Map className="w-6 h-6" />, path: '/dashboard' },
    { id: 'Messages', label: t('navMessages'), icon: <MessageSquare className="w-6 h-6" />, path: '/dashboard' },
    { id: 'Profile', label: t('navProfile'), icon: <User className="w-6 h-6" />, path: '/profile' },
  ];

  const handleNavigation = (e: React.MouseEvent, item: typeof navItems[0]) => {
    if (item.id !== 'Home' && isGuest && onSecureClick) {
      onSecureClick(e);
      return;
    }


    router.push(`/${locale}${item.path}`);
  };

  return (
    <footer className="fixed bottom-0 w-full bg-white border-t py-4 flex justify-around z-50 pb-8 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] rounded-t-[2.5rem]">
      {navItems.map((item) => {
        const isActive = pathname.includes(item.path);
        
        return (
          <button 
            key={item.id} 
            onClick={(e) => handleNavigation(e, item)}
            className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-[#FF5733] scale-110' : 'text-gray-400'}`}
          >
            <div className={isActive ? "text-[#FF5733]" : "text-gray-400"}>
              {item.icon}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {item.label}
            </span>
          </button>
        );
      })}
    </footer>
  );
}