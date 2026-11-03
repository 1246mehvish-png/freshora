import { useState, useEffect } from 'react';
import { notificationService } from '../../services';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';
import '../Dashboard.css';

const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

const iconFor = (type) => {
    if (type === 'order-status') return '📦';
    if (type === 'payment-update') return '💳';
    if (type === 'seller-registration') return '✅';
    if (type === 'contact-message') return '✉️';
    if (type === 'review') return '⭐';
    return '🔔';
};

export default function AdminNotifications() {
    const toast = useToast();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        try {
            const res = await notificationService.getMine();
            setNotifications(res.data.notifications || []);
        } catch (err) {
            toast.error(err.message || 'Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const markRead = async (id) => {
        try {
            await notificationService.markRead(id);
            await load();
        } catch (err) {
            toast.error(err.message || 'Failed to mark notification as read');
        }
    };

    const markAllRead = async () => {
        try {
            await notificationService.markAllRead();
            toast.success('All notifications marked as read');
            await load();
        } catch (err) {
            toast.error(err.message || 'Failed to mark notifications as read');
        }
    };

    const remove = async (id) => {
        try {
            await notificationService.delete(id);
            await load();
        } catch (err) {
            toast.error(err.message || 'Failed to delete notification');
        }
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    if (loading) {
        return (
            <div className="dash-page">
                <div className="dash-card">
                    <p>Loading notifications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h1>Notifications</h1>
                    <p>
                        {unreadCount > 0
                            ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                            : 'You are all caught up'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button className="btn btn-outline btn-sm" onClick={markAllRead}>
                        Mark All Read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="dash-card">
                    <EmptyState icon="🔔" title="No notifications" message="System alerts will appear here." />
                </div>
            ) : (
                <div className="dash-card">
                    <div className="notif-list">
                        {notifications.map((n) => (
                            <div className={`notif-item ${n.isRead ? '' : 'notif-unread'}`} key={n._id}>
                                <div className="notif-icon">{iconFor(n.type)}</div>
                                <div className="notif-body">
                                    <p className="notif-message">{n.message}</p>
                                    <span className="notif-date">{formatDate(n.createdAt)}</span>
                                </div>
                                <div className="notif-actions">
                                    {!n.isRead && (
                                        <button
                                            className="btn btn-xs btn-outline"
                                            onClick={() => markRead(n._id)}
                                        >
                                            Mark Read
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-xs btn-danger"
                                        onClick={() => remove(n._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
