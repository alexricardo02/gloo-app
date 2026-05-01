"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {

    const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans py-12">
      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-xl flex flex-col">
        
        {/* Header */}
        <div className="mt-2 mb-8">
          <h1 className="text-3xl font-extrabold text-black mb-2">Sign up</h1>
          <p className="text-sm text-gray-600">
            Already have an account? <Link href="/login" className="text-black font-bold hover:underline">Sign in</Link>
          </p>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-4">
          
          {/* Row 1: Names */}
          <div className="flex gap-4">
            {/* Input First Name */}
            <div className="relative flex items-center bg-[#F7F7F7] rounded-2xl px-4 py-4 focus-within:ring-2 focus-within:ring-black/20 transition-all w-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-500 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              <input 
                type="text" 
                placeholder="First Name" 
                className="bg-transparent outline-none w-full ml-3 text-gray-800 placeholder-gray-400 font-medium"
              />
            </div>

            {/* Input Last Name */}
            <div className="relative flex items-center bg-[#F7F7F7] rounded-2xl px-4 py-4 focus-within:ring-2 focus-within:ring-black/20 transition-all w-full">
              <input 
                type="text" 
                placeholder="Last Name" 
                className="bg-transparent outline-none w-full ml-2 text-gray-800 placeholder-gray-400 font-medium"
              />
            </div>
          </div>

          {/* Row 2: Date of Birth (Below names) */}
          <div className="relative flex items-center bg-[#F7F7F7] rounded-2xl px-4 py-4 focus-within:ring-2 focus-within:ring-black/20 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#FF5733] shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <input 
              type="date" 
              required
              className="bg-transparent outline-none w-full ml-3 text-gray-800 invalid:text-gray-400 font-medium"
              placeholder="Date of Birth"
            />
          </div>

          {/* Row 3: Phone (Optional - Below DOB) */}
          <div className="relative flex items-center bg-[#F7F7F7] rounded-2xl px-4 py-4 focus-within:ring-2 focus-within:ring-black/20 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-500 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.48-4.18-7.076-7.076l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
            </svg>
            <input 
              type="tel" 
              placeholder="Phone (Optional)" 
              className="bg-transparent outline-none w-full ml-3 text-gray-800 placeholder-gray-400 font-medium"
            />
          </div>

          {/* Input Email */}
          <div className="relative flex items-center bg-[#F7F7F7] rounded-2xl px-4 py-4 focus-within:ring-2 focus-within:ring-black/20 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-500 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
            <input 
              type="email" 
              placeholder="Email Address" 
              className="bg-transparent outline-none w-full ml-3 text-gray-800 placeholder-gray-400 font-medium"
            />
          </div>

          {/* Input Password */}
          <div className="relative flex items-center bg-[#F7F7F7] rounded-2xl px-4 py-4 focus-within:ring-2 focus-within:ring-black/20 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-500 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            <input 
              // Cambia el tipo dinámicamente
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              className="bg-transparent outline-none w-full ml-3 text-gray-800 placeholder-gray-400 font-medium"
            />
            {/* Botón de alternancia */}
            <button 
              type="button" // Evita enviar el formulario
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {/* Iconos dinámicos */}
              {showPassword ? (
                /* Icono de Ojo Tachado (Ocultar) */
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                /* Icono de Ojo Abierto (Mostrar) */
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative flex items-center bg-[#F7F7F7] rounded-2xl px-4 py-4 focus-within:ring-2 focus-within:ring-black/20 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-500 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            <input 
              // Cambia el tipo dinámicamente usando el segundo estado
              type={showConfirmPassword ? "text" : "password"} 
              placeholder="Confirm Password" 
              className="bg-transparent outline-none w-full ml-3 text-gray-800 placeholder-gray-400 font-medium"
            />
            {/* Botón de alternancia para confirmación */}
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showConfirmPassword ? (
                /* Icono de Ojo Tachado (Ocultar) */
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                /* Icono de Ojo Abierto (Mostrar) */
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>

          {/* Terms & Conditions Checkbox */}
          <div className="flex items-start gap-3 mt-2">
            <input 
              type="checkbox" 
              id="terms" 
              className="mt-1 w-5 h-5 rounded border-gray-300 text-black accent-black focus:ring-black"
            />
            <label htmlFor="terms" className="text-sm text-gray-600 font-medium leading-tight cursor-pointer">
              I agree to gloo&apos;s <Link href="#" className="text-black font-bold hover:underline">Terms of Service</Link> and <Link href="#" className="text-black font-bold hover:underline">Privacy Policy</Link>.
            </label>
          </div>

          {/* Action Button */}
          <button type="button" className="w-full bg-[#FF5733] text-white font-bold py-4 rounded-full mt-4 shadow-[0_4px_14px_rgba(255,87,51,0.39)] hover:bg-[#e64d2e] transition-all active:scale-95 transform">
            Create Account
          </button>
        </form>

        {/* Social Register */}
        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-200" />
          <span className="px-4 text-gray-400 text-sm">or sign up with</span>
          <hr className="flex-grow border-gray-200" />
        </div>

        <div className="flex justify-center gap-4">
          <button className="w-14 h-14 bg-[#F7F7F7] rounded-2xl flex items-center justify-center hover:bg-gray-200 transition-colors">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          </button>
          <button className="w-14 h-14 bg-[#F7F7F7] rounded-2xl flex items-center justify-center hover:bg-gray-200 transition-colors">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.126 3.822 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.665-1.48 3.666-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2.025-.156-4.013 1.09-4.63 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702z"/>
            </svg>
          </button>
        </div>
        
      </div>
    </div>
  );
}