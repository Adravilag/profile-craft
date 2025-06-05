import { useState, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export const useNotification = () => {
  const [notifications, setNotifications] = useState([] as any[]);

  const showNotification = useCallback((
    type: Notification['type'],
    title: string,
    message?: string,
    duration: number = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration
    };

    setNotifications((prev: any[]) => [...prev, notification]);

    // Auto remove notification
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev: any[]) => prev.filter((notif: any) => notif.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications,
    // Helper methods
    showSuccess: (title: string, message?: string) => showNotification('success', title, message),
    showError: (title: string, message?: string) => showNotification('error', title, message),
    showWarning: (title: string, message?: string) => showNotification('warning', title, message),
    showInfo: (title: string, message?: string) => showNotification('info', title, message)
  };
};

export default useNotification;
