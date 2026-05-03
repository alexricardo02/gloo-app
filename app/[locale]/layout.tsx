import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css"; 
import { NextIntlClientProvider } from "next-intl"; 
import { getMessages } from "next-intl/server"; 
import { AuthProvider } from "../components/Providers"; 
// 1. Den neuen Header importieren
import Header from "../components/Header"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GLOO", 
  description: "The best nights of your life",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>; 
}>) {
  
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        <AuthProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            {/* 2. Den Header hier einfügen, damit er auf JEDER Seite oben ist */}
            <Header /> 
            
            <main className="flex-grow">
              {children}
            </main>
          </NextIntlClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}