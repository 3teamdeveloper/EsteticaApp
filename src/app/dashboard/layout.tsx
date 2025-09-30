'use client';

import { Sidebar } from '@/components/dashboard/Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import NotificationToast from '@/components/NotificationToast';
import { useNotificationToast } from '@/hooks/useNotificationToast';
import NotificationManager from '@/components/NotificationManager';
import { sessionManager } from '@/lib/session';
import TrialNotification, { TrialExpiredBanner } from '@/components/TrialNotification';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const { message, isVisible, hideNotification } = useNotificationToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      // SIEMPRE verificar con el servidor para asegurar que el rol esté actualizado
      // Esto es especialmente importante para empleados que pueden tener roles cacheados incorrectamente
      try {
        const response = await fetch('/api/auth/verify-session');
        if (response.ok) {
          const sessionData = await response.json();
          sessionManager.saveSession(sessionData);
          // Establecer el rol del usuario
          setUserRole(sessionData.role);
          setIsLoading(false);
        } else {
          // Sesión inválida, redirigir al login
          router.push('/login');
        }
      } catch (error) {
        console.error('Error verificando sesión:', error);
        router.push('/login');
      }
    };

    checkSession();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Verificando sesión...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Manager para manejar eventos */}
      <NotificationManager />
      
      {/* Sidebar y contenido principal en un contenedor flex */}
      <div className="flex h-screen">
        {/* Sidebar - Ancho fijo de 64 (16rem) */}
        <Sidebar
          currentPath={pathname}
          userRole={userRole}
          collapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((v) => !v)}
        />
        
        {/* Contenido principal - Toma el espacio restante */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-1 md:px-6 py-8">
            <TrialExpiredBanner />
            {children}
          </div>
        </main>
      </div>
      
      {/* Toast de notificación */}
      {isVisible && (
        <NotificationToast
          message={message}
          onClose={hideNotification}
        />
      )}
      
      {/* Notificación del trial */}
      <TrialNotification />
    </div>
  );
} 