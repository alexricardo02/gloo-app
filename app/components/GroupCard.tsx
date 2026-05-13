"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, MessageCircle, Info } from "lucide-react";
import { toggleGroupLike } from "../actions/groups";

interface GroupCardProps {
  group: {
    id: string;
    hostName: string;
    description: string | null;
    membersCount: number;
    ageMin: number;
    ageMax: number;
    groupGender: string;
    images: string[];
    hasLiked?: boolean;
  };
  onMessageClick: (groupId: string) => void;
}


export default function GroupCard({ group, onMessageClick }: GroupCardProps) {

  const [isLiked, setIsLiked] = useState(group.hasLiked || false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = group.images?.length > 0 ? group.images : ["/images/bg-fallback.jpg"];

  const handleLike = async () => {
    setIsLiked(!isLiked);
    // Call Server Action to register the like in DB
    const result = await toggleGroupLike(group.id);

    if (result.error) {
        setIsLiked(isLiked);
        console.error(result.error);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    const newIndex = Math.round(scrollLeft / width);
    setCurrentImageIndex(newIndex);
  };

  return (
    <div className="relative w-full h-full bg-[#111111] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
      
      <div 
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        onScroll={handleScroll}
      >
        {images.map((img, idx) => (
          <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative">
            <Image 
              src={img} 
              alt={`${group.hostName} group photo ${idx + 1}`} 
              fill
              className="object-cover"
              priority={idx === 0}
            />
          </div>
        ))}
      </div>

      <div className="absolute top-4 left-0 w-full flex justify-center gap-1.5 z-20 px-6">
        {images.length > 1 && images.map((_, idx) => (
          <div 
            key={idx} 
            className={`h-1 rounded-full transition-all duration-300 ${
              currentImageIndex === idx ? "w-6 bg-white" : "w-2 bg-white/40"
            }`}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none z-10" />

      <div className="absolute bottom-0 left-0 w-full p-6 z-20 flex flex-col justify-end">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-3xl font-black text-white mb-1 drop-shadow-md">
              {group.hostName}
            </h2>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white">
                {group.membersCount} people
              </span>
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white">
                {group.ageMin}-{group.ageMax} yrs
              </span>
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white">
                {group.groupGender}
              </span>
            </div>
            {group.description && (
              <p className="text-gray-300 text-sm line-clamp-2 max-w-[85%]">
                {group.description}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={handleLike}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center active:scale-90 transition-transform"
            >
              <Heart 
                className={`w-6 h-6 transition-colors ${isLiked ? "fill-[#FF5733] text-[#FF5733]" : "text-white"}`} 
              />
            </button>
            <button 
              onClick={() => onMessageClick(group.id)}
              className="w-12 h-12 rounded-full bg-[#FF5733] shadow-[0_0_20px_rgba(255,87,51,0.4)] flex items-center justify-center active:scale-90 transition-transform"
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

}