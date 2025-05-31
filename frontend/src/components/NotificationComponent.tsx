import React from 'react';
import type { Notification } from '../hooks/useNotification';
import './styles/notifications.css';

interface NotificationComponentProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const NotificationComponent: React.FC<NotificationComponentProps> = ({ 
  notifications, 
  onRemove 
}) => {
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

  return (
    <div className="notifications-container">
      {notifications.map(notification => (
        <div 
          key={notification.id}
          className={`notification notification-${notification.type}`}
        >
          <div className="notification-content">
            <i className={`notification-icon ${getIcon(notification.type)}`}></i>
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
            aria-label="Cerrar notificación"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationComponent;
