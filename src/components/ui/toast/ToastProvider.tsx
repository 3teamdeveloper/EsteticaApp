'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
};

type ToastContextValue = {
  push: (type: ToastType, message: string, durationMs?: number) => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((type: ToastType, message: string, durationMs = 6500) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts(prev => [...prev, { id, type, message }]);
    // Auto dismiss
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, durationMs);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Container: mobile bottom-center; desktop top-right */}
      <div className="fixed z-[9999] pointer-events-none flex flex-col gap-3 w-[92vw] max-w-md bottom-3 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-3 md:bottom-auto md:top-3">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-lg px-5 py-4 shadow-lg border text-base flex items-start justify-between gap-3
              ${t.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : ''}
              ${t.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : ''}
              ${t.type === 'info' ? 'bg-gray-50 border-gray-200 text-gray-800' : ''}
            `}
            role="status"
            aria-live="polite"
          >
            <div className="flex-1 leading-snug">{t.message}</div>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 rounded p-1 text-current/70 hover:text-current hover:bg-black/5 transition"
              aria-label="Cerrar notificación"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToastContext(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastContext must be used within ToastProvider');
  return ctx;
}


