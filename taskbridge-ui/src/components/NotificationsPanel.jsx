import { useEffect, useState } from 'react';
import NotificationService from '../api/NotificationService';
import '../styles/Notifications.css';

export const NotificationsPanel = ({ onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await NotificationService.getMyNotifications();
            setNotifications(Array.isArray(data) ? data : data?.data || []);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await NotificationService.markAsRead(notificationId);
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    return (
        <div className="notifications-panel-overlay" onClick={onClose}>
            <div className="notifications-panel" onClick={(e) => e.stopPropagation()}>
                <div className="notifications-header">
                    <h2>Notifications</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="notifications-content">
                    {loading ? (
                        <div className="loading">Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                        <div className="empty-state">
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        <div className="notifications-list">
                            {notifications.map(notif => (
                                <div key={notif.id} className={`notification-item ${notif.isRead ? 'read' : 'unread'}`}>
                                    <div className="notification-header-item">
                                        <h4>{notif.title}</h4>
                                        <span className={`type-badge ${notif.type?.toLowerCase()}`}>{notif.type}</span>
                                    </div>
                                    <p className="notification-message">{notif.message}</p>
                                    <div className="notification-meta">
                                        <span className="from">From: {notif.sender?.name}</span>
                                        <span className="date">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {!notif.isRead && (
                                        <button 
                                            className="mark-read-btn"
                                            onClick={() => handleMarkAsRead(notif.id)}
                                        >
                                            Mark as Read
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
