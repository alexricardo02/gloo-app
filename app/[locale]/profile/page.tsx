"use client";

import { useState, useEffect } from "react";
import { checkIsGuest } from "@/app/actions/guest";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Navigation from "@/app/components/Navigation";
import { Users } from "lucide-react";

export default function ProfilePage() {

    const [isGuest, setIsGuest] = useState(false);
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    const init = async () => {
      const status = await checkIsGuest();
      setIsGuest(status);
    };
    init();
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col font-sans pb-32">
      
      {/* Top White Section: Header & User Info */}
      <div className="bg-white pb-8 rounded-b-[2rem] shadow-sm border-b border-gray-100">
        
        {/* Header */}
        <div className="px-6 pt-12 pb-4 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Profile</h1>
          <button className="p-3 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
            {/* Gear Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.797.939a4.106 4.106 0 0 1 1.21.724c.348.256.82.322 1.222.17l.866-.33c.515-.196 1.103.037 1.323.53l.547.1.22.947c.22.5.011 1.1-.478 1.365l-.763.42c-.41.226-.644.68-.586 1.144.023.183.035.37.035.558s-.012.375-.035.558c-.058.464.176.918.586 1.144l.763.42c.49.265.698.865.478 1.365l-.547.947c-.22.493-.808.726-1.323.53l-.866-.33c-.402-.152-.874-.086-1.222.17a4.109 4.109 0 0 1-1.21.724c-.413.175-.727.515-.797.939l-.149.894c-.09.542-.56.94-1.11.94h-1.093c-.55 0-1.02-.398-1.11-.94l-.149-.894c-.07-.424-.384-.764-.797-.939a4.108 4.108 0 0 1-1.21-.724c-.348-.256-.82-.322-1.222-.17l-.866.33c-.515.196-1.103-.037-1.323-.53l-.547-.947c-.22-.5-.011-1.1.478-1.365l.763-.42c.41-.226.644-.68.586-1.144A4.111 4.111 0 0 1 6.3 12c0-.188.012-.375.035-.558.058-.464-.176-.918-.586-1.144l-.763-.42c-.49-.265-.698-.865-.478-1.365l.547-.947c.22-.493.808-.726 1.323-.53l.866.33c.402.152.874.086 1.222-.17a4.107 4.107 0 0 1 1.21-.724c.413-.175.727-.515.797-.939l.149-.894Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
        </div>

        {/* User Avatar & Name */}
        <div className="flex flex-col items-center mt-2">
          <div className="relative">
            {/* Avatar Profile */}
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-200">
              <img 
                src="https://i.pravatar.cc/150?u=thomas" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Edit Pencil Icon */}
            <button className="absolute bottom-0 right-0 p-2.5 bg-[#FF5733] rounded-full text-white shadow-md border-2 border-white hover:bg-[#e64d2e] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.89 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.89l12.673-12.673z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125L16.875 4.5" />
              </svg>
            </button>
          </div>
          
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Thomas</h2>
        </div>
      </div>

      {/* Group Profile Section (Empty State) */}
      <div className="mt-8 px-6">
        <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4 ml-1">
          Groups
        </h3>
        
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
          {/* Empty State Icon */}
          <div className="w-16 h-16 bg-[#FFF0ED] text-[#FF5733] rounded-full flex items-center justify-center mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
          </div>
          
          {/* Text */}
          <p className="text-gray-500 font-medium text-[15px] leading-relaxed mb-8">
            You haven't created a group profile yet.<br/>
            Create one to go out and match with others!
          </p>
          
          {/* Button */}
          <button className="w-full bg-[#FF5733] text-white font-extrabold py-4 rounded-2xl shadow-[0_4px_14px_rgba(255,87,51,0.39)] hover:bg-[#e64d2e] active:scale-95 transition-all">
            Create Group Profile
          </button>
        </div>
      </div>

      {/* Account Section */}
      <div className="mt-8 px-6">
        <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4 ml-1">
          Account
        </h3>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button className="w-full px-4 py-4 flex items-center hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500 mr-4">
              {/* Logout Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
            </div>
            <span className="font-bold text-gray-800 text-lg">Logout</span>
          </button>
        </div>
      </div>


        <Navigation isGuest={isGuest} />
    </div>
  );
}