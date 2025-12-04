// src/components/NotificationContainer.jsx
import React from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const NotificationContainer = () => {
  const { notifications, removeNotification } = useAppContext();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <XCircle size={20} />;
      case 'info':
      default:
        return <Info size={20} />;
    }
  };

  return (
    <div className="notifications-container">
      {notifications.map((notif) => (
        <div key={notif.id} className={`notification ${notif.type}`}>
          {getIcon(notif.type)}
          <span>{notif.message}</span>
          <button
            onClick={() => removeNotification(notif.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              marginLeft: 'auto',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;