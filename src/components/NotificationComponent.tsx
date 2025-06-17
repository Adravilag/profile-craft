import React, { useEffect, useRef, useState } from 'react';
import type { Notification } from '../hooks/useNotification';
import './styles/notifications.css';

interface NotificationComponentProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

interface TouchState {
  startX: number;
  startY: number;
  currentX: number;
  isDragging: boolean;
}

const NotificationComponent: React.FC<NotificationComponentProps> = ({ 
  notifications, 
  onRemove 
}) => {
  const [touchState, setTouchState] = useState<TouchState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    isDragging: false
  });
  const [swipingNotificationId, setSwipingNotificationId] = useState<string | null>(null);
  const notificationRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  // Función para manejar el ref de manera segura
  const setNotificationRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) {
      notificationRefs.current.set(id, el);
    } else {
      notificationRefs.current.delete(id);
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-exclamation-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'info':
        return 'fas fa-info-circle';
      default:
        return 'fas fa-info-circle';
    }
  };

  const handleTouchStart = (e: React.TouchEvent, notificationId: string) => {
    const touch = e.touches[0];
    setTouchState({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      isDragging: false
    });
    setSwipingNotificationId(notificationId);
  };

  const handleTouchMove = (e: React.TouchEvent, notificationId: string) => {
    if (swipingNotificationId !== notificationId) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchState.startX;
    const deltaY = Math.abs(touch.clientY - touchState.startY);

    // Solo procesar swipe horizontal si el movimiento es más horizontal que vertical
    if (deltaY < 50 && Math.abs(deltaX) > 10) {
      e.preventDefault();
      setTouchState(prev => ({ 
        ...prev, 
        currentX: touch.clientX,
        isDragging: true 
      }));

      const element = notificationRefs.current.get(notificationId);
      if (element && deltaX > 0) {
        const swipeProgress = Math.min(deltaX / 100, 1);
        element.style.transform = `translateX(${deltaX * 0.8}px)`;
        element.style.opacity = (1 - swipeProgress * 0.5).toString();
        
        if (deltaX > 80) {
          element.classList.add('swipe-right');
        } else {
          element.classList.remove('swipe-right');
        }
      }
    }
  };

  const handleTouchEnd = (_e: React.TouchEvent, notificationId: string) => {
    if (swipingNotificationId !== notificationId || !touchState.isDragging) {
      setSwipingNotificationId(null);
      return;
    }

    const deltaX = touchState.currentX - touchState.startX;
    const element = notificationRefs.current.get(notificationId);

    if (element) {
      if (deltaX > 80) {
        // Swipe suficiente para cerrar
        element.classList.add('swipe-dismiss');
        setTimeout(() => onRemove(notificationId), 300);
      } else {
        // Regresar a posición original
        element.style.transform = '';
        element.style.opacity = '';
        element.classList.remove('swipe-right');
      }
    }

    setTouchState({
      startX: 0,
      startY: 0,
      currentX: 0,
      isDragging: false
    });
    setSwipingNotificationId(null);
  };

  // Auto-dismiss con progress bar
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration && notification.duration > 0) {
        const element = notificationRefs.current.get(notification.id);
        if (element) {
          // Crear barra de progreso si no existe
          let progressBar = element.querySelector('.notification-progress') as HTMLElement;
          if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'notification-progress';
            progressBar.innerHTML = '<div class="notification-progress-fill"></div>';
            element.appendChild(progressBar);
          }

          const progressFill = progressBar.querySelector('.notification-progress-fill') as HTMLElement;
          if (progressFill) {
            progressFill.style.animationDuration = `${notification.duration}ms`;
          }
        }
      }
    });
  }, [notifications]);

  // Limpiar refs de notificaciones eliminadas
  useEffect(() => {
    const currentIds = new Set(notifications.map(n => n.id));
    const storedIds = Array.from(notificationRefs.current.keys());
    
    storedIds.forEach(id => {
      if (!currentIds.has(id)) {
        notificationRefs.current.delete(id);
      }
    });
  }, [notifications]);

  return (
    <div className="notifications-container" role="region" aria-label="Notificaciones">
      {notifications.map(notification => (
        <div 
          key={notification.id}
          ref={setNotificationRef(notification.id)}
          className={`notification notification-${notification.type} entering`}
          role="alert"
          aria-live="polite"
          onTouchStart={(e) => handleTouchStart(e, notification.id)}
          onTouchMove={(e) => handleTouchMove(e, notification.id)}
          onTouchEnd={(e) => handleTouchEnd(e, notification.id)}
        >
          <div className="notification-content">
            <i 
              className={`notification-icon ${getIcon(notification.type)}`}
              aria-hidden="true"
            ></i>
            <div className="notification-text">
              <h4 className="notification-title">{notification.title}</h4>
              {notification.message && (
                <p className="notification-message">{notification.message}</p>
              )}
            </div>
          </div>
          <button 
            className="notification-close"
            onClick={() => onRemove(notification.id)}
            aria-label={`Cerrar notificación: ${notification.title}`}
            title="Cerrar notificación"
          >
            <i className="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationComponent;
