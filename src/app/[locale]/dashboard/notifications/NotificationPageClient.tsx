'use client';
import { useEffect } from 'react';
import NotificationList from '@/components/notifications/NotificationList';
import { Notification } from '@/types/notification';
import { resetNotificationCount } from '@/lib/notifications';

interface NotificationPageClientProps {
  notifications: Notification[];
}

export default function NotificationPageClient({ notifications }: NotificationPageClientProps) {
  useEffect(() => {
    // Resetear el contador de notificaciones cuando se visita esta página
    resetNotificationCount();
  }, []);

  return (
    <div className="flex h-full">
      <NotificationList initialNotifications={notifications} />
    </div>
  );
}
