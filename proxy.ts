import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['en', 'de', 'es', 'fr', 'it'], 
  defaultLocale: 'en'
});

export default function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // 1. WICHTIG: API-Routen komplett ignorieren
  // Ohne das versucht next-intl, /api als Sprache zu interpretieren
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // 2. Gast-Logik
  const isGuest = req.cookies.get('gloo_is_guest')?.value === 'true';
  
  // 3. Geschützte Zonen
  const isProtectedRoute = /\/(messages|chat|profile)/.test(pathname);

  if (isGuest && isProtectedRoute) {
    const localeMatch = pathname.match(/^\/([a-z]{2})\//);
    const locale = localeMatch ? localeMatch[1] : 'en';
    
    // Redirect zum Dashboard, wenn Gast auf geschützte Route will
    const redirectUrl = new URL(`/${locale}/dashboard`, req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // 4. Alles andere an next-intl übergeben
  return intlMiddleware(req);
}

export const config = {
  // Erweitere den Matcher, um api-Routen komplett zu ignorieren
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)']
};