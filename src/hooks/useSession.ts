'use client';

import { useState, useEffect, useRef } from 'react';
import { sessionManager } from '@/lib/session';

interface SessionData {
  userId: number;
  email: string;
  role: string;
  name?: string;
  username?: string;
  businessType?: string;
  expiresAt: number;
}

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const prevSessionRef = useRef<SessionData | null>(null);

  useEffect(() => {
    const syncOnLogout = async () => {
      try {
        // Limpia cookie de autenticación en esta pestaña también
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      } catch {}
      // Redirige a login si está en una ruta protegida
      if (typeof window !== 'undefined') {
        const p = window.location.pathname;
        if (p.startsWith('/dashboard')) {
          window.location.href = '/login';
        }
      }
    };

    const checkSession = async () => {
      const currentSession = sessionManager.getSession();
      setSession(currentSession);

      // Si antes había sesión y ahora no, fue cerrada en otra pestaña
      if (!currentSession && prevSessionRef.current) {
        await syncOnLogout();
      }

      prevSessionRef.current = currentSession;
      setIsLoading(false);
    };

    // Verificar sesión inicial
    checkSession();

    // Escuchar cambios en el localStorage de otras pestañas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userSession') {
        // Al cambiar userSession en otra pestaña, sincronizar
        checkSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Verificar sesión periódicamente (cada minuto)
    const interval = setInterval(checkSession, 60000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const login = (sessionData: SessionData) => {
    sessionManager.saveSession(sessionData);
    setSession(sessionData);
  };

  const logout = () => {
    sessionManager.clearSession();
    setSession(null);
  };

  const refreshSession = async () => {
    try {
      const response = await fetch('/api/auth/verify-session');
      if (response.ok) {
        const sessionData = await response.json();
        sessionManager.saveSession(sessionData);
        setSession(sessionData);
        return sessionData;
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
    return null;
  };

  return {
    session,
    isLoading,
    login,
    logout,
    refreshSession,
    isAuthenticated: !!session
  };
}
