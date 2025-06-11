import { useState, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

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

    setNotifications(prev => [...prev, notification]);

    // Auto remove notification
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Helper methods wrapped in useCallback to prevent infinite re-renders
  const showSuccess = useCallback((title: string, message?: string) => 
    showNotification('success', title, message), [showNotification]);
  
  const showError = useCallback((title: string, message?: string) => 
    showNotification('error', title, message), [showNotification]);
  
  const showWarning = useCallback((title: string, message?: string) => 
    showNotification('warning', title, message), [showNotification]);
  
  const showInfo = useCallback((title: string, message?: string) => 
    showNotification('info', title, message), [showNotification]);

  return {
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default useNotification;
