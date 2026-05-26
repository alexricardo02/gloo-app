"use client";
 
import { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { toggleLike } from "@/app/actions/discoverGroups";
 
interface GroupCardProps {
  group: any;
}
 
export default function GroupCard({ group }: GroupCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
 
  const photos: string[] =
    group.photos && group.photos.length > 0
      ? group.photos
      : ["/images/bg-fallback.jpg"];
 
  const goNext = () => setCurrentIndex((i) => Math.min(i + 1, photos.length - 1));
  const goPrev = () => setCurrentIndex((i) => Math.max(i - 1, 0));
 
  const handleLike = async (id: string) => {
    try {
      await toggleLike(id);
    } catch (error) {
      console.error("Error liking group:", error);
    }
  };
 
  // ── Swipe support (no preventDefault — not needed with the translate approach) ──
  // We register on the container to detect horizontal swipes on touchend.
  // Because we don't call preventDefault(), vertical gestures still bubble
  // to the parent's vertical scroll without any conflict.
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
 
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    const THRESHOLD = 50;
 
    // Only act if the gesture was more horizontal than vertical
    if (Math.abs(dx) > THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };
 
  return (
    <div
      className="relative h-full w-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-[#1A1A1A]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
 
      {/* ── 1. CAROUSEL: use transform instead of overflow-x-auto ────────────────
           Moving photos with translateX completely avoids the conflict between
           the carousel's horizontal scroll and the parent's vertical snap.    */}
      <div
        className="absolute inset-0 flex transition-transform duration-300 ease-out will-change-transform"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {photos.map((photo: string, index: number) => (
          <div key={index} className="relative min-w-full h-full flex-shrink-0">
            <img
              src={photo}
              alt={`Foto ${index + 1}`}
              className="w-full h-full object-cover select-none"
              draggable="false"
            />
          </div>
        ))}
      </div>
 
      {/* ── 2. GRADIENT ───────────────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none z-10" />
 
      {/* ── 3. TOP INDICATORS (bars, Instagram Stories style) ────────────────
           Always visible. They expand/contract to indicate the active photo. */}
      <div className="absolute top-4 left-4 right-4 flex gap-1 z-30 pointer-events-none">
        {photos.map((_: string, index: number) => (
          <div
            key={index}
            className="flex-1 h-[3px] rounded-full overflow-hidden bg-white/30"
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-white w-full"
                  : index < currentIndex
                  ? "bg-white w-full"
                  : "bg-transparent w-0"
              }`}
            />
          </div>
        ))}
      </div>
 
      {photos.length > 1 && (
        <div className="absolute inset-0 z-20 flex">
          <div
            className="w-1/3 h-full cursor-pointer"
            onClick={goPrev}
          />
          <div
            className="w-2/3 h-full cursor-pointer"
            onClick={goNext}
          />
        </div>
      )}
 
      {/* ── 5. Content and interface ─────────────────────────────────────────── */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 pointer-events-none z-40">
        <div className="flex justify-between items-end">
          {/* Info */}
          <div className="flex-1 pr-4 space-y-2">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tight drop-shadow-md">
              {group.user?.name ? `${group.user.name}'s Group` : "Group"}
            </h2>
            <p className="text-sm text-gray-200 line-clamp-2 drop-shadow">
              {group.description || "Looking for a fun night out!"}
            </p>
            <div className="flex gap-2 mt-3 pt-2">
              <span className="bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                {group.membersCount} Members
              </span>
              <span className="bg-[#FF725E]/20 backdrop-blur-md border border-[#FF725E]/30 text-[#FF725E] px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                {group.gender}
              </span>
            </div>
          </div>
 
          <div className="flex flex-col gap-4 pointer-events-auto">
            <button
              onClick={() => handleLike(group.id)}
              className="p-4 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 hover:scale-110 hover:bg-white/20 transition-all shadow-xl"
            >
              <Heart className="text-white" size={24} />
            </button>
            <button className="p-4 bg-[#FF725E] rounded-full shadow-[0_0_20px_rgba(255,114,94,0.4)] hover:scale-110 transition-all">
              <MessageCircle className="text-black" fill="black" size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}