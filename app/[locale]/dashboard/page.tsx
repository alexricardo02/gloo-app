"use client";

import { useState } from "react";
import Image from "next/image";

export default function MainDashboard() {
  const [activeTab, setActiveTab] = useState("Home");

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans pb-24">
      {/* 1. HEADER */}
      <header className="flex justify-between items-center p-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="relative w-15 h-15 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,87,51,0.4)] overflow-hidden">
                    <Image 
                      src="/images/logo.png" 
                      alt="GLOO Logo" 
                      fill 
                      sizes="(max-width: 128px) 100vw, 128px"
                      className="object-cover scale-110"
                      priority 
                    />
                  </div>
        </div>
        
        {/* Notification Bell */}
        <button className="text-gray-800 hover:bg-gray-100 p-2 rounded-full transition">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
        </button>
      </header>

      <main className="px-6 max-w-md mx-auto">
        {/* 2. GREETING */}
        <div className="text-center mt-4 mb-8">
          <h1 className="text-3xl font-medium text-gray-800">
            Welcome to gloo,<br/>
            <span className="font-bold text-black">[User&apos;s Name]!</span>
          </h1>
        </div>

        {/* 3. ENTER GAMES BUTTON */}
        <button className="w-full bg-[#FF5733] text-white rounded-2xl py-4 flex items-center justify-center gap-3 shadow-[0_8px_20px_rgba(255,87,51,0.3)] hover:scale-[1.02] transition-transform active:scale-95 mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.536.57a48.053 48.053 0 0 1-.22 3.197c-.015.176.108.33.284.333 1.942.04 3.896.04 5.836 0a.286.286 0 0 0 .284-.333 48.053 48.053 0 0 1-.22-3.197c-.019-.31.226-.57.536-.57v0c.355 0 .676.186.959.401.29.221.634.349 1.003.349 1.036 0 1.875-1.007 1.875-2.25s-.84-2.25-1.875-2.25c-.369 0-.713.128-1.003.349-.283.215-.604.401-.959.401v0a.656.656 0 0 1-.658-.663 48.422 48.422 0 0 1 .315-4.907 48.39 48.39 0 0 1-4.163.3.64.64 0 0 1-.657-.643v0Z" />
          </svg>
          <span className="text-xl font-bold">Enter Games</span>
        </button>

        {/* 4. MODE CARDS (Party / Pre-party) */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Party Card */}
          <button className="relative w-full aspect-[1/1.7] rounded-[2rem] overflow-hidden shadow-lg group hover:scale-[1.02] transition-transform text-left flex flex-col justify-end p-5 border border-purple-500/20">
            {/* Background Gradient (Placeholder for Image) */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#4A148C] via-[#7B1FA2] to-[#FF5733] opacity-90 z-0"></div>
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-0"></div>
            
            {/* Content */}
            <div className="relative z-10 text-center">
              <div className="text-4xl mb-2">🪩</div>
              <h2 className="text-2xl font-bold text-white mb-2">Party</h2>
              <p className="text-xs text-purple-100/90 leading-tight">
                Discover clubs, DJs, and unforgettable parties.
              </p>
            </div>
          </button>

          {/* Pre-party Card */}
          <button className="relative w-full aspect-[1/1.7] rounded-[2rem] overflow-hidden shadow-lg group hover:scale-[1.02] transition-transform text-left flex flex-col justify-end p-5 border border-orange-400/20">
            {/* Background Gradient (Placeholder for Image) */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#F39C12] via-[#E67E22] to-[#FF5733] opacity-90 z-0"></div>
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-0"></div>
            
            {/* Content */}
            <div className="relative z-10 text-center">
              <div className="text-4xl mb-2">🍻</div>
              <h2 className="text-2xl font-bold text-white mb-2">Pre-party</h2>
              <p className="text-xs text-orange-100/90 leading-tight">
                Find bars and friends for your ideal pre-party.
              </p>
            </div>
          </button>

        </div>
      </main>

      {/* 5. FOOTER NAVIGATION BAR */}
      <footer className="fixed bottom-0 w-full bg-white border-t border-gray-100 flex justify-around py-3 px-2 z-50 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-6">
        {[
          { id: 'Groups', label: 'Groups', icon: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z' },
          { id: 'Map', label: 'Map', icon: 'M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z' },
        { id: 'Home', label: 'Home', icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25' },
          { id: 'Messages', label: 'Messages', icon: 'M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z' },
          { id: 'Profile', label: 'My Profile', icon: 'M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' },
        ].map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 w-16 transition-colors ${isActive ? 'text-[#FF5733]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={isActive ? 2 : 1.5} stroke="currentColor" className={`w-7 h-7 ${isActive ? 'scale-110' : ''} transition-transform`}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
              {/* Active Indicator bar */}
              {isActive && <div className="absolute top-0 w-8 h-1 bg-[#FF5733] rounded-b-full"></div>}
            </button>
          );
        })}
      </footer>
    </div>
  );
}