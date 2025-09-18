import { useState, useCallback } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = {
    success: (message: string, duration?: number) => addToast({ message, type: 'success', duration }),
    error: (message: string, duration?: number) => addToast({ message, type: 'error', duration }),
    info: (message: string, duration?: number) => addToast({ message, type: 'info', duration }),
    warning: (message: string, duration?: number) => addToast({ message, type: 'warning', duration }),
  };

  return { toasts, removeToast, toast };
};