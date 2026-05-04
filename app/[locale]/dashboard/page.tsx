"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { checkIsGuest } from "@/app/actions/guest";

interface PreviewGroup {
  imageUrl: string;
  memberCount: number;
  distance: string;
}

export default function MainDashboard() {
  const [activeTab, setActiveTab] = useState("Home");
  const [isGuest, setIsGuest] = useState(false);
  const [previewGroup, setPreviewGroup] = useState<PreviewGroup | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    const initDashboard = async () => {
      const status = await checkIsGuest();
      setIsGuest(status);

      if (status) {
        setPreviewGroup({
          imageUrl: "/images/bg-fallback.jpg",
          memberCount: 4,
          distance: "0.8 km"
        });
      }
    };
    initDashboard();

    const handleScroll = () => {
      if (isGuest && window.scrollY > 100) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setShowPaywall(true);
      }
    };

    if (isGuest) {
      window.addEventListener("scroll", handleScroll);
    }
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isGuest]);

  // ZENTRALE INTERAKTIONS-LOGIK (Dein Szenario)
  const handleSecureInteraction = (e: React.MouseEvent, targetUrl?: string) => {
    if (isGuest) {
      e.preventDefault();
      e.stopPropagation();
      // Direkter Redirect zur Login-Seite
      router.push(`/${locale}/login?reason=interaction_blocked`);
    } else if (targetUrl) {
      router.push(targetUrl);
    }
  };

  const navItems = [
    { id: 'Home', label: t('navHome'), icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25' },
    { id: 'Groups', label: t('navGroups'), icon: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z' },
    { id: 'Map', label: t('navMap'), icon: 'M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z' },
    { id: 'Messages', label: t('navMessages'), icon: 'M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z' },
    { 
      id: 'Profile', 
      label: isGuest ? t('loginButton') : t('navProfile'), 
      icon: isGuest 
        ? 'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75' 
        : 'M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' 
    },
  ];

  return (
    <div className={`min-h-screen bg-white text-gray-900 font-sans pb-24 ${showPaywall ? 'overflow-hidden' : ''}`}>
      {/* HEADER */}
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8E44AD] via-[#FF5733] to-[#F1C40F] flex items-center justify-center shadow-sm">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <span className="text-2xl font-extrabold tracking-tight">gloo</span>
        </div>
      </header>

      <main className="px-6 max-w-md mx-auto">
        <div className="text-center mt-4 mb-8">
          <h1 className="text-3xl font-medium text-gray-800">
            {t('welcome')}<br/>
            <span className="font-bold text-black">{t('userNamePlaceholder')}</span>
          </h1>
        </div>

        {/* ENTER GAMES BUTTON (Geschützt) */}
        <button 
          onClick={(e) => handleSecureInteraction(e, `/${locale}/games`)} 
          className="w-full bg-[#FF5733] text-white rounded-2xl py-4 flex items-center justify-center gap-3 shadow-[0_8px_20px_rgba(255,87,51,0.3)] hover:scale-[1.02] transition-transform active:scale-95 mb-8"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.536.57a48.053 48.053 0 0 1-.22 3.197c-.015.176.108.33.284.333 1.942.04 3.896.04 5.836 0a.286.286 0 0 0 .284-.333 48.053 48.053 0 0 1-.22-3.197c-.019-.31.226-.57.536-.57v0c.355 0 .676.186.959.401.29.221.634.349 1.003.349 1.036 0 1.875-1.007 1.875-2.25s-.84-2.25-1.875-2.25c-.369 0-.713.128-1.003.349-.283.215-.604.401-.959.401v0a.656.656 0 0 1-.658-.663 48.422 48.422 0 0 1 .315-4.907 48.39 48.39 0 0 1-4.163.3.64.64 0 0 1-.657-.643v0Z" />
          </svg>
          <span className="text-xl font-bold">{t('enterGames')}</span>
        </button>

        {/* TEASER GRID */}
        <div className="grid grid-cols-2 gap-4">
          {/* Party Card mit Interaktions-Schutz */}
          <button 
            onClick={(e) => handleSecureInteraction(e, `/${locale}/groups/party-detail`)} 
            className="relative w-full aspect-[1/1.7] rounded-[2.5rem] overflow-hidden shadow-lg group"
          >
            <Image 
              src={(isGuest && previewGroup) ? previewGroup.imageUrl : "/images/bg-fallback.jpg"}
              alt="Party"
              fill
              className={`object-cover z-0 transition-all duration-1000 ${isGuest ? 'blur-2xl scale-110' : ''}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent z-10"></div>
            <div className="relative z-20 h-full flex flex-col justify-end p-5 items-center text-center">
              <div className="text-4xl mb-4">🪩</div>
              {isGuest && previewGroup ? (
                <div className="animate-in fade-in zoom-in duration-700">
                  <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-3 py-1 mb-2">
                    <span className="text-white text-[11px] font-bold">Gruppe ({previewGroup.memberCount})</span>
                  </div>
                  <p className="text-gray-300 text-[10px]">{previewGroup.distance} entfernt</p>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-white">{t('partyTitle')}</h2>
                  <p className="text-[9px] text-gray-200 mt-1">{t('partyDesc')}</p>
                </>
              )}
            </div>
          </button>

          {/* Pre-party Card mit Interaktions-Schutz */}
          <button 
            onClick={(e) => handleSecureInteraction(e, `/${locale}/groups/preparty-detail`)} 
            className="relative w-full aspect-[1/1.7] rounded-[2.5rem] overflow-hidden shadow-lg group"
          >
            <Image 
              src={(isGuest && previewGroup) ? previewGroup.imageUrl : "/images/vorgluehen.jpg"}
              alt="Pre-party"
              fill
              className={`object-cover z-0 transition-all duration-1000 ${isGuest ? 'blur-2xl scale-110' : ''}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent z-10"></div>
            <div className="relative z-20 h-full flex flex-col justify-end p-5 items-center text-center">
              <div className="text-4xl mb-4">🍻</div>
              {isGuest && previewGroup ? (
                <div className="animate-in fade-in zoom-in duration-700">
                  <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-3 py-1 mb-2">
                    <span className="text-white text-[11px] font-bold">Gruppe ({previewGroup.memberCount})</span>
                  </div>
                  <p className="text-gray-300 text-[10px]">{previewGroup.distance} entfernt</p>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-white">{t('prePartyTitle')}</h2>
                  <p className="text-[9px] text-gray-200 mt-1">{t('prePartyDesc')}</p>
                </>
              )}
            </div>
          </button>
        </div>

        {isGuest && <div className="h-24 flex items-center justify-center text-gray-400 italic text-sm mt-8">Scrolle für mehr Gruppen...</div>}
      </main>

      {/* PAYWALL MODAL */}
      {showPaywall && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowPaywall(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-500 text-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-[#FF5733] to-[#F1C40F] rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg rotate-12">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-10 h-10 -rotate-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-4">Bereit für Gloo?</h2>
            <p className="text-gray-600 mb-8 text-sm leading-relaxed">
              Registriere dich jetzt, um alle Gruppen in deiner Nähe <span className="font-bold text-black">scharf zu sehen</span> und sie zu kontaktieren!
            </p>
            <button onClick={() => router.push(`/${locale}/login`)} className="w-full bg-[#FF5733] text-white font-bold py-4 rounded-2xl shadow-xl active:scale-95 transition-transform mb-3">
              Jetzt registrieren
            </button>
            <button onClick={() => setShowPaywall(false)} className="text-gray-400 text-xs font-medium uppercase tracking-widest">Vorerst weiter umschauen</button>
          </div>
        </div>
      )}

      {/* FOOTER MIT INTERAKTIONS-SCHUTZ */}
      <footer className="fixed bottom-0 w-full bg-white border-t py-4 flex justify-around z-50 pb-8 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] rounded-t-[2.5rem]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button 
              key={item.id} 
              onClick={(e) => {
                if (item.id === 'Home') {
                  setActiveTab(item.id);
                } else {
                  // Schützt alle anderen Tabs außer Home
                  handleSecureInteraction(e);
                  if (!isGuest) setActiveTab(item.id);
                }
              }}
              className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-[#FF5733] scale-110' : 'text-gray-400'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={isActive ? 2.5 : 1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span className="text-[10px] font-bold">{item.label}</span>
            </button>
          );
        })}
      </footer>
    </div>
  );
}