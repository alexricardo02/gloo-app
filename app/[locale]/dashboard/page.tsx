"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { checkIsGuest } from "@/app/actions/guest"; // Importiere deine Action

const MOCK_GROUP = {
  id: "1",
  hostName: "Thomas & Friends",
  description: "Pre-drinking at my place, then heading to the club!",
  membersCount: 4,
  distance: "0.8 km",
  imageUrl: "https://images.unsplash.com/photo-1514525253361-bee8a48740d3?q=80&w=1000&auto=format&fit=crop",
  instaLink: "@thomas_party"
};

export default function MainDashboard() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const router = useRouter();

  // Initialer Status: Wir starten konservativ als Gast, bis die Prüfung durch ist
  const [isGuest, setIsGuest] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const guestStatus = await checkIsGuest();
      setIsGuest(guestStatus);
      setLoading(false);
    }
    initAuth();
  }, []);

  const handleProtectedAction = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (isGuest) {
      // Nutzt das schicke Overlay, aber falls jemand Buttons erzwingt:
      router.push(`/${locale}/register`);
    }
  };

  if (loading) return <div className="min-h-screen bg-black" />; // Kurzer Lade-State

  return (
    <div className={`min-h-screen bg-black text-white ${isGuest ? "h-screen overflow-hidden" : ""}`}>
      
      {/* Header Bereich */}
      <header className="p-6 flex justify-between items-center bg-gradient-to-b from-black to-transparent fixed top-0 w-full z-40">
        <h1 className="text-2xl font-bold text-[#FF5733] tracking-tighter">gloo</h1>
        {!isGuest && (
            <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-[#FF5733] overflow-hidden">
                <img src="https://i.pravatar.cc/100?u=me" alt="Profile" />
            </div>
        )}
      </header>

      {/* Haupt-Sektion: Gruppe ansehen */}
      <main className="relative h-screen w-full flex flex-col justify-end">
        
        {/* Gruppenbild mit Gaußscher Unschärfe für Gäste */}
        <div className="absolute inset-0 z-0">
          <Image
            src={MOCK_GROUP.imageUrl}
            alt="Group"
            fill
            priority
            className={`object-cover transition-all duration-1000 ease-in-out ${isGuest ? "blur-3xl scale-125 opacity-50" : "blur-0 scale-100 opacity-100"}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>

        {/* Gruppen-Informationen */}
        <div className="relative z-10 p-8 mb-24">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-[#FF5733] text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-[0.2em]">
              {isGuest ? "Anonyme Gruppe" : "Live Now"}
            </span>
            <span className="text-xs font-medium text-white/60">{MOCK_GROUP.distance} entfernt</span>
          </div>

          <h2 className="text-4xl font-black mb-3 tracking-tight">
            {isGuest ? `Gruppe (${MOCK_GROUP.membersCount} Personen)` : MOCK_GROUP.hostName}
          </h2>

          <p className="text-white/70 text-base leading-relaxed mb-8 max-w-sm">
            {isGuest 
              ? "Registriere dich, um die Details und den Treffpunkt dieser Gruppe zu sehen." 
              : MOCK_GROUP.description}
          </p>

          {/* Interaktions-Buttons */}
          <div className="flex gap-3">
            <button 
              onClick={handleProtectedAction}
              className="flex-1 bg-white text-black font-extrabold py-4 rounded-2xl active:scale-95 transition-all"
            >
              {t("navMessages")}
            </button>
            <button 
              onClick={handleProtectedAction}
              className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 active:scale-90 transition-all"
            >
              <InstagramIcon />
            </button>
          </div>
        </div>

        {/* GAST-OVERLAY */}
        {isGuest && (
          <div className="absolute inset-0 z-30 bg-black/20 backdrop-blur-[2px] flex items-end">
            <div className="w-full bg-white rounded-t-[2.5rem] p-10 flex flex-col items-center text-center shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
              <div className="w-12 h-1 bg-zinc-200 rounded-full mb-8" />
              
              <h3 className="text-zinc-900 text-2xl font-black mb-3">
                {t("loginPromptTitle") || "Bereit für die Nacht?"}
              </h3>
              <p className="text-zinc-500 mb-8 max-w-[250px] leading-snug">
                {t("loginPromptDesc") || "Erstelle ein Profil, um Gruppen beizutreten und Leute zu treffen."}
              </p>
              
              <button 
                onClick={() => router.push(`/${locale}/register`)}
                className="w-full bg-[#FF5733] text-white font-bold py-5 rounded-2xl shadow-lg shadow-[#FF5733]/40 active:scale-[0.98] transition-all"
              >
                {t("loginButton") || "Jetzt beitreten"}
              </button>
              
              <button 
                onClick={() => router.push(`/${locale}/login`)}
                className="mt-6 text-zinc-400 text-sm font-semibold hover:text-zinc-600 transition-colors"
              >
                Bereits ein Konto? Einloggen
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Nav-Bar (Nur für registrierte User) */}
      {!isGuest && (
        <nav className="fixed bottom-0 w-full bg-black/60 backdrop-blur-2xl border-t border-white/5 p-5 flex justify-around z-50">
           <div className="text-[#FF5733]">Explore</div>
           <div className="opacity-40">Map</div>
           <div className="opacity-40">Chat</div>
        </nav>
      )}
    </div>
  );
}

// Kleines Hilfs-Icon
function InstagramIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
    )
}