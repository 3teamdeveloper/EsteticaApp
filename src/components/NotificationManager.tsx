'use client';
import { useEffect } from 'react';
import { useNotificationToast } from '@/hooks/useNotificationToast';

export default function NotificationManager() {
  const { showNotification } = useNotificationToast();

  useEffect(() => {
    // Función para mostrar notificación cuando se crea una cita
    const handleNewAppointment = (event: CustomEvent) => {
      const { clientName, serviceName, employeeName } = event.detail;
      showNotification(`¡Nuevo turno! ${clientName} reservó ${serviceName} con ${employeeName}`);
    };

    // Escuchar eventos personalizados
    window.addEventListener('new-appointment', handleNewAppointment as EventListener);

    return () => {
      window.removeEventListener('new-appointment', handleNewAppointment as EventListener);
    };
  }, [showNotification]);

  return null; // Este componente no renderiza nada
}
