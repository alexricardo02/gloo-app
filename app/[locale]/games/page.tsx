"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function GamesPage() {
  const t = useTranslations("Games");
  const locale = useLocale();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans pb-24">
      
      {/* HEADER*/}
      <header className="flex items-center p-6 relative">
        <button 
          onClick={() => router.push(`/${locale}/dashboard`)}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 z-10"
          aria-label="Go back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h1 className="text-2xl font-extrabold tracking-tight absolute left-0 right-0 text-center pointer-events-none">
          {t('title')}
        </h1>
      </header>

      <main className="px-6 max-w-md mx-auto mt-4">
        <div className="mb-8 text-center">
          <p className="text-gray-500 text-sm">
            {t('subtitle')}
          </p>
        </div>

        {/* (Placeholder) */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Game card 1 */}
          <button className="relative w-full aspect-square bg-[#F7F7F7] rounded-[2rem] overflow-hidden shadow-sm group hover:scale-[1.02] transition-transform text-center flex flex-col items-center justify-center border border-gray-100 p-4">
            <div className="text-5xl mb-3">🍺</div>
            <h2 className="text-lg font-bold text-black leading-tight">Never have I ever</h2>
          </button>

          {/* Game card 2 */}
          <button className="relative w-full aspect-square bg-[#F7F7F7] rounded-[2rem] overflow-hidden shadow-sm group hover:scale-[1.02] transition-transform text-center flex flex-col items-center justify-center border border-gray-100 p-4">
            <div className="text-5xl mb-3">⏱️</div>
            <h2 className="text-lg font-bold text-black leading-tight">Truth or Dare</h2>
          </button>

        </div>
      </main>
    </div>
  );
}