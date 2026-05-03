"use client";

import { useSession, signOut } from "next-auth/react";
import { useLocale } from "next-intl";
import Link from "next/link";

export default function Header() {
  const { data: session, status } = useSession();
  const locale = useLocale();

  const isGuest = status === "unauthenticated";

  return (
    <header className="flex items-center justify-between p-6 border-b border-white/10 bg-black">
      <div className="text-2xl font-black italic uppercase tracking-tighter">
        GLOO
      </div>

      <div className="flex items-center gap-4">
        {isGuest ? (
          // UI für GÄSTE
          <Link 
            href={`/${locale}/login`}
            className="text-sm font-bold hover:text-[#FF5733] transition-colors"
          >
            LOGIN
          </Link>
        ) : (
          // UI für EINGELOGGTE NUTZER
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">
              {session?.user?.name}
            </span>
            <button 
              onClick={() => signOut()}
              className="group relative"
            >
              {/* Hier wenden wir die Tailwind-Klassen für Profilbilder an */}
              <div className="h-10 w-10 rounded-full ring-2 ring-[#FF5733] overflow-hidden transition-transform group-hover:scale-105">
                <img 
                  src={`https://ui-avatars.com/api/?name=${session?.user?.name}&background=random`} 
                  alt="Profil"
                  className="h-full w-full object-cover"
                />
              </div>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}