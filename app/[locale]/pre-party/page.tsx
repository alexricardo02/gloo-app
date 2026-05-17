"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import Navigation from "@/app/components/Navigation";
import GroupCard from "@/app/components/GroupCard";
import { getDiscoveryGroups } from "@/app/actions/discoverGroups";
import { MapPin, SlidersHorizontal, ChevronRight, X, Users } from "lucide-react";

export default function PrePartyPage() {
  const locale = useLocale();
  const t = useTranslations("Pre-party");

  const [groups, setGroups] = useState<any[]>([]);
  const [distance, setDistance] = useState(10);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  
  const [isDistanceModalOpen, setIsDistanceModalOpen] = useState(false);
  const [tempDistance, setTempDistance] = useState(distance);

  const [hasNoGroup, setHasNoGroup] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastGroupElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchGroups(true);
  }, [distance]);

  useEffect(() => {
    if (loading || !hasMore || hasNoGroup) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchGroups(false);
      }
    });

    if (lastGroupElementRef.current) {
      observerRef.current.observe(lastGroupElementRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [loading, hasMore, hasNoGroup]);

  const fetchGroups = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    const newPage = reset ? 0 : page;

    try {
      const res = await getDiscoveryGroups({ page: newPage, distance, isPartyMode: false });
      
      // --- CHANGE: Handle setup for teaser preview state ---
      if (res && res.hasNoGroup) {
        setHasNoGroup(true);
        setGroups(res.groups || []);
        setHasMore(false); // Force lock list propagation
        setPage(0);
        return;
      }

      if (res && res.groups) {
        setHasNoGroup(false);
        if (reset) {
          setGroups(res.groups);
        } else {
          setGroups((prev) => [...prev, ...res.groups]);
        }
        setHasMore(res.groups.length === 10);
        setPage(newPage + 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openDistanceModal = () => {
    setTempDistance(distance);
    setIsDistanceModalOpen(true);
  };

  const confirmDistance = () => {
    setDistance(tempDistance);
    setIsDistanceModalOpen(false);
  };

  return (
    <div className="h-[100dvh] bg-black text-white font-sans overflow-hidden relative">
      {/* Header */}
      <div className="absolute top-0 w-full z-40 bg-black/80 backdrop-blur-md border-b border-white/5 rounded-b-[2rem]">
        <div className="flex items-center justify-between gap-4 px-6 py-5">
          <button
            onClick={openDistanceModal}
            className="flex items-center gap-2.5 bg-[#141414] border border-white/10 px-5 py-2.5 rounded-full hover:border-[#FF725E]/30 transition-all"
          >
            <MapPin size={18} className="text-[#FF725E]" />
            <span className="font-extrabold text-sm tracking-tight">Mainz, Germany</span> {/* Necesary change: dynamic position*/}
            <ChevronRight size={16} className="text-white/20" />
            <span className="text-sm font-bold text-gray-500">{distance} km</span>
          </button>
 
          <Link href={`/${locale}/profile/preferences`} className="block">
            <div className="flex items-center gap-2.5 text-sm font-bold bg-[#141414] border border-white/10 px-5 py-2.5 rounded-full hover:bg-[#1A1A1A] transition-all text-white">
              <SlidersHorizontal size={18} className="text-[#FF725E]" />
              <span className="hidden md:inline">{t("preferences")}</span>
            </div>
          </Link>
        </div>
      </div>
 
      <main
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth pb-20 touch-pan-y"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style dangerouslySetInnerHTML={{ __html: `main::-webkit-scrollbar { display: none; }` }} />
 
        {groups.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center px-10 text-center gap-4">
            <div className="border border-white/5 bg-[#141414] rounded-3xl p-10 flex flex-col items-center gap-4">
              <MapPin size={40} className="text-gray-700" />
              <h3 className="text-lg font-extrabold text-white">{t("emptyTitle")}</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                {t("emptyDesc")}
              </p>
            </div>
          </div>
        )}
 
        {groups.map((group, index) => (
          <div
            key={group.id}
            ref={index === groups.length - 1 ? lastGroupElementRef : null}
            className="h-[100dvh] w-full snap-center snap-always flex items-center justify-center px-4 pt-24 pb-28"
          >
            <div className="w-full h-full max-h-[800px] relative">
              
              {/* 1. La tarjeta real del grupo */}
              <GroupCard group={group} />
              
              {/* 2. La capa invisible bloqueadora (Solo si no tiene grupo) */}
              {hasNoGroup && (
                <div 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsBlockModalOpen(true);
                  }}
                  className="absolute inset-0 z-50 cursor-pointer bg-transparent"
                />
              )}

            </div>
          </div>
        ))}
 
        {loading && (
          <div className="h-[100dvh] w-full snap-center flex justify-center items-center text-[#FF725E]">
            <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF725E]"></span>
          </div>
        )}
 
        {!hasMore && groups.length > 0 && (
          <div className="h-[50dvh] w-full snap-center flex flex-col justify-center items-center p-10 text-center">
            <span className="text-xs text-gray-700 font-bold uppercase tracking-widest">
              {t("endOfList")}
            </span>
          </div>
        )}
      </main>
 
      {isDistanceModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsDistanceModalOpen(false)}
          />
          <div className="relative bg-[#111111] border border-white/10 w-full max-w-xs rounded-[2rem] p-7 shadow-2xl flex flex-col items-center">
            <button onClick={() => setIsDistanceModalOpen(false)} className="absolute top-5 right-5 text-gray-500">
              <X size={20} />
            </button>
            <h3 className="text-xl font-extrabold mb-6">Set Distance</h3>
            <div className="mb-1 text-center">
              <span className="text-5xl font-black text-[#FF725E]">{tempDistance}</span>
              <span className="text-xl font-bold text-white/50 ml-1">km</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={tempDistance}
              onChange={(e) => setTempDistance(parseInt(e.target.value, 10))}
              className="w-full h-1 bg-[#1A1A1A] rounded-full appearance-none cursor-pointer accent-[#FF725E] my-8"
            />
            <button
              onClick={confirmDistance}
              className="w-full bg-[#FF725E] text-black font-black py-4 rounded-full uppercase text-sm flex items-center justify-center gap-2"
            >
              <Users size={18} />
              {t("modalButton")}
            </button>
          </div>
        </div>
      )}

      {isBlockModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-black/85 backdrop-blur-md" 
            onClick={() => setIsBlockModalOpen(false)}
          />
          
          <div className="relative bg-[#111111] border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsBlockModalOpen(false)}
              className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="w-16 h-16 bg-[#FF725E]/10 rounded-2xl flex items-center justify-center text-[#FF725E] mb-6 border border-[#FF725E]/20">
              <Users size={28} />
            </div>

            <h3 className="text-2xl font-black italic uppercase tracking-tight mb-3">
              Crew Required
            </h3>
            
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">
              To match, like, send messages, or unlock more groups near you, you must create a profile for your own crew first.
            </p>

            <Link
              href={`/${locale}/profile/create-group`}
              className="w-full bg-[#FF725E] text-black font-black py-4 rounded-full uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-[#FF725E]/20 text-center"
            >
              Create Crew Profile
            </Link>
          </div>
        </div>
      )}
 
      <div className="absolute bottom-0 w-full z-40">
        <Navigation />
      </div>
    </div>
  );
}