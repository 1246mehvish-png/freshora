import { useEffect, useState } from 'react';
import { notificationService } from '../../services';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import '../Dashboard.css';

export default function BuyerNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { success, error } = useToast();

    const load = async () => {
        try {
            const res = await notificationService.getMine();
            setNotifications(res.data.notifications || []);
        } catch (err) {
            error(err.message || 'Failed to load notifications');
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
            setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
        } catch (err) {
            error(err.message || 'Failed to mark as read');
        }
    };

    const markAllRead = async () => {
        try {
            await notificationService.markAllRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            success('All notifications marked as read');
        } catch (err) {
            error(err.message || 'Failed to mark all as read');
        }
    };

    const remove = async (id) => {
        try {
            await notificationService.delete(id);
            setNotifications((prev) => prev.filter((n) => n._id !== id));
            success('Notification deleted');
        } catch (err) {
            error(err.message || 'Failed to delete notification');
        }
    };

    if (loading) return <Spinner text="Loading notifications..." />;

    const unread = notifications.filter((n) => !n.isRead).length;

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h2>Notifications</h2>
                    <p>{unread > 0 ? `You have ${unread} unread notification(s).` : 'You are all caught up!'}</p>
                </div>
                {unread > 0 && (
                    <button className="btn btn-outline btn-sm" onClick={markAllRead}>Mark all as read</button>
                )}
            </div>

            {notifications.length === 0 ? (
                <EmptyState icon="🔔" title="No notifications" message="You'll see order updates and alerts here." />
            ) : (
                <div className="notif-list">
                    {notifications.map((n) => (
                        <div key={n._id} className={`notif-item ${n.isRead ? '' : 'unread'}`}>
                            <span className="notif-icon">🔔</span>
                            <div className="notif-body">
                                <p>{n.message}</p>
                                <small>{new Date(n.createdAt).toLocaleString()}</small>
                            </div>
                            <div className="notif-actions">
                                {!n.isRead && (
                                    <button className="btn btn-outline btn-xs" onClick={() => markRead(n._id)}>Read</button>
                                )}
                                <button className="btn btn-danger btn-xs" onClick={() => remove(n._id)}>✕</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}