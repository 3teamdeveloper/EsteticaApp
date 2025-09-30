import { Notification } from '@/types/notification';
import NotificationItem from './NotificationItem';
import { useEffect, useState } from 'react';
import { Calendar, ListFilter, CalendarClock } from 'lucide-react';

export default function NotificationList({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [filter, setFilter] = useState<'today' | '7d' | 'all'>('7d');
  const [items, setItems] = useState<Notification[]>(initialNotifications);
  const [loading, setLoading] = useState(false);

  const fetchRange = async (range: 'today' | '7d' | 'all') => {
    try {
      setLoading(true);
      const res = await fetch(`/api/notifications?range=${range}`, { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch {
      // noop
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const saved = (localStorage.getItem('notifications_filter') as 'today' | '7d' | 'all' | null) || '7d';
      if (saved !== filter) {
        setFilter(saved);
      }
      // Siempre sincronizar con backend al montar para el rango elegido
      fetchRange(saved);
    } catch {
      // Si localStorage falla, usar 7d por defecto
      fetchRange('7d');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full md:w-2/3 bg-white text-gray-900 shadow-sm p-3 sm:p-4 overflow-y-auto border-r border-gray-200">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h2 className="text-base sm:text-lg font-semibold">Notificaciones</h2>
        <div className="flex items-center gap-1.5">
          <button
            className={`p-1.5 rounded-md border text-xs inline-flex items-center gap-1 ${filter === 'today' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'}`}
            onClick={() => { setFilter('today'); try { localStorage.setItem('notifications_filter','today'); } catch {}; fetchRange('today'); }}
            title="Hoy"
            aria-label="Filtrar hoy"
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hoy</span>
          </button>
          <button
            className={`p-1.5 rounded-md border text-xs inline-flex items-center gap-1 ${filter === '7d' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'}`}
            onClick={() => { setFilter('7d'); try { localStorage.setItem('notifications_filter','7d'); } catch {}; fetchRange('7d'); }}
            title="Últimos 7 días"
            aria-label="Filtrar últimos 7 días"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">7 días</span>
          </button>
          <button
            className={`p-1.5 rounded-md border text-xs inline-flex items-center gap-1 ${filter === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'}`}
            onClick={() => { setFilter('all'); try { localStorage.setItem('notifications_filter','all'); } catch {}; fetchRange('all'); }}
            title="Todos"
            aria-label="Filtrar todos"
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Todos</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500 p-2">Cargando…</div>
      ) : (
        <div className="space-y-2">
          {items.map((notif) => (
            <NotificationItem key={notif.id} notification={notif} />
          ))}
        </div>
      )}
    </div>
  );
}

