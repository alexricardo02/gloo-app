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
  const t = useTranslations("Dashboard");

  const [groups, setGroups] = useState<any[]>([]);
  const [distance, setDistance] = useState(10);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  
  const [isDistanceModalOpen, setIsDistanceModalOpen] = useState(false);
  const [tempDistance, setTempDistance] = useState(distance);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastGroupElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchGroups(true);
  }, [distance]);

  useEffect(() => {
    if (loading || !hasMore) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchGroups(false);
      }
    });

    if (lastGroupElementRef.current) {
      observerRef.current.observe(lastGroupElementRef.current);
    }
  }, [loading, hasMore, groups]);

  async function fetchGroups(reset = false) {
    if (loading) return;
    setLoading(true);

    const nextPage = reset ? 0 : page;

    try {
      const response = await getDiscoveryGroups({
        page: nextPage,
        distance: distance,
        isPartyMode: false,
      });

      if ("error" in response) {
        if (response.error === "User location not found") {
          setHasMore(false);
        }
        console.error("Discovery error:", response.error);
        return;
      }

      const newGroups = response.groups || [];
      
      setGroups(prev => reset ? newGroups : [...prev, ...newGroups]);
      setHasMore(newGroups.length === 10);
      setPage(nextPage + 1);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  }

  const openDistanceModal = () => {
    setTempDistance(distance);
    setIsDistanceModalOpen(true);
  };

  const confirmDistance = () => {
    setDistance(tempDistance);
    setIsDistanceModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-32">
      
      {/* Header */}
      <div className="fixed top-0 w-full z-40 bg-black/90 backdrop-blur-sm border-b border-white/5 rounded-b-[2rem]">
        <div className="flex items-center justify-between gap-4 px-6 py-5">
          <button 
            onClick={openDistanceModal}
            className="flex items-center gap-2.5 bg-[#141414] border border-white/10 px-5 py-2.5 rounded-full hover:border-[#FF725E]/30 transition-all"
          >
            <MapPin size={18} className="text-[#FF725E]" />
            <span className="font-extrabold text-sm tracking-tight">Mainz, Germany</span>
            <ChevronRight size={16} className="text-white/20" />
            <span className="text-sm font-bold text-gray-500">{distance} km</span>
          </button>

          <Link href={`/${locale}/profile/create-group`} className="block">
            <div className="flex items-center gap-2.5 text-sm font-bold bg-[#141414] border border-white/10 px-5 py-2.5 rounded-full hover:bg-[#1A1A1A] hover:border-[#FF725E]/20 transition-all text-white">
              <SlidersHorizontal size={18} className="text-[#FF725E]" />
              <span>Preferences</span>
            </div>
          </Link>
        </div>
      </div>

      <main className="pt-28 px-4 space-y-5">

        <div className="space-y-4">
          {groups.map((group, index) => (
            <div
              key={group.id}
              ref={index === groups.length - 1 ? lastGroupElementRef : null}
            >
              <GroupCard group={group} />
            </div>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center p-10 text-[#FF725E]">
            <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF725E]"></span>
          </div>
        )}

        {groups.length === 0 && !loading && (
          <div className="text-center p-20 text-gray-500">No groups found in this range.</div>
        )}
      </main>


      {isDistanceModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsDistanceModalOpen(false)} />
          <div className="relative bg-[#111111] border border-white/10 w-full max-w-xs rounded-[2rem] p-7 shadow-2xl flex flex-col items-center">
            <button onClick={() => setIsDistanceModalOpen(false)} className="absolute top-5 right-5 text-gray-500"><X size={20} /></button>
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
              Set Radius
            </button>
          </div>
        </div>
      )}

      <Navigation />
    </div>
  );
}