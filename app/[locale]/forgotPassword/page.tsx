"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("ForgotPassword");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement backend logic for sending the reset email
    console.log("Password reset requested");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans py-12">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] px-8 pb-8 pt-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col relative">
        
        {/* Back Button */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => router.push(`/${locale}/login`)} 
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-900"
            aria-label="Back to Login"
          >
            <ArrowLeft size={24} />
          </button>
        </div>
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 mb-3">
            {t('title')}
          </h1>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">
            {t('description')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          <div className="space-y-1.5">
            <input
              name="email" 
              type="email" 
              placeholder={t('emailPlaceholder')}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#FF725E] transition-all"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#FF725E] text-black font-black py-4 rounded-full text-sm uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-[#FF725E]/10"
            >
              {t('submitButton')}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <Link href={`/${locale}/login`} className="text-xs font-bold text-gray-400 hover:text-gray-900 uppercase tracking-wider transition-colors">
            {t('backToLogin')}
          </Link>
        </div>

      </div>
    </div>
  );
}