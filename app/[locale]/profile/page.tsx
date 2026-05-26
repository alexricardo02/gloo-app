"use client";

import { useState, useEffect } from "react";
import { checkIsGuest } from "@/app/actions/guest";
import { getGroupByUser } from "@/app/actions/group";
import { getCurrentUser, logOutAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Navigation from "@/app/components/Navigation";
import GroupCard from "@/app/components/GroupCard";
import Image from "next/image";
import Link from "next/link";

import { Settings, Users, LogOut, ChevronRight, BarChart3, Plus, User, X, Camera, Upload } from "lucide-react";


export default function ProfilePage() {
  const [isGuest, setIsGuest] = useState(false);
  const [group, setGroup] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Profile");

  // Load guest status + group
  useEffect(() => {
    const init = async () => {
      const status = await checkIsGuest();
      setIsGuest(status);

      const g = await getGroupByUser();
      setGroup(g);

      const userData = await getCurrentUser();
      setUser(userData)
    };
    init();
  }, []);

  const settingsOptions = [
    { name: t("accountSection"), icon: <Users size={16} />, path: `/${locale}/profile/account` },
    { name: t("myScores"), icon: <BarChart3 size={16} />, path: `/${locale}/game-center` },
    { name: t("dataPolicy"), icon: <ChevronRight size={16} />, path: `/${locale}/privacy` },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-32">
      
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 p-6 border-b border-white/10 mb-6 bg-[#111111] rounded-b-[2.5rem]">
        <h1 className="text-3xl font-extrabold text-white">
          {t("title")}
        </h1>
      </div>

      <div className="px-6 space-y-10">
        
        {/* Profile Info (Minimalist) */}
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="relative">
            <div className="w-[110px] h-[110px] rounded-full border-2 border-[#FF725E] overflow-hidden bg-[#1A1A1A] flex items-center justify-center shadow-2xl">
              {user?.image ? (
                <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-gray-600" />
              )}
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="absolute bottom-1 right-1 bg-[#FF725E] text-black p-2 rounded-full border-2 border-black hover:scale-110 transition-transform shadow-lg z-10"
            >
              <Plus size={18} strokeWidth={3} />
            </button>
          </div>

          <div className="mt-2">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
              {user?.name || "Loading..."}
            </h2>
          </div>
        </div>

        {/* --- REDESIGN: Groups Section (Minimalist Card) --- */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
              {t("groupsSection")}
            </h3>
          </div>

          {!group ? (
            // Empty State
            <Link href={`/${locale}/profile/create-group`} className="block">
              <div className="border border-white/10 bg-[#141414] rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 hover:border-[#FF725E]/30 transition-all">
                <div className="p-3 bg-[#1A1A1A] rounded-xl border border-white/5 text-[#FF725E]">
                  <Users size={24} />
                </div>
                <h4 className="font-extrabold text-white text-lg">
                  {t("noGroupTitle")}
                </h4>
                <p className="text-sm text-gray-500 max-w-xs">
                  {t("noGroupDesc")}
                </p>
                <span className="mt-2 text-sm font-bold bg-[#FF725E] text-black px-6 py-2 rounded-full">
                  {t("createGroupButton")}
                </span>
              </div>
            </Link>
          ) : (
            // --- REDESIGNED GROUP CARD (Clickable to edit) ---
            <Link href={`/${locale}/profile/create-group`} className="block">
              <div className="border border-white/10 bg-[#141414] rounded-3xl p-5 flex items-center gap-4 hover:border-[#FF725E]/50 hover:bg-[#1A1A1A] transition-all relative">
                
                {/* Photo Preview Square */}
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0 bg-[#1A1A1A]">
                  <img
                    src={group.photos?.[0] || "/images/vorgluehen.jpg"}
                    alt="Group"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Minimalist Details */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-xl text-white">
                      {t("yourGroup")}
                    </h4>
                    <span className="text-[10px] text-[#FF725E] bg-[#FF725E]/10 px-2 py-0.5 rounded uppercase font-bold">
                      {t(group.gender)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Users size={16} className="text-[#FF725E]" />
                      {group.membersCount}
                    </span>
                    <span className="font-bold flex items-center gap-1.5">
                      <Settings size={14} className="text-[#FF725E]" />
                      {group.ageMin}–{group.ageMax}
                    </span>
                  </div>
                </div>
                              </div>
            </Link>
          )}
        </div>

        {/* Settings Options */}
        <div className="space-y-4 mt-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
            {t("settings")}
          </h3>
          <div className="space-y-3">
            {settingsOptions.map((option, i) => (
              <Link key={i} href={option.path} className="block">
                <div className="border border-white/5 bg-[#111111] rounded-3xl p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-xl text-[#FF725E]">
                      {option.icon}
                    </div>
                    <span className="font-bold">{option.name}</span>
                  </div>
                  <ChevronRight size={18} className="text-white/20" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div className="flex justify-center mt-12 mb-10">
          <button
            onClick={async () => {
              await logOutAction(locale);
            }}
            className="flex items-center gap-2.5 font-bold text-lg bg-[#111111] text-[#FF725E] border border-white/5 px-10 py-4 rounded-full hover:bg-white/5 transition-colors"
          >
            <LogOut size={20} />
            {t("logoutButton")}
          </button>
        </div>

      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            onClick={() => setIsModalOpen(false)}
          />
          
          <div className="relative bg-[#111111] border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-2xl font-black italic uppercase mb-8 text-center tracking-tight">
              {t("updatePhoto")}
            </h3>

            <label 
              htmlFor="profile-upload"
              className="w-40 h-40 rounded-full border-2 border-dashed border-[#FF725E] flex flex-col items-center justify-center bg-white/5 mb-8 cursor-pointer hover:bg-[#FF725E]/5 transition-colors group"
            >
              <Camera size={40} className="text-[#FF725E] mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold uppercase text-gray-500">{t("tapToSelect")}</span>
              <input 
                type="file" 
                id="profile-upload" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => {
                  console.log(e.target.files?.[0]);
                }}
              />
            </label>

            <button 
              className="w-full bg-[#FF725E] text-black font-black py-4 rounded-full uppercase tracking-widest text-sm hover:scale-[1.02] transition-transform mb-4 flex items-center justify-center gap-2"
            >
              <Upload size={18} />
              {t("uploadNow")}
            </button>

            <button 
              onClick={() => setIsModalOpen(false)}
              className="text-gray-500 font-bold uppercase text-xs tracking-widest hover:text-white transition-colors"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}

      {/* Your Original Navigation */}
      <Navigation/>
      
    </div>
  );
}