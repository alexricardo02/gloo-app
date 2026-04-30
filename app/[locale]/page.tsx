"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
];

export default function Home() {
  const t = useTranslations("WelcomePage"); 
  const currentLocale = useLocale(); 
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * Function to change the language of the application using the dropdown menu
   */
  const handleLanguageChange = (lang: { code: string; label: string; flag: string }) => {
    setIsOpen(false);

    document.cookie = `NEXT_LOCALE=${lang.code}; path=/; max-age=31536000`;
    
    const newPath = pathname.replace(`/${currentLocale}`, `/${lang.code}`);
    
    router.replace(newPath);
    router.refresh();
  };

  return (
    <main className="relative flex flex-col items-center justify-between min-h-screen text-[#FDFEFE] p-8 font-sans overflow-hidden">
      
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover -z-20"
        poster="/images/bg-fallback.jpg"
      >
        <source src="/videos/video1.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm -z-10"></div>
      <div className="flex-1 w-full relative z-10"></div>

      <div className="flex flex-col items-center justify-center flex-2 space-y-6 relative z-10">
        <div className="relative w-32 h-32 rounded-full border-4 border-[#FF5733] flex items-center justify-center shadow-[0_0_40px_rgba(255,87,51,0.4)] overflow-hidden">
          <Image 
            src="/images/logo.png" 
            alt="GLOO Logo" 
            fill 
            sizes="(max-width: 128px) 100vw, 128px"
            className="object-cover scale-110"
            priority 
          />
        </div>
        
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-lg">
            {t("titleStart")}<span className="text-[#FF5733] font-medium"> {t("titleHighlight")} </span> {t("titleEnd")}
          </h1>
        </div>
      </div>

      <div className="flex flex-col w-full max-w-sm space-y-4 flex-1 justify-end pb-12 relative z-10">
        
        <div className="relative w-full" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-[#1A1A1A]/80 backdrop-blur-md border-2 border-[#8E44AD] text-white font-sans font-semibold py-4 px-4 rounded-2xl flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-[#8E44AD] transition-all shadow-lg"
          >
            <span>{activeLanguage.flag} {activeLanguage.label}</span>
            <svg className={`fill-current h-5 w-5 absolute right-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </button>

          {isOpen && (
            <ul className="absolute z-10 w-full mt-2 bg-[#1A1A1A]/90 backdrop-blur-lg border-2 border-[#8E44AD] rounded-2xl shadow-2xl overflow-hidden bottom-full mb-2">
              {languages.map((lang) => (
                <li key={lang.code}>
                  <button
                    onClick={() => handleLanguageChange(lang)}
                    className="w-full text-center px-4 py-3 hover:bg-[#8E44AD] text-white font-sans font-medium transition-colors"
                  >
                    {lang.flag} {lang.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link 
          href={`/${currentLocale}/dashboard`}
          className="w-full bg-[#FF5733] hover:bg-[#e64d2e] text-white font-bold py-4 rounded-2xl text-center transition-all transform active:scale-95 shadow-[0_0_20px_rgba(255,87,51,0.3)]"
        >
          {t("buttonStart")}
        </Link>
        <div className="text-center space-y-3">
          <p className="text-gray-300 text-base max-w-[280px] mx-auto leading-relaxed drop-shadow-md">
            🔥<span className="font-extrabold bg-[linear-gradient(110deg,#FF5733_35%,#FFFFFF_50%,#FF5733_65%)] bg-[length:200%_auto] bg-clip-text text-transparent animate-shine">124</span> {t("matchingNow")}
          </p>
        </div>
      </div>
    </main>
  );
}