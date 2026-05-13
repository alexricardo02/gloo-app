"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
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

  const handleSecureInteraction = (e: React.MouseEvent, targetUrl?: string) => {
    if (isGuest) {
      e.preventDefault();
      e.stopPropagation();
      router.push(`/${locale}/login?reason=interaction_blocked`);
    } else if (targetUrl) {
      router.push(targetUrl);
    }
  };

  return (
    <div className={`min-h-screen bg-black text-white font-sans pb-32 ${showPaywall ? 'overflow-hidden' : ''}`}>
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8E44AD] via-[#FF5733] to-[#F1C40F] flex items-center justify-center shadow-sm">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-white">gloo</span>
        </div>
      </header>

      <main className="px-6 max-w-md mx-auto">
        <div className="text-center mt-4 mb-8">
          <h1 className="text-3xl font-medium text-gray-400">
            {t('welcome')}<br/>
            <span className="font-bold text-white">{t('userNamePlaceholder')}</span>
          </h1>
        </div>

        <button 
          onClick={(e) => handleSecureInteraction(e, `/${locale}/games`)} 
          className="w-full bg-[#FF5733] text-white rounded-2xl py-4 flex items-center justify-center gap-3 shadow-[0_8px_20px_rgba(255,87,51,0.3)] hover:scale-[1.02] transition-transform active:scale-95 mb-8"
        >
          <span className="text-xl font-bold">{t('enterGames')}</span>
        </button>

        <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={(e) => handleSecureInteraction(e, `/${locale}/party`)} 
            className="relative w-full aspect-[1/1.7] rounded-[2.5rem] overflow-hidden group bg-[#111111] border-[3px] border-[#FF5733] shadow-[0_0_20px_rgba(255,87,51,0.2)] hover:shadow-[0_0_35px_rgba(255,87,51,0.4)] transition-all duration-300 cursor-pointer"
          >
            <Image 
              src="/images/bg-fallback.jpg" 
              alt="Party"
              fill
              className={`object-cover z-0 transition-all duration-1000 ${isGuest ? 'blur-xl scale-110 opacity-70' : ''}`}
            />
            <div className={`absolute inset-0 z-10 ${isGuest ? 'bg-gradient-to-t from-black/95 via-black/60 to-black/30' : 'bg-gradient-to-t from-black/95 via-black/30 to-transparent'}`}></div>
            
            <div className="relative z-20 h-full flex flex-col justify-end p-5 items-center text-center">
              <div className="text-4xl mb-2">🪩</div>
              
              {isGuest ? (
                <>
                  <h2 className="text-lg font-bold text-white mb-4">{t('partyTitle')}</h2>
                  {previewGroup && (
                    <div className="w-full flex flex-col items-center">
                      <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-2 px-1 mb-2">
                        <span className="text-white text-xs font-bold">{t('findGroup', { count: previewGroup.memberCount })}</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-[9px] text-gray-300 mt-1">{t('partyDesc')}</p>
              )}
            </div>
          </div>

          <div 
            onClick={(e) => handleSecureInteraction(e, `/${locale}/pre-party`)} 
            className="relative w-full aspect-[1/1.7] rounded-[2.5rem] overflow-hidden group bg-[#111111] border-[3px] border-[#8E44AD] shadow-[0_0_20px_rgba(142,68,173,0.2)] hover:shadow-[0_0_35px_rgba(142,68,173,0.4)] transition-all duration-300 cursor-pointer"
          >
            <Image 
              src="/images/vorgluehen.jpg" 
              alt="Pre-party"
              fill
              className={`object-cover z-0 transition-all duration-1000 ${isGuest ? 'blur-xl scale-110 opacity-70' : ''}`}
            />
            <div className={`absolute inset-0 z-10 ${isGuest ? 'bg-gradient-to-t from-black/95 via-black/60 to-black/30' : 'bg-gradient-to-t from-black/95 via-black/30 to-transparent'}`}></div>
            
            <div className="relative z-20 h-full flex flex-col justify-end p-5 items-center text-center">
              <div className="text-4xl mb-2">🍻</div>
              
              {isGuest ? (
                <>
                  <h2 className="text-lg font-bold text-white mb-4">{t('prePartyTitle')}</h2>
                  {previewGroup && (
                    <div className="w-full flex flex-col items-center">
                      <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-2 px-1 mb-2">
                        <span className="text-white text-xs font-bold">{t('findGroup', { count: previewGroup.memberCount })}</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-[9px] text-gray-300 mt-1">{t('prePartyDesc')}</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {showPaywall && isGuest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <div className="relative bg-[#111111] border border-white/10 w-full max-w-sm rounded-[3rem] p-8 text-center shadow-[0_0_40px_rgba(255,87,51,0.1)] animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-[#FF5733] rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-[0_10px_30px_rgba(255,87,51,0.3)] rotate-12">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-10 h-10 -rotate-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-white mb-4">{t('paywallTitle')}</h2>
            <p className="text-gray-400 mb-8 text-sm leading-relaxed">{t('paywallDesc')}</p>
            <button 
              onClick={() => router.push(`/${locale}/login`)} 
              className="w-full bg-[#FF5733] text-white font-bold py-4 rounded-2xl mb-4 shadow-[0_4px_20px_rgba(255,87,51,0.4)] active:scale-95 transition-transform"
            >
              {t('paywallButton')}
            </button>
            <button onClick={() => setShowPaywall(false)} className="text-gray-500 hover:text-gray-300 transition-colors text-xs font-medium uppercase tracking-widest">
              {t('browseContent')}
            </button>
          </div>
        </div>
      )}

      <Navigation isGuest={isGuest} onSecureClick={(e) => handleSecureInteraction(e)} />
    </div>
  );
}