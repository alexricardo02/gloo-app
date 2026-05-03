"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

export default function RegisterPage() {
  const t = useTranslations("RegisterPage");
  const locale = useLocale();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Validierung: Passwörter identisch?
    if (data.password !== data.confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          dob: data.dob,
        }),
      });

      // Wichtig: Erst den Body parsen, bevor wir response.ok prüfen
      const result = await response.json();

      if (!response.ok) {
        // Hier greifen wir die Fehlermeldung aus der route.ts ab
        throw new Error(result.error || "Ein unerwarteter Fehler ist aufgetreten.");
      }

      // Erfolg: Weiterleitung zum Dashboard
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      // Hier landet entweder der Error aus dem "throw" oder Netzwerkfehler
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col font-sans">
      {/* Back Button */}
      <button 
        onClick={() => router.back()} 
        className="mb-8 p-3 w-fit rounded-full bg-white/5 border border-white/10 active:scale-90 transition-transform hover:bg-white/10"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>

      <header className="mb-10">
        <h1 className="text-4xl font-black tracking-tight mb-2 italic uppercase">
          {t("title")}
        </h1>
        <p className="text-gray-400 text-sm">
          Tritt der Community bei und starte die Nacht.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Vorname & Nachname */}
        <div className="grid grid-cols-2 gap-4">
          <input 
            name="firstName" 
            required 
            className="bg-[#111] border border-white/10 rounded-2xl p-4 focus:border-[#FF5733] outline-none transition-all placeholder:text-gray-600" 
            placeholder={t("firstName")} 
          />
          <input 
            name="lastName" 
            required 
            className="bg-[#111] border border-white/10 rounded-2xl p-4 focus:border-[#FF5733] outline-none transition-all placeholder:text-gray-600" 
            placeholder={t("lastName")} 
          />
        </div>

        {/* Geburtsdatum */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-gray-500 ml-4 tracking-widest">Geburtsdatum</label>
          <input 
            name="dob" 
            type="date" 
            required 
            className="bg-[#111] border border-white/10 rounded-2xl p-4 focus:border-[#FF5733] outline-none text-gray-400" 
          />
        </div>

        {/* Email */}
        <input 
          name="email" 
          type="email" 
          required 
          className="bg-[#111] border border-white/10 rounded-2xl p-4 focus:border-[#FF5733] outline-none placeholder:text-gray-600" 
          placeholder={t("email")} 
        />

        {/* Passwort */}
        <div className="relative">
          <input 
            name="password" 
            type={showPassword ? "text" : "password"} 
            required 
            className="w-full bg-[#111] border border-white/10 rounded-2xl p-4 focus:border-[#FF5733] outline-none placeholder:text-gray-600" 
            placeholder={t("password")} 
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)} 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold hover:text-white"
          >
            {showPassword ? "HIDE" : "SHOW"}
          </button>
        </div>

        {/* Passwort bestätigen */}
        <input 
          name="confirmPassword" 
          type="password" 
          required 
          className="bg-[#111] border border-white/10 rounded-2xl p-4 focus:border-[#FF5733] outline-none placeholder:text-gray-600" 
          placeholder={t("confirmPassword")} 
        />

        {/* FEHLERMELDUNG ANZEIGE */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-xs font-bold animate-in fade-in slide-in-from-top-2">
            ⚠️ {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 bg-[#FF5733] text-white font-bold py-5 rounded-2xl shadow-xl shadow-[#FF5733]/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center items-center gap-3"
        >
          {loading && (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {loading ? t("loading") : t("submit")}
        </button>
      </form>

      <footer className="mt-8 text-center pb-10">
        <Link href={`/${locale}/login`} className="text-gray-500 text-sm font-medium hover:text-white transition-colors">
          {t("signInLink")}
        </Link>
      </footer>
    </div>
  );
}