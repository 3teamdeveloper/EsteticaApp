'use client';
import { create } from 'zustand';

interface NotificationStore {
  showNotification: (message: string) => void;
  hideNotification: () => void;
  message: string;
  isVisible: boolean;
}

export const useNotificationToast = create<NotificationStore>((set) => ({
  message: '',
  isVisible: false,
  showNotification: (message: string) => set({ message, isVisible: true }),
  hideNotification: () => set({ isVisible: false }),
}));
