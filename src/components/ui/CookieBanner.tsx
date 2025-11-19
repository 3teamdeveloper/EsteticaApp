"use client";

import { useState, useEffect } from "react";
import { Info, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/hooks/useSession";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { session } = useSession();
  const [lastUserId, setLastUserId] = useState<number | null>(null);

  useEffect(() => {
    // Solo mostrar si hay sesión activa (usuario logueado)
    if (!session) {
      setIsVisible(false);
      setLastUserId(null);
      return;
    }

    // Si cambió el usuario, resetear el banner
    if (lastUserId && lastUserId !== session.userId) {
      setIsVisible(false);
    }
    setLastUserId(session.userId);

    // Verificar si este usuario específico ya vio el banner
    const cookieConsentKey = `cookieConsent_${session.userId}`;
    const cookieConsent = localStorage.getItem(cookieConsentKey);
    if (!cookieConsent) {
      // Mostrar el banner después de un pequeño delay para mejor UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [session, lastUserId]);

  const handleAccept = () => {
    if (!session) return;
    
    // Guardar que este usuario específico ya vio la información
    const cookieConsentKey = `cookieConsent_${session.userId}`;
    const cookieConsentDateKey = `cookieConsentDate_${session.userId}`;
    
    localStorage.setItem(cookieConsentKey, 'informed');
    localStorage.setItem(cookieConsentDateKey, new Date().toISOString());
    setIsVisible(false);
  };

  // No mostrar si no hay sesión o no es visible
  if (!session || !isVisible) return null;

  return (
    <>
      {/* Banner de cookies - Esquina inferior derecha */}
      <div className="fixed bottom-4 right-4 z-50 max-w-sm">
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-xl shadow-lg p-4">
          <div className="flex items-start gap-3">
            {/* Icono informativo */}
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-rose-600 mt-0.5" />
            </div>
            
            {/* Contenido principal */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                🍪 Cookies Necesarias
              </h3>
              <p className="text-xs text-gray-700 mb-3 leading-relaxed">
                Usamos cookies <strong>esenciales</strong> para tu sesión, 
                autenticación y seguridad. No utilizamos cookies de seguimiento.
              </p>
              
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleAccept}
                  className="w-full px-3 py-1.5 bg-rose-600 text-white text-xs rounded-lg hover:bg-rose-700 transition-colors font-medium"
                >
                  Entendido
                </button>
                
                <Link
                  href="/privacy"
                  className="w-full px-3 py-1.5 border border-rose-300 text-rose-700 text-xs rounded-lg hover:bg-rose-50 transition-colors font-medium text-center inline-flex items-center justify-center gap-1"
                >
                  Más info
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
            
            {/* Botón cerrar removido: ahora solo se puede descartar con "Entendido" para persistir la aceptación */}
          </div>
        </div>
      </div>
    </>
  );
}
