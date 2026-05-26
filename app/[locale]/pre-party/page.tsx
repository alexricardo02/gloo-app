"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Navigation from "@/app/components/Navigation";
import GroupCard from "@/app/components/GroupCard";
import { getDiscoveryGroups } from "@/app/actions/discoverGroups";
import { getGroupByUser } from "@/app/actions/group";
import { checkIsGuest } from "@/app/actions/guest";
import { MapPin, SlidersHorizontal, ChevronRight, X, Users, Lock } from "lucide-react";

export default function PrePartyPage() {
  const locale = useLocale();
  const t = useTranslations("Pre-party");
  const dashboardT = useTranslations("Dashboard");

  type DiscoveryGroup = { id: string } & Record<string, unknown>;
  const [groups, setGroups] = useState<DiscoveryGroup[]>([]);
  const [distance, setDistance] = useState(10);

  useEffect(() => {
    const savedDistance = localStorage.getItem('gloo_search_radius');
    if (savedDistance) {
      setDistance(Number(savedDistance));
    }
  }, []);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  
  const [isDistanceModalOpen, setIsDistanceModalOpen] = useState(false);
  const [tempDistance, setTempDistance] = useState(distance);

  const [hasNoGroup, setHasNoGroup] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)

  const [isGuest, setIsGuest] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    async function init() {
      const guestStatus = await checkIsGuest();
      setIsGuest(guestStatus);

      if (!guestStatus) {
        const userGroup = await getGroupByUser();
        if (userGroup?.maxDistance) {
          setDistance(userGroup.maxDistance);
          setTempDistance(userGroup.maxDistance);
        }
      }
    }
    init();
  }, []);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastGroupElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchGroups(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [distance, isGuest]);

  useEffect(() => {
    if (loading || hasNoGroup) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        fetchGroups();
      }
    });

    if (lastGroupElementRef.current) {
      observerRef.current.observe(lastGroupElementRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [loading, hasMore, groups, hasNoGroup]);

  // Intercept interactions if user is guest or has no group
  const handleInteractionAttempt = () => {
    if (isGuest) {
      setShowPaywall(true);
    } else if (hasNoGroup) {
      setIsBlockModalOpen(true);
    }
  };

  async function fetchGroups(reset = false) {
    if (loading || (!hasMore && !reset)) return;
    setLoading(true);

    try {
      const currentPage = reset ? 0 : page;
      
      const response = await getDiscoveryGroups({
        page: currentPage,
        distance,
      });

      if (response.hasNoGroup) {
        setHasNoGroup(true);
        setGroups(response.groups as DiscoveryGroup[]);
        setHasMore(false);
      } else if (response.groups) {
        if (response.groups.length === 0) {
          setHasMore(false);
        } else {
          setGroups((prev) => 
            reset ? (response.groups as DiscoveryGroup[]) : [...prev, ...response.groups as DiscoveryGroup[]]
          );
          setPage(currentPage + 1);
        }
      }
    } catch (error) {
      console.error("Failed to load groups:", error);
    } finally {
      setLoading(false);
    }
  }

  const openDistanceModal = () => {
    setTempDistance(distance);
    setIsDistanceModalOpen(true);
  };

  const applyDistance = () => {
    setDistance(tempDistance);
    localStorage.setItem('gloo_search_radius', tempDistance.toString());
    
    setIsDistanceModalOpen(false);
    setPage(0); // Reset pagination on new search
  };

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-[#FF725E] selection:text-black">
      
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 bg-gradient-to-b from-black/80 via-black/50 to-transparent backdrop-blur-sm z-30 px-6 py-6 pt-12 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tight leading-none">
            {t("title") || "DISCOVER"}
          </h1>
          <p className="text-[#FF725E] text-[10px] font-bold uppercase tracking-widest mt-1">
            {distance} KM {t("radius") || "RADIUS"}
          </p>
        </div>
        
        <button 
          onClick={() => setIsDistanceModalOpen(true)}
          className="bg-[#FF725E] text-black text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-full hover:bg-[#ff8573] active:scale-95 transition-all shadow-lg shadow-[#FF725E]/20"
        >
          Change Radius
        </button>
      </header>

      {/* Main Carousel Feed */}
      <main className="h-screen w-full overflow-y-auto snap-y snap-mandatory scroll-smooth pb-24 relative">
        
        {/* Invisible Overlay to block interactions if restricted */}
        {(hasNoGroup || isGuest) && (
          <div 
            className="absolute inset-0 z-30 cursor-pointer"
            onClick={handleInteractionAttempt}
          />
        )}

        {groups.map((group, index) => {
          const isLastElement = index === groups.length - 1;
          return (
            <div 
              key={group.id} 
              ref={isLastElement ? lastGroupElementRef : null}
              className={`h-screen w-full snap-center snap-always ${isGuest ? "blur-xl select-none" : ""}`}
            >
              <GroupCard group={group} />
            </div>
          );
        })}

        {/* Empty States */}
        {!loading && groups.length === 0 && (
          <div className="h-screen w-full flex flex-col items-center justify-center p-8 text-center snap-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <MapPin size={32} className="text-[#FF725E]" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
              {t("emptyTitle")}
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-[280px]">
              {t("emptyDesc")}
            </p>
            <button 
              onClick={() => setIsDistanceModalOpen(true)}
              className="mt-8 px-8 py-3 rounded-full bg-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-colors"
            >
              {t("preferences")}
            </button>
          </div>
        )}
      </main>

      <Navigation 
        isGuest={isGuest} 
        onSecureClick={() => setShowPaywall(true)} 
      />

      {/* --- MODALS --- */}

      {/* 1. Distance Adjust Modal */}
      {isDistanceModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end justify-center animate-in fade-in duration-200">
          <div className="bg-[#121212] w-full max-w-md rounded-t-[2.5rem] p-8 border-t border-white/10 animate-in slide-in-from-bottom-8 duration-300 pb-12">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black uppercase tracking-tight">Search Radius</h3>
              <button 
                onClick={() => setIsDistanceModalOpen(false)}
                className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-10">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-[#FF725E] mb-4">
                <span>1 KM</span>
                <span>{tempDistance} KM</span>
                <span>50 KM</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={tempDistance}
                onChange={(e) => setTempDistance(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FF725E]"
              />
            </div>
            
            <button
              onClick={() => {
                setDistance(tempDistance);
                setIsDistanceModalOpen(false);
              }}
              className="w-full bg-[#FF725E] text-black font-black py-4 rounded-full uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              {t("modalButton")}
            </button>
          </div>
        </div>
      )}

      {/* 2. Missing Group Modal */}
      {isBlockModalOpen && !isGuest && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-[#121212] border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
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
              {t("groupRequiredTitle") || "Group Required"}
            </h3>
            
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">
              {t("groupRequiredDesc") || "To match, like, send messages, or unlock more groups near you, you must create a profile for your own group first."}
            </p>

            <Link
              href={`/${locale}/profile/create-group`}
              className="w-full bg-[#FF725E] text-black font-black py-4 rounded-full uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-[#FF725E]/20 text-center"
            >
              {t("createGroupButton") || "Create Profile"}
            </Link>
          </div>
        </div>
      )}

      {/* 3. Guest Paywall Modal */}
      {showPaywall && isGuest && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-[#121212] border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowPaywall(false)}
              className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white mb-6 border border-white/10">
              <Lock size={28} />
            </div>

            <h3 className="text-2xl font-black italic uppercase tracking-tight mb-3">
              {dashboardT("actionSheetTitle") || "Create an Account"}
            </h3>
            
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">
              {dashboardT("actionSheetDesc") || "Sign up for free to unlock groups, send messages, and connect with other groups near you."}
            </p>

            <div className="flex flex-col w-full gap-3">
              <Link
                href={`/${locale}/register`}
                className="w-full bg-white text-black font-black py-4 rounded-full uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform text-center"
              >
                {dashboardT("actionSheetRegister") || "Sign Up Free"}
              </Link>
              <Link
                href={`/${locale}/login`}
                className="w-full bg-transparent border border-white/20 text-white font-bold py-4 rounded-full uppercase tracking-widest text-sm hover:bg-white/5 transition-colors text-center"
              >
                {dashboardT("actionSheetLogin") || "Log In"}
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}