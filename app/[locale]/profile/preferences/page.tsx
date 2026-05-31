"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { getGroupByUser, createGroupAction } from "@/app/actions/group";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";

export default function PreferencesPage() {
  const router = useRouter();
  const locale = useLocale();

  const [searchGender, setSearchGender] = useState("MIXED");
  const [searchAgeMin, setSearchAgeMin] = useState(18);
  const [searchAgeMax, setSearchAgeMax] = useState(35);
  const [maxDistance, setMaxDistance] = useState(10);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load current preferences from the user's group
  useEffect(() => {
    async function loadPreferences() {
      const group = await getGroupByUser();
      if (group) {
        setSearchGender((group.searchGender as string) || "MIXED");
        setSearchAgeMin((group.searchAgeMin as number) ?? 18);
        setSearchAgeMax((group.searchAgeMax as number) ?? 35);
        setMaxDistance((group.maxDistance as number) ?? 10);
      }
    }
    loadPreferences();
  }, []);

  async function handleSave() {
    if (loading) return;
    setLoading(true);

    // We need the current group data to do a full upsert without losing other fields
    const existingGroup = await getGroupByUser();
    if (!existingGroup) {
      alert("Please create a group profile first.");
      setLoading(false);
      router.push(`/${locale}/profile/create-group`);
      return;
    }

    const formData = new FormData();

    // Keep all existing fields
    formData.append("membersCount", String((existingGroup.membersCount as number) ?? 1));
    formData.append("groupGender", (existingGroup.gender as string) ?? "ANY");
    formData.append("ageMin", String((existingGroup.ageMin as number) ?? 18));
    formData.append("ageMax", String((existingGroup.ageMax as number) ?? 30));
    formData.append("description", (existingGroup.description as string) ?? "");
    formData.append("publicProfile", (existingGroup.publicProfile as boolean) ? "true" : "false");

    // Preserve existing photos
    const photos = (existingGroup.photos as string[]) ?? [];
    photos.forEach((url) => formData.append("existingPhotos", url));

    // Preserve existing instagram
    const instagram = (existingGroup.instagram as string[]) ?? [];
    instagram.forEach((handle, i) => formData.append(`instagram[${i}]`, handle));

    // Updated search preferences
    formData.append("searchGender", searchGender);
    formData.append("searchAgeMin", String(searchAgeMin));
    formData.append("searchAgeMax", String(searchAgeMax));
    formData.append("maxDistance", String(maxDistance));

    // Get fresh GPS coordinates
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            formData.append("latitude", String(position.coords.latitude));
            formData.append("longitude", String(position.coords.longitude));
            await createGroupAction(formData, locale);
          } catch (err: unknown) {
            const e = err as Error;
            if (e?.message === "NEXT_REDIRECT") {
              // redirect is expected — show saved feedback before it fires
              setSaved(true);
              setTimeout(() => router.push(`/${locale}/search-groups`), 800);
              return;
            }
            console.error(err);
            alert("Error saving preferences.");
          } finally {
            setLoading(false);
          }
        },
        () => {
          // No location — save without updating coordinates
          formData.append("latitude", String((existingGroup.latitude as number) ?? ""));
          formData.append("longitude", String((existingGroup.longitude as number) ?? ""));
          createGroupAction(formData, locale)
            .catch((err: unknown) => {
              const e = err as Error;
              if (e?.message !== "NEXT_REDIRECT") console.error(err);
            })
            .finally(() => {
              setSaved(true);
              setTimeout(() => router.push(`/${locale}/search-groups`), 800);
              setLoading(false);
            });
        }
      );
    } else {
      setLoading(false);
      alert("Geolocation not supported.");
    }
  }

  const genderOptions = [
    { value: "MIXED", label: "Mixed" },
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" },
    { value: "DIVERSE", label: "Diverse" },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={20} className="text-[#FF725E]" />
          <h1 className="text-xl font-black uppercase tracking-tight">Search Preferences</h1>
        </div>
      </div>

      <div className="px-6 space-y-6">

        {/* Info banner */}
        <div className="bg-[#FF725E]/10 border border-[#FF725E]/20 rounded-2xl px-5 py-4">
          <p className="text-[11px] text-[#FF725E] font-bold uppercase tracking-widest mb-1">How it works</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            These filters control which groups you see in the discovery feed. Changes apply immediately after saving.
          </p>
        </div>

        {/* Search Gender */}
        <div className="bg-[#121212] rounded-[2rem] p-6 space-y-4 shadow-[0_0_20px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-[#FF725E]/40 rounded-full" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Looking for</h3>
          </div>

          <div className="flex bg-black/40 p-1 rounded-xl gap-1">
            {genderOptions.map((g) => (
              <label
                key={g.value}
                data-checked={searchGender === g.value}
                className="flex-1 text-center py-2.5 rounded-lg cursor-pointer text-gray-500 transition-all
                           data-[checked=true]:bg-[#FF725E] data-[checked=true]:text-black"
              >
                <input
                  type="radio"
                  name="searchGender"
                  value={g.value}
                  className="hidden"
                  checked={searchGender === g.value}
                  onChange={() => setSearchGender(g.value)}
                />
                <span className="text-[11px] font-semibold tracking-wide">{g.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Age Range */}
        <div className="bg-[#121212] rounded-[2rem] p-6 space-y-6 shadow-[0_0_20px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#FFD54F] rounded-full" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Age Range</h3>
            <span className="ml-auto text-white bg-[#222] px-3 py-1 rounded-full border border-[#333] text-[11px] font-bold">
              {searchAgeMin} — {searchAgeMax}
            </span>
          </div>

          {/* Custom Dual-Thumb Slider */}
          <div className="relative h-8 flex items-center pt-2">
            {/* Background track */}
            <div className="absolute w-full h-1 bg-[#333] rounded-lg"></div>
            {/* Active track (Highlighted in Orange) */}
            <div 
              className="absolute h-1 bg-[#FF725E] rounded-lg"
              style={{ 
                left: `${((searchAgeMin - 18) / 32) * 100}%`, 
                right: `${100 - ((searchAgeMax - 18) / 32) * 100}%` 
              }}
            ></div>
            
            {/* Min Range Slider */}
            <input
              type="range"
              min="18"
              max="50"
              value={searchAgeMin}
              onChange={(e) => setSearchAgeMin(Math.min(Number(e.target.value), searchAgeMax - 1))}
              className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF725E] [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#FF725E] [&::-moz-range-thumb]:border-none"
            />
            
            {/* Max Range Slider */}
            <input
              type="range"
              min="18"
              max="50"
              value={searchAgeMax}
              onChange={(e) => setSearchAgeMax(Math.max(Number(e.target.value), searchAgeMin + 1))}
              className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF725E] [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#FF725E] [&::-moz-range-thumb]:border-none"
            />
          </div>
        </div>

        {/* Max Distance */}
        <div className="bg-[#121212] rounded-[2rem] p-6 space-y-4 shadow-[0_0_20px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#4FC3F7] rounded-full" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Max Distance</h3>
            <span className="ml-auto text-white bg-[#222] px-3 py-1 rounded-full border border-[#333] text-[11px] font-bold">
              {maxDistance} km
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="50"
            value={maxDistance}
            onChange={(e) => setMaxDistance(Number(e.target.value))}
            className="w-full accent-[#FF725E] h-1 bg-[#333] rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-gray-600">
            <span>1 km</span>
            <span>50 km</span>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || saved}
          className={`w-full font-black py-5 rounded-[1.5rem] text-sm uppercase tracking-[0.2em] transition-all ${
            saved
              ? "bg-green-500 text-black"
              : loading
              ? "bg-[#333] text-gray-500"
              : "bg-[#FF725E] text-black hover:bg-[#ff8575]"
          }`}
        >
          {saved ? "✓ Saved!" : loading ? "Saving..." : "Apply Preferences"}
        </button>
      </div>
    </div>
  );
}
