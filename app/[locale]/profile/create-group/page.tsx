"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { createGroupAction, getGroupByUser } from "@/app/actions/group";

export default function CreateGroupPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("CreateGroup");

  const [membersCount, setMembersCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [ageMin] = useState(21);
  const [ageMax, setAgeMax] = useState(30);

  const [description, setDescription] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [instagramLinks, setInstagramLinks] = useState<string[]>([""]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Load existing data if the user already has a group
  useEffect(() => {
    async function loadData() {
      const existingGroup = await getGroupByUser();
      if (existingGroup) {
        setIsEditing(true);
        setMembersCount(existingGroup.membersCount);
        setAgeMax(existingGroup.ageMax);
        setDescription(existingGroup.description || "");
        if (existingGroup.instagram && existingGroup.instagram.length > 0) {
          setInstagramLinks(existingGroup.instagram);
        }
        setAgreed(true); // Since they already agreed before
      }
    }
    loadData();
  }, []);

  const addInstagram = () => setInstagramLinks([...instagramLinks, ""]);
  const updateInstagram = (i: number, v: string) => {
    const arr = [...instagramLinks];
    arr[i] = v;
    setInstagramLinks(arr);
  };
  const removeInstagram = (i: number) =>
    setInstagramLinks(instagramLinks.filter((_, idx) => idx !== i));

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // 1. Append the new coordinates
            formData.append("latitude", position.coords.latitude.toString());
            formData.append("longitude", position.coords.longitude.toString());

            // 2. Keep all your original code
            formData.append("membersCount", membersCount.toString());
            formData.append("ageMin", ageMin.toString());
            formData.append("ageMax", ageMax.toString());

            formData.append("searchGender", formData.get("searchGender") as string);
            formData.append("searchAgeMax", formData.get("searchAgeMax") as string);
            formData.append("maxDistance", formData.get("maxDistance") as string);
            formData.append(
              "publicProfile",
              formData.get("publicProfile") ? "true" : "false"
            );

            instagramLinks.forEach((username, i) => {
              if (username.trim() !== "") {
                formData.append(`instagram[${i}]`, username.trim());
              }
            });

            formData.append("description", description.trim());
            formData.append("agreedToTerms", agreed ? "true" : "false");

            photos.forEach((file) => {
              formData.append(`photos`, file);
            });




            // 3. Execute the Server Action
            await createGroupAction(formData, locale);
            router.push(`/${locale}/profile`);
            
          } catch (error: any) {
            if (error.message === "NEXT_REDIRECT") {
               return; 
            }
            console.error("Error processing group:", error);
            alert(t("error"));
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          setLoading(false);
          alert("Location required to update group.");
        }
      );
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-20">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>

        <h1 className="text-xl font-black uppercase tracking-tight">
          {isEditing ? "Edit Your Group" : t("title")}
        </h1>

        <div className="w-10 h-10 flex items-center justify-center text-gray-500">
          ⓘ
        </div>
      </div>

      <form onSubmit={onSubmit} className="px-6 space-y-8">
        {/* Upload Section */}
        <div className="space-y-4">
          <input
            type="file"
            id="photoUpload"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);

              // max 6 Bilder
              const limited = [...photos, ...files].slice(0, 6);
              setPhotos(limited);

              // reset input damit gleiche Datei erneut gewählt werden kann
              e.target.value = "";
            }}
          />

          <button
            type="button"
            onClick={() => document.getElementById("photoUpload")?.click()}
            className="w-full bg-[#FF725E] hover:bg-[#ff8575] text-black font-bold py-5 rounded-2xl 
                    flex items-center justify-center gap-3 transition-colors 
                    shadow-[0_4px_0_#E85C4A]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
              />
            </svg>

            {t("uploadPhotos")}
          </button>

          {/* Photo Grid */}
          <div className="grid grid-cols-3 gap-2">
            {photos.map((file, i) => (
              <div key={i} className="relative aspect-square">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`photo-${i}`}
                  className="w-full h-full object-cover rounded-xl"
                />

                <button
                  type="button"
                  onClick={() => {
                    setPhotos(photos.filter((_, idx) => idx !== i));
                  }}
                  className="absolute top-2 right-2 bg-black/70 text-white rounded-full 
                            w-7 h-7 flex items-center justify-center backdrop-blur-sm
                            hover:bg-black transition"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* Empty placeholders */}
            {Array.from({ length: 6 - photos.length }).map((_, i) => (
              <button
                key={`empty-${i}`}
                type="button"
                onClick={() => document.getElementById("photoUpload")?.click()}
                className="aspect-square bg-[#121212] rounded-xl border-2 border-dashed
                        border-[#FF725E]/20 flex items-center justify-center
                        text-gray-600 hover:border-[#FF725E]/40 hover:text-[#FF725E]
                        transition"
              >
                <span className="text-2xl font-light">+</span>
              </button>
            ))}
          </div>

          <p className="text-[9px] text-center text-[#FF725E] font-bold uppercase tracking-widest">
            {photos.length}/6 {t("maxPhotos")}
          </p>
        </div>

        {/* Group Details */}
        <div className="bg-[#121212] rounded-[2rem] p-6 space-y-8 shadow-[0_0_20px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#FF725E]/40 rounded-full"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
              {t("groupDetails")}
            </h3>
          </div>

          {/* Members Counter */}
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm">{t("members")}</span>

            <div className="flex items-center gap-4 bg-black/40 p-1 rounded-full">
              <button
                type="button"
                onClick={() => setMembersCount(Math.max(1, membersCount - 1))}
                className="w-8 h-8 bg-[#FF725E]/10 text-[#FF725E] rounded-full 
                           flex items-center justify-center font-black hover:bg-[#FF725E]/20"
              >
                –
              </button>

              <span className="text-sm font-bold w-4 text-center text-white">
                {membersCount}
              </span>

              <button
                type="button"
                onClick={() => setMembersCount(membersCount + 1)}
                className="w-8 h-8 bg-[#FF725E] text-white rounded-full 
                           flex items-center justify-center font-black 
                           shadow-[0_2px_0_#E85C4A] hover:bg-[#ff8575]"
              >
                +
              </button>
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-3">
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
              {t("memberGender")}
            </span>

            <div className="flex bg-black/40 p-1 rounded-xl gap-1">
              {["ANY", "MALE", "FEMALE", "OTHER"].map((g) => (
                <label
                  key={g}
                  className="flex-1 text-center py-2 rounded-lg cursor-pointer 
                             text-gray-500 transition-all hover:scale-105
                             data-[checked=true]:bg-[#FF725E] data-[checked=true]:text-black"
                >
                  <input
                    type="radio"
                    name="groupGender"
                    value={g}
                    className="hidden peer"
                    defaultChecked={g === "ANY"}
                    onChange={(e) => {
                      e.target.parentElement?.setAttribute(
                        "data-checked",
                        "true",
                      );
                    }}
                  />
                  <span className="text-[11px] font-semibold tracking-wide">
                    {t(g)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Age Range */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <span>{t("ageRange")}</span>
              <span className="text-white bg-[#222] px-3 py-1 rounded-full border border-[#333]">
                {ageMin} — {ageMax}
              </span>
            </div>

            <input
              type="range"
              min="18"
              max="50"
              value={ageMax}
              onChange={(e) => setAgeMax(parseInt(e.target.value))}
              className="w-full accent-[#FF725E] h-1 bg-[#333] rounded-lg appearance-none"
            />
          </div>
        </div>

        {/* Search Preferences */}
        <div className="bg-[#121212] rounded-[2rem] p-6 space-y-8 shadow-[0_0_20px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#FFD54F] rounded-full"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
              {t("searchPreferences")}
            </h3>
          </div>

          {/* Search Gender */}
          <div className="space-y-3">
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
              {t("searchGender")}
            </span>

            <div className="flex bg-black/40 p-1 rounded-xl gap-1">
              {["ANY", "MALE", "FEMALE", "OTHER"].map((g) => (
                <label
                  key={g}
                  className="flex-1 text-center py-2 rounded-lg cursor-pointer 
                             text-gray-500 transition-all hover:scale-105
                             data-[checked=true]:bg-[#FF725E] data-[checked=true]:text-black"
                >
                  <input
                    type="radio"
                    name="searchGender"
                    value={g}
                    className="hidden peer"
                    defaultChecked={g === "ANY"}
                    onChange={(e) => {
                      e.target.parentElement?.setAttribute(
                        "data-checked",
                        "true",
                      );
                    }}
                  />
                  <span className="text-[11px] font-semibold tracking-wide">
                    {t(g)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Search Age Range */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <span>{t("preferredAgeRange")}</span>
              <span className="text-white bg-[#222] px-3 py-1 rounded-full border border-[#333]">
                18 — 35
              </span>
            </div>

            <input
              type="range"
              name="searchAgeMax"
              min="18"
              max="50"
              defaultValue="35"
              className="w-full accent-[#FF725E] h-1 bg-[#333] rounded-lg appearance-none"
            />
          </div>

          {/* Max Distance */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <span>{t("maxDistance")}</span>
              <span className="text-white bg-[#222] px-3 py-1 rounded-full border border-[#333]">
                10 km
              </span>
            </div>

            <input
              type="range"
              name="maxDistance"
              min="1"
              max="50"
              defaultValue="10"
              className="w-full accent-[#FF725E] h-1 bg-[#333] rounded-lg appearance-none"
            />
          </div>

          {/* Public Profile */}
          <div className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔒</span>
              <div>
                <p className="text-sm font-bold">{t("publicProfile")}</p>
                <p className="text-[10px] text-gray-500">{t("visibleToAll")}</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="publicProfile"
                className="sr-only peer"
                defaultChecked
              />
              <div
                className="w-10 h-5 bg-gray-700 rounded-full peer-checked:bg-[#FF725E] 
                              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                              after:bg-white after:h-4 after:w-4 after:rounded-full after:transition-all 
                              peer-checked:after:translate-x-5"
              ></div>
            </label>
          </div>
        </div>

        {/* Instagram Links */}
        <div className="bg-[#121212] rounded-[2rem] p-6 space-y-6 shadow-[0_0_20px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#FF55A5] rounded-full"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
              {t("instagramProfiles")}
            </h3>
          </div>

          <p className="text-gray-500 text-[11px] leading-relaxed">
            {t("instagramInfo")}
          </p>

          {instagramLinks.map((value, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="text"
                name={`instagram_${index}`}
                value={value}
                onChange={(e) => updateInstagram(index, e.target.value)}
                placeholder="@username"
                className="flex-1 bg-black/40 border border-white/5 rounded-xl p-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF55A5]"
              />

              <button
                type="button"
                onClick={() => removeInstagram(index)}
                className="w-10 h-10 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-500/20 transition"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addInstagram}
            className="w-full bg-[#FF55A5]/20 text-[#FF55A5] font-bold py-3 rounded-xl hover:bg-[#FF55A5]/30 transition"
          >
            {t("addInstagram")}
          </button>
        </div>

        {/* Short Description */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
            {t("shortDescription")}
          </h3>

          <div className="relative">
            <textarea
              name="description"
              maxLength={200}
              placeholder={t("descriptionPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#121212] border border-white/5 rounded-[1.5rem] p-5 text-sm text-white placeholder:text-gray-700 h-32 focus:outline-none focus:border-[#FF725E] transition-all"
            />
            <span className="absolute bottom-3 right-5 text-[10px] text-gray-500">
              {description.length}/200
            </span>
          </div>
        </div>

        {/* Terms & Submit */}
        <div className="space-y-4">
          <div className="flex items-start gap-3 px-2">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 accent-[#FF725E]"
            />

            <p className="text-[10px] text-gray-500 leading-relaxed">
              {t.rich("termsText", {
                terms: (chunks) => (
                  <a
                    href="https://gloo.app/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FF725E] hover:underline"
                  >
                    {chunks}
                  </a>
                ),
                guidelines: (chunks) => (
                  <a
                    href="https://gloo.app/guidelines"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FF725E] hover:underline"
                  >
                    {chunks}
                  </a>
                ),
              })}
            </p>
          </div>

          <button
            type="submit"
            disabled={!agreed || loading}
            className={`w-full font-black py-5 rounded-[1.5rem] text-sm uppercase tracking-[0.2em] transition-all ${
              agreed
                ? "bg-[#FF725E] text-black hover:bg-[#ff8575]"
                : "bg-[#333333] text-gray-500 opacity-50"
            }`}
          >
            {loading
              ? "Processing..."
              : isEditing
                ? "Update Profile"
                : t("createGroupButton")}
          </button>
        </div>
      </form>
    </div>
  );
}