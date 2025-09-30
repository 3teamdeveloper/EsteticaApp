'use client';
import { createContext, useContext, useState } from 'react';
import { Notification } from '@/types/notification';

interface NotificationContextType {
  selectedNotification: Notification | null;
  setSelectedNotification: (notification: Notification | null) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  return (
    <NotificationContext.Provider value={{ selectedNotification, setSelectedNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}