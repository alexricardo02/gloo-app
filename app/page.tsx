"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from 'react';

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'zh', label: '中文 (Chinese)', flag: '🇨🇳' },
];

export default function Home() {

  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if user clicks outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <main className="flex flex-col items-center justify-between min-h-screen bg-[#1A1A1A] text-[#FDFEFE] p-8 font-sans">
      
      <div className="flex-1"></div>

      {/* Central Section */}
      <div className="flex flex-col items-center justify-center flex-2 space-y-6">
        <div className="w-32 h-32 rounded-full bg-[#000000] border-4 border-[#FF5733] flex items-center justify-center shadow-[0_0_40px_rgba(255,87,51,0.25)]">
          <span className="text-4xl font-bold tracking-widest lowercase">gloo</span>
        </div>
        
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight">Welcome to GLOO</h1>
          <p className="text-gray-400 text-base max-w-[280px] mx-auto leading-relaxed">
            Connect, match, and find the best <span className="text-[#FF5733] font-medium">group parties</span> in town.
          </p>
        </div>
      </div>

      {/* Inferior Section */}
      <div className="flex flex-col w-full max-w-sm space-y-4 flex-1 justify-end pb-12">
        
        {/* Custom Dropdown */}
        <div className="relative w-full" ref={dropdownRef}>
          {/* Button for opening the dropdown */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-[#2A2A2A] border-2 border-[#8E44AD] text-white font-sans font-semibold py-4 px-4 rounded-2xl flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-[#8E44AD] transition-all"
          >
            {/* Truco: Usamos un emoji o la imagen en un span normal */}
            <span>{selectedLang.flag} {selectedLang.label}</span>
            <svg className={`fill-current h-5 w-5 absolute right-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </button>

          {/* Lista desplegable personalizada */}
          {isOpen && (
            <ul className="absolute z-10 w-full mt-2 bg-[#2A2A2A] border-2 border-[#8E44AD] rounded-2xl shadow-xl overflow-hidden bottom-full mb-2">
              {languages.map((lang) => (
                <li key={lang.code}>
                  <button
                    onClick={() => {
                      setSelectedLang(lang);
                      setIsOpen(false);
                    }}
                    className="w-full text-center px-4 py-3 hover:bg-[#8E44AD] text-white font-sans font-medium transition-colors"
                  >
                    {lang.flag} {lang.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Botones */}
        <Link 
          href="/login"
          className="w-full bg-[#FF5733] hover:bg-[#e64d2e] text-white font-bold py-4 rounded-2xl text-center transition-all transform active:scale-95 shadow-lg shadow-orange-900/20"
        >
          Get Started
        </Link>
        
        <Link 
          href="/map"
          className="w-full text-[#FFC300] hover:text-yellow-500 font-semibold py-2 mt-2 text-center transition-colors text-sm"
        >
          Enter as Guest
        </Link>
      </div>
    </main>
  );
}