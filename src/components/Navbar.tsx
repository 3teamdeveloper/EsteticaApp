'use client';

import Link from "next/link";
import Image from "next/image";
import { Menu, X, LogOut, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from 'next-intl';
import { routing } from '@/i18n/routing';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const { session, logout } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('navbar');
  
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      // Limpiar sesión del servidor
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Limpiar sesión local
      logout();
      
      // Redirigir al login
      router.push(`/${locale}/login`);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Aún así, limpiar la sesión local y redirigir
      logout();
      router.push(`/${locale}/login`);
    }
  };

  const switchLocale = (newLocale: string) => {
    // Get the path without locale
    const segments = pathname.split('/').filter(Boolean);
    // Remove the first segment (current locale)
    const pathWithoutLocale = segments.slice(1).join('/');
    // Build new path with new locale
    const newPath = `/${newLocale}${pathWithoutLocale ? '/' + pathWithoutLocale : ''}`;
    router.push(newPath);
    setShowLangMenu(false);
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 md:px-6">
        <Link href={`/${locale}`} className="flex items-center gap-1">
          <Image 
            src="/images/logocitaup.jpg" 
            alt="CitaUp Logo" 
            width={40} 
            height={40} 
            className="rounded-full object-cover"
          />
          <span className="text-xl font-bold text-gray-800">CitaUp</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-sm font-medium text-gray-800 hover:text-rose-600 transition-colors">
            {t('features')}
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-gray-800 hover:text-rose-600 transition-colors">
            {t('pricing')}
          </Link>
          <Link href="#testimonials" className="text-sm font-medium text-gray-800 hover:text-rose-600 transition-colors">
            {t('testimonials')}
          </Link>
          <Link href="#contact" className="text-sm font-medium text-gray-800 hover:text-rose-600 transition-colors">
            {t('contact')}
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Globe className="w-4 h-4" />
              {locale.toUpperCase()}
            </button>
            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                {routing.locales.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => switchLocale(loc)}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      loc === locale ? 'bg-rose-50 text-rose-600 font-medium' : 'text-gray-800'
                    }`}
                  >
                    {loc === 'es' ? 'Español' : 'English'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {session ? (
            <>
              <Link 
                href={`/${locale}/dashboard`}
                className="px-4 py-2 text-sm font-medium text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                {t('dashboard')}
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 transition-colors"
              >
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              <Link 
                href={`/${locale}/login`}
                className="px-4 py-2 text-sm font-medium text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                {t('login')}
              </Link>
              <Link 
                href={`/${locale}/register`}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 transition-colors"
              >
                {t('register')}
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="Abrir menú"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((v) => !v)}
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile drawer (left to right, fixed so it doesn't push content) */}
      <div className="md:hidden  min-w-[40vw]">
        {/* Backdrop with blur and dark tint */}
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className={`${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} fixed top-16 bottom-0 inset-x-0 z-40 backdrop-blur-md bg-black/70 transition-opacity duration-200 ease-out`}
          aria-hidden={!isMobileMenuOpen}
        />
        <div
          className={`${isMobileMenuOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'} fixed top-16 bottom-0 left-0 z-50 w-72 max-w-[80%] border-r border-gray-200 bg-white transition-transform duration-200 ease-out`}
        >
          <nav className="h-full overflow-y-auto px-4 py-4 space-y-1">
            <Link href="#features" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 py-2 rounded-md text-gray-800 hover:bg-gray-50">
              {t('features')}
            </Link>
            <Link href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 py-2 rounded-md text-gray-800 hover:bg-gray-50">
              {t('pricing')}
            </Link>
            <Link href="#testimonials" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 py-2 rounded-md text-gray-800 hover:bg-gray-50">
              {t('testimonials')}
            </Link>
            <Link href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 py-2 rounded-md text-gray-800 hover:bg-gray-50">
              {t('contact')}
            </Link>
            
            {/* Language Switcher Mobile */}
            <div className="pt-3 border-t border-gray-200">
              <p className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">{t('contact')}</p>
              {routing.locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    switchLocale(loc);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-2 py-2 rounded-md ${
                    loc === locale ? 'bg-rose-50 text-rose-600 font-medium' : 'text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {loc === 'es' ? '🇪🇸 Español' : '🇺🇸 English'}
                </button>
              ))}
            </div>

            <div className="pt-3 flex flex-col gap-2">
              {session ? (
                <>
                  <Link
                    href={`/${locale}/dashboard`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center px-4 py-2 text-sm font-medium text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {t('dashboard')}
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-center px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700"
                  >
                    {t('logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={`/${locale}/login`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center px-4 py-2 text-sm font-medium text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href={`/${locale}/register`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700"
                  >
                    {t('register')}
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
} 