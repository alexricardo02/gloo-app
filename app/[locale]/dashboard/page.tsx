"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { checkIsGuest } from "@/app/actions/guest";
import Navigation from "@/app/components/Navigation";

interface PreviewGroup {
  imageUrl: string;
  memberCount: number;
  distance: string;
}

export default function MainDashboard() {
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
        setShowPaywall(true); 
        setPreviewGroup({
          imageUrl: "", 
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

  return (
    <div className={`min-h-screen bg-white text-gray-900 font-sans pb-32 ${showPaywall ? 'overflow-hidden' : ''}`}>
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
            onClick={(e) => handleSecureInteraction(e, `/${locale}/party`)} 
            className="relative w-full aspect-[1/1.7] rounded-[2.5rem] overflow-hidden shadow-lg group"
          >
            <Image 
              src= "/images/bg-fallback.jpg"
              alt="Party"
              fill
              className={`object-cover z-0 transition-all duration-1000 ${isGuest ? 'blur-2xl scale-110' : ''}`}
            />
            <div className={`absolute inset-0 z-10 ${isGuest ? 'bg-gradient-to-t from-black/90 via-black/50 to-black/20' : 'bg-gradient-to-t from-black/95 via-black/30 to-transparent'}`}></div>
            <div className="relative z-20 h-full flex flex-col justify-end p-5 items-center text-center">
              <div className="text-4xl mb-4">🪩</div>
              {isGuest && previewGroup ? (
                <>
                  <h2 className="text-lg font-bold text-white mb-4">Parties</h2>
                  {previewGroup && (
                    <div className="animate-in fade-in zoom-in duration-700 w-full flex flex-col items-center">
                      <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-2 px-1 mb-2">
                        <span className="text-white text-xs font-bold">Gruppe finden ({previewGroup.memberCount})</span>
                      </div>
                      <p className="text-[#FF5733] font-medium text-[10px]">{previewGroup.distance}</p>
                    </div>
                  )}
                </>
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
              src="/images/vorgluehen.jpg"
              alt="Pre-party"
              fill
              className={`object-cover z-0 transition-all duration-1000 ${isGuest ? 'blur-2xl scale-110' : ''}`}
            />
            <div className={`absolute inset-0 z-10 ${isGuest ? 'bg-gradient-to-t from-black/90 via-black/50 to-black/20' : 'bg-gradient-to-t from-black/95 via-black/30 to-transparent'}`}></div>
            <div className="relative z-20 h-full flex flex-col justify-end p-5 items-center text-center">
              <div className="text-4xl mb-4">🍻</div>
              
              {isGuest && previewGroup ? (
                <>
                  <h2 className="text-lg font-bold text-white mb-4">Pre-party</h2>
                  {previewGroup && (
                    <div className="animate-in fade-in zoom-in duration-700 w-full flex flex-col items-center">
                      <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-2 px-1 mb-2">
                        <span className="text-white text-xs font-bold">Gruppe finden ({previewGroup.memberCount})</span>
                      </div>
                      <p className="text-[#FF5733] font-medium text-[10px]">{previewGroup.distance}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-white">{t('prePartyTitle')}</h2>
                  <p className="text-[9px] text-gray-200 mt-1">{t('prePartyDesc')}</p>
                </>
              )}
            </div>
          </button>
        </div>

      </main>

      {/* PAYWALL MODAL */}
      {showPaywall && isGuest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white w-full max-w-sm rounded-[3rem] p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            {/* Lock icon */}
            <div className="w-20 h-20 bg-[#FF5733] rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg rotate-12">
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-4">¿Ready for Gloo?</h2>
            <p className="text-gray-600 mb-8 text-sm leading-relaxed">
              Sign in now to unlock the full experience and connect with other people!<br/>
            </p>
            
            {/* Button to login */}
            <button 
              onClick={() => router.push(`/${locale}/login`)} 
              className="w-full bg-[#FF5733] text-white font-bold py-4 rounded-2xl mb-4 shadow-lg shadow-[#FF5733]/30 active:scale-95 transition-transform"
            >
              Sign in to Continue
            </button>
            
            <button onClick={() => setShowPaywall(false)} className="text-gray-400 text-xs font-medium uppercase tracking-widest">
              Browse Content
            </button>
          </div>
        </div>
      )}

      {/* FOOTER MIT INTERAKTIONS-SCHUTZ */}
      <Navigation 
        isGuest={isGuest} 
        onSecureClick={(e) => handleSecureInteraction(e)} 
      />
    </div>
  );
}