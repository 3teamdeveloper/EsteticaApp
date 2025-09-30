'use client';
import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

interface NotificationToastProps {
  message: string;
  onClose: () => void;
}

export default function NotificationToast({ message, onClose }: NotificationToastProps) {
  useEffect(() => {
    // Auto-cerrar después de 5 segundos
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 bg-white border border-green-200 rounded-lg shadow-lg p-4 max-w-sm z-50 animate-slide-in">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Bell className="h-5 w-5 text-green-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
