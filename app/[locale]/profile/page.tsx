"use client";

import { useState, useEffect } from "react";
import { checkIsGuest } from "@/app/actions/guest";
import { getGroupByUser } from "@/app/actions/group";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Navigation from "@/app/components/Navigation";

export default function ProfilePage() {
  const [isGuest, setIsGuest] = useState(false);
  const [group, setGroup] = useState<any | null>(null);

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
    };
    init();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-32">

      {/* Header */}
      <div className="bg-[#111111] pb-8 rounded-b-[2.5rem] shadow-lg border-b border-white/5">
        
        <div className="px-6 pt-12 pb-4 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-white">{t("title")}</h1>

          <button className="p-3 bg-white/5 rounded-full text-gray-400 hover:bg-white/10 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.797.939a4.106 4.106 0 0 1 1.21.724c.348.256.82.322 1.222.17l.866-.33c.515-.196 1.103.037 1.323.53l.547.1.22.947c.22.5.011 1.1-.478 1.365l-.763.42c-.41.226-.644.68-.586 1.144.023.183.035.37.035.558s-.012.375-.035.558c-.058.464.176.918.586 1.144l.763.42c.49.265.698.865.478 1.365l-.547.947c-.22.493-.808.726-1.323.53l-.866-.33c-.402-.152-.874-.086-1.222.17a4.109 4.109 0 0 1-1.21.724c-.413.175-.727.515-.797.939l-.149.894c-.09.542-.56.94-1.11.94h-1.093c-.55 0-1.02-.398-1.11-.94l-.149-.894c-.07-.424-.384-.764-.797-.939a4.108 4.108 0 0 1-1.21-.724c-.348-.256-.82-.322-1.222-.17l-.866.33c-.515.196-1.103-.037-1.323-.53l-.547-.947c-.22-.5-.011-1.1.478-1.365l.763-.42c.41-.226.644-.68.586-1.144A4.111 4.111 0 0 1 6.3 12c0-.188.012-.375.035-.558.058-.464-.176-.918-.586-1.144l-.763-.42c-.49-.265-.698-.865-.478-1.365l.547-.947c.22-.493.808-.726 1.323-.53l.866.33c.402.152.874.086 1.222-.17a4.107 4.107 0 0 1 1.21-.724c.413-.175.727-.515.797-.939l.149-.894Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
        </div>

        {/* Profile Picture */}
        <div className="flex flex-col items-center mt-2">
          <div className="relative">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-black shadow-2xl bg-[#222222]">
              <img 
                src="https://i.pravatar.cc/150?u=thomas" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>

            <button className="absolute bottom-0 right-0 p-2.5 bg-[#FF5733] rounded-full text-white shadow-lg border-2 border-black hover:bg-[#e64d2e] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.89 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.89l12.673-12.673z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125L16.875 4.5" />
              </svg>
            </button>
          </div>

          <h2 className="mt-4 text-2xl font-bold text-white">Thomas</h2>
        </div>
      </div>

      {/* Group Section */}
      <div className="mt-8 px-6">
        <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-4 ml-1">
          {t("groupsSection")}
        </h3>

        {group ? (
          /* ⭐ GRUPPENPROFIL ANZEIGE ⭐ */
          <div className="bg-[#111111] rounded-[2.5rem] p-8 shadow-xl border border-white/5 space-y-6">

            {/* Fotos */}
            <div className="grid grid-cols-3 gap-2">
              {group.photos.map((url: string, i: number) => (
                <img
                  key={i}
                  src={url}
                  className="rounded-xl w-full h-full object-cover"
                />
              ))}
            </div>

            {/* Details */}
            <div className="space-y-2 text-left">
              <p><strong>{t("members")}:</strong> {group.membersCount}</p>
              <p><strong>{t("gender")}:</strong> {t(group.gender)}</p>
              <p><strong>{t("ageRange")}:</strong> {group.ageMin}–{group.ageMax}</p>

              <p><strong>{t("searchGender")}:</strong> {t(group.searchGender)}</p>
              <p><strong>{t("preferredAgeRange")}:</strong> 18–{group.searchAgeMax}</p>
              <p><strong>{t("maxDistance")}:</strong> {group.maxDistance} km</p>

              <p>
                <strong>{t("publicProfile")}:</strong>{" "}
                {group.publicProfile ? t("yes") : t("no")}
              </p>

              <p className="text-gray-400">{group.description}</p>
            </div>

            {/* Instagram */}
            <div className="space-y-2">
              <h4 className="font-bold">{t("instagramProfiles")}</h4>
              {group.instagram.map((user: string, i: number) => (
                <a
                  key={i}
                  href={`https://instagram.com/${user}`}
                  target="_blank"
                  className="text-[#FF55A5]"
                >
                  @{user}
                </a>
              ))}
            </div>

          </div>
        ) : (
          /* ⭐ KEINE GRUPPE → CREATE-GROUP BUTTON ⭐ */
          <div className="bg-[#111111] rounded-[2.5rem] p-8 shadow-xl border border-white/5 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#FF5733]/10 text-[#FF5733] rounded-full flex items-center justify-center mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
            </div>

            <p className="text-gray-400 font-medium text-[15px] leading-relaxed mb-8">
              {t("noGroupTitle")}<br />
              {t("noGroupDesc")}
            </p>

            <button
              onClick={() => router.push(`/${locale}/profile/create-group`)}
              className="w-full bg-[#FF5733] text-white font-extrabold py-4 rounded-2xl shadow-[0_4px_20px_rgba(255,87,51,0.4)] hover:bg-[#e64d2e] active:scale-95 transition-all"
            >
              {t("createGroupButton")}
            </button>
          </div>
        )}
      </div>

      {/* Account Section */}
      <div className="mt-8 px-6">
        <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-4 ml-1">
          {t("accountSection")}
        </h3>

        <div className="bg-[#111111] rounded-3xl shadow-xl border border-white/5 overflow-hidden">
          <button className="w-full px-4 py-4 flex items-center hover:bg-white/5 transition-colors">
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
            </div>
            <span className="font-bold text-gray-200 text-lg">{t("logoutButton")}</span>
          </button>
        </div>
      </div>

      <Navigation isGuest={isGuest} />
    </div>
  );
}