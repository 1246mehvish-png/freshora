import { useState, useEffect } from 'react';
import { notificationService } from '../../services';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';
import '../Dashboard.css';

const formatDate = (d) =>
    new Date(d).toLocaleString('en-PK', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

export default function SellerNotifications() {
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

    const handleRead = async (id) => {
        try {
            await notificationService.markRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
            );
        } catch (err) {
            toast.error(err.message || 'Failed to mark as read');
        }
    };

    const handleMarkAll = async () => {
        try {
            await notificationService.markAllRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            toast.success('All notifications marked as read');
        } catch (err) {
            toast.error(err.message || 'Failed to mark all as read');
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationService.delete(id);
            setNotifications((prev) => prev.filter((n) => n._id !== id));
            toast.success('Notification deleted');
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
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You are all caught up'}
                    </p>
                </div>
                {notifications.length > 0 && (
                    <button className="btn btn-outline btn-sm" onClick={handleMarkAll}>
                        Mark all as read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="dash-card">
                    <EmptyState
                        icon="🔔"
                        title="No notifications"
                        message="You'll see order updates and alerts here."
                    />
                </div>
            ) : (
                <div className="dash-card">
                    <div className="notif-list">
                        {notifications.map((n) => (
                            <div
                                key={n._id}
                                className={`notif-item ${n.isRead ? '' : 'notif-unread'}`}
                            >
                                <div className="notif-icon">
                                    {n.type === 'order-status' ? '📦' : n.type === 'payment' ? '💳' : n.type === 'approval' ? '✅' : '🔔'}
                                </div>
                                <div className="notif-body">
                                    <p className="notif-message">{n.message}</p>
                                    <span className="notif-date">{formatDate(n.createdAt)}</span>
                                </div>
                                <div className="notif-actions">
                                    {!n.isRead && (
                                        <button className="btn btn-xs btn-outline" onClick={() => handleRead(n._id)}>
                                            Read
                                        </button>
                                    )}
                                    <button className="btn btn-xs btn-danger" onClick={() => handleDelete(n._id)}>
                                        ✕
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