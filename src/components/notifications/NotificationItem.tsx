'use client';
import { Notification } from '@/types/notification';
import { useNotification } from '@/context/NotificationContext';
import { Calendar, User, Briefcase, Clock } from 'lucide-react';

export default function NotificationItem({ notification }: { notification: Notification }) {
  const { setSelectedNotification } = useNotification();

  return (
    <div
      onClick={() => setSelectedNotification(notification)}
      className={`p-3 cursor-pointer rounded-lg border ${
        !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
      } hover:bg-gray-100`}
      role="button"
      tabIndex={0}
      aria-label={`Notificación: ${notification.subject}`}
      onKeyDown={(e) => e.key === 'Enter' && setSelectedNotification(notification)}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 truncate">
            {notification.appointment?.employee?.name
              ? `Turno con ${notification.appointment.employee.name}`
              : notification.subject}
          </div>
          <div className="text-xs text-gray-600 truncate">
            {notification.appointment?.client?.name || 'Sin cliente'} · {notification.appointment?.service?.name || 'Sin servicio'}
          </div>
        </div>
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{notification.time}</span>
        </div>
      </div>

      {notification.appointment && (
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <User className="w-4 h-4 text-gray-500" />
            <span className="truncate" title={notification.appointment.employee?.name || ''}>
              {notification.appointment.employee?.name || 'Sin empleado asignado'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Briefcase className="w-4 h-4 text-gray-500" />
            <span className="truncate" title={notification.appointment.service?.name || ''}>
              {notification.appointment.service?.name || 'Sin servicio'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>
              {new Date(notification.appointment.date).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}




