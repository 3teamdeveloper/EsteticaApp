'use client';
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getLastSeenTimestamp, setLastSeenTimestamp } from '@/lib/notifications';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();



  const fetchNotificationCount = async () => {
    try {
      const lastSeen = getLastSeenTimestamp();
      const url = lastSeen 
        ? `/api/notifications/count?lastSeen=${lastSeen}`
        : '/api/notifications/count';
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationCount();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchNotificationCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    // Guardar timestamp actual y resetear contador
    setLastSeenTimestamp();
    setUnreadCount(0);
    
    // Redirigir a la página de notificaciones
    router.push('/dashboard/notifications');
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="relative p-2 cursor-pointer "
        aria-label="Notificaciones"
      >
        <Bell className="h-5 w-5" />
        
        {/* Badge con contador */}
        {!isLoading && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
