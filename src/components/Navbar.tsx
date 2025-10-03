'use client';

import Link from "next/link";
import { Calendar, Menu, X, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { session, logout } = useSession();
  const router = useRouter();
  
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
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Aún así, limpiar la sesión local y redirigir
      logout();
      router.push('/login');
    }
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-rose-600" />
          <span className="text-xl font-bold text-gray-800">CitaUp</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-sm font-medium text-gray-800 hover:text-rose-600 transition-colors">
            Características
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-gray-800 hover:text-rose-600 transition-colors">
            Precios
          </Link>
          <Link href="#testimonials" className="text-sm font-medium text-gray-800 hover:text-rose-600 transition-colors">
            Testimonios
          </Link>
          <Link href="#contact" className="text-sm font-medium text-gray-800 hover:text-rose-600 transition-colors">
            Contacto
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {session ? (
            <>
              <Link 
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 transition-colors"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link 
                href="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 transition-colors"
              >
                Registrarse
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
              Características
            </Link>
            <Link href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 py-2 rounded-md text-gray-800 hover:bg-gray-50">
              Precios
            </Link>
            <Link href="#testimonials" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 py-2 rounded-md text-gray-800 hover:bg-gray-50">
              Testimonios
            </Link>
            <Link href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 py-2 rounded-md text-gray-800 hover:bg-gray-50">
              Contacto
            </Link>
            <div className="pt-3 flex flex-col gap-2">
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center px-4 py-2 text-sm font-medium text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-center px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center px-4 py-2 text-sm font-medium text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700"
                  >
                    Registrarse
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