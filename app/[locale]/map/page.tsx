"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

import Navigation from "@/app/components/Navigation";

// Dynamischer Import verhindert den SSR-Crash von Leaflet
const MapDisplay = dynamic(() => import("@/app/components/MapDisplay"), {
  ssr: false,
  loading: () => <div className="flex-1 flex items-center justify-center bg-black text-gray-500">Karte wird geladen...</div>
});


export default function MapPage() {
  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans">
      {/* Header / Filter-Leiste */}
      <div className="p-4 bg-[#111] border-b border-white/5">
        <h1 className="text-xs font-black tracking-widest uppercase text-gray-400">Gloo Map</h1>
      </div>

      {/* Main Map Container */}
      <div className="flex-1 relative">
        <MapDisplay />
      </div>

      <Navigation />
    </div>
  );
}