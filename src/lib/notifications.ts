// Funciones para manejar notificaciones

export const triggerNewAppointmentNotification = (appointment: any) => {
  // Disparar evento personalizado para mostrar notificación
  const event = new CustomEvent('new-appointment', {
    detail: {
      clientName: appointment.client?.name || 'Cliente',
      serviceName: appointment.service?.name || 'Servicio',
      employeeName: appointment.employee?.name || 'Empleado',
      date: appointment.date
    }
  });
  
  window.dispatchEvent(event);
};

export const showSuccessNotification = (message: string) => {
  const event = new CustomEvent('show-notification', {
    detail: { message, type: 'success' }
  });
  
  window.dispatchEvent(event);
};

export const showErrorNotification = (message: string) => {
  const event = new CustomEvent('show-notification', {
    detail: { message, type: 'error' }
  });
  
  window.dispatchEvent(event);
};

// Funciones para manejar el localStorage de notificaciones
export const getLastSeenTimestamp = (): number | null => {
  if (typeof window === 'undefined') return null;
  const lastSeen = localStorage.getItem('notifications_last_seen');
  return lastSeen ? parseInt(lastSeen) : null;
};

export const setLastSeenTimestamp = () => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('notifications_last_seen', Date.now().toString());
};

export const resetNotificationCount = () => {
  setLastSeenTimestamp();
};
