"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ChevronLeft, RefreshCw } from "lucide-react";

const gameData: Record<string, string[]> = {
  en: [
    "Never have I ever ghosted someone after a first date.",
    "Never have I ever sent a risky text to the wrong person.",
    "Never have I ever stolen a drink at a party.",
    "Never have I ever used a fake name at a bar.",
    "Never have I ever kissed someone in this room.",
    "Never have I ever lied about my age to get into a club.",
    "Never have I ever fallen asleep in a public place after partying.",
    "Never have I ever crashed a VIP section."
  ],
  es: [
    "Yo nunca he hecho ghosting después de una primera cita.",
    "Yo nunca he enviado un mensaje arriesgado a la persona equivocada.",
    "Yo nunca he robado un trago en una fiesta.",
    "Yo nunca he usado un nombre falso en un bar.",
    "Yo nunca he besado a alguien en esta habitación.",
    "Yo nunca he mentido sobre mi edad para entrar a un club.",
    "Yo nunca he quedado dormido en un lugar público después de salir.",
    "Yo nunca me he colado en una zona VIP."
  ],
  de: [
    "Ich habe noch nie jemanden nach einem ersten Date geghostet.",
    "Ich habe noch nie eine riskante Nachricht an die falsche Person gesendet.",
    "Ich habe noch nie ein Getränk auf einer Party gestohlen.",
    "Ich habe noch nie einen falschen Namen in einer Bar benutzt.",
    "Ich habe noch nie jemanden in diesem Raum geküsst.",
    "Ich habe noch nie bei meinem Alter gelogen, um in einen Club zu kommen.",
    "Ich bin noch nie nach einer Party an einem öffentlichen Ort eingeschlafen.",
    "Ich habe mich noch nie in einen VIP-Bereich geschlichen."
  ]
};

export default function NeverHaveIEverPage() {
  const router = useRouter();
  const locale = useLocale();
  
  const questions = gameData[locale] || gameData["en"];
  
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    pickRandomQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickRandomQuestion = () => {
    if (isAnimating) return;

    setIsAnimating(true);

    setTimeout(() => {
      let nextQuestion = currentQuestion;
      while (nextQuestion === currentQuestion) {
        const randomIndex = Math.floor(Math.random() * questions.length);
        nextQuestion = questions[randomIndex];
      }
      setCurrentQuestion(nextQuestion);
      setIsAnimating(false);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-[#FF725E] selection:text-black">
      
      {/* 1. Top Header */}
      <div className="relative z-50 px-6 pt-10 pb-4 flex items-center">
        <button 
          onClick={() => router.push(`/${locale}/games`)}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors text-white"
        >
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-sm font-black uppercase tracking-[0.2em] ml-2 text-gray-400">
          Never Have I Ever
        </h1>
      </div>

      {/* 2. Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        
        {/* Background glow effect for premium feel */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FF725E]/20 blur-[100px] pointer-events-none" />

        {/* 3. The Interactive Card */}
        <button
          onClick={pickRandomQuestion}
          className={`relative z-10 w-full max-w-sm aspect-[3/4] bg-[#121212] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center p-8 text-center transition-all duration-200 active:scale-95 ${
            isAnimating ? "scale-95 opacity-0" : "scale-100 opacity-100"
          }`}
        >
          <span className="absolute top-8 text-[#FF725E] font-black uppercase tracking-widest text-[10px]">
            {locale === "es" ? "Yo nunca..." : locale === "de" ? "Ich habe noch nie..." : "Never have I ever..."}
          </span>
          
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
            {currentQuestion.replace(/Yo nunca he |Ich habe noch nie |Never have I ever /i, "")}
          </h2>

          <div className="absolute bottom-8 flex flex-col items-center gap-2 text-gray-500">
            <RefreshCw size={16} className="animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {locale === "es" ? "Toca para cambiar" : "Tap for next"}
            </span>
          </div>
        </button>

      </div>
    </div>
  );
}