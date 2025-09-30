import { NotificationProvider } from '@/context/NotificationContext';
import NotificationList from '@/components/notifications/NotificationList';
import { Notification } from '@/types/notification';
import NotificationPageClient from './NotificationPageClient';
import { cookies, headers } from 'next/headers';

async function getNotifications(): Promise<Notification[]> {
  const cookieHeader = (await cookies()).toString();
  const hdrs = await headers();
  const host = hdrs.get('host') || 'localhost:3000';
  const proto = hdrs.get('x-forwarded-proto') || 'http';
  const url = `${proto}://${host}/api/notifications`;
  const res = await fetch(url, {
    cache: 'no-store',
    headers: {
      cookie: cookieHeader,
    },
  });
  if (!res.ok) throw new Error('Error al cargar notificaciones');
  return res.json();
}

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  return (
    <NotificationProvider>
      <NotificationPageClient notifications={notifications} />
    </NotificationProvider>
  );
}