"use client";

import { Heart, MessageCircle } from "lucide-react";
import { toggleLike } from "@/app/actions/discoverGroups";

interface GroupCardProps {
  group: any;
}

export default function GroupCard({ group }: GroupCardProps) {
  
  const handleLike = async (id: string) => {
    try {
      await toggleLike(id);
      console.log("Liked group:", id);
    } catch (error) {
      console.error("Error liking group:", error);
    }
  };

  return (
    <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden shadow-2xl">
      {/* Background Image */}
      <img
        src={group.photos?.[0] || "/images/bg-fallback.jpg"}
        alt="Group"
        className="w-full h-full object-cover"
      />
      
      {/* Dark Gradient Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
        
        <div className="flex justify-between items-end">
          {/* Info Section */}
          <div className="flex-1 pr-4 space-y-2">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tight drop-shadow-md">
              {group.user?.name ? `${group.user.name}'s Crew` : "Group"}
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

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => handleLike(group.id)}
              className="p-4 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 hover:scale-110 hover:bg-white/20 transition-all shadow-xl"
            >
              <Heart className="text-white" size={24} />
            </button>
            <button 
              className="p-4 bg-[#FF725E] rounded-full shadow-[0_0_20px_rgba(255,114,94,0.4)] hover:scale-110 transition-all"
            >
              <MessageCircle className="text-black" fill="black" size={24} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}