import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService, orderService, notificationService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import Spinner from '../../components/Spinner';
import '../Dashboard.css';

const statusClass = (s) => `status-${(s || 'pending').toLowerCase().replace(/\s+/g, '-')}`;

export default function BuyerDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [s, o, n] = await Promise.all([
                    dashboardService.buyer(),
                    orderService.getMine(),
                    notificationService.getMine(),
                ]);
                setStats(s.data.stats);
                setRecentOrders((o.data.orders || []).slice(0, 5));
                setNotifications(n.data.notifications || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <Spinner text="Loading your dashboard..." />;

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h2>Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
                    <p>Here's an overview of your Freshora activity.</p>
                </div>
                <Link to="/shop" className="btn btn-primary">🛒 Continue Shopping</Link>
            </div>

            <div className="dash-stats">
                <StatCard icon="📦" label="Total Orders" value={stats?.totalOrders || 0} color="green" />
                <StatCard icon="⏳" label="Pending Orders" value={stats?.pendingOrders || 0} color="amber" />
                <StatCard icon="✅" label="Delivered" value={stats?.completedOrders || 0} color="blue" />
                <StatCard icon="💸" label="Total Spent" value={`Rs ${stats?.totalSpent || 0}`} color="cream" />
            </div>

            <div className="dash-grid-2">
                <div className="dash-table-wrap">
                    <div style={{ padding: '18px 18px 0' }}>
                        <h3 style={{ color: 'var(--dark-green)', marginBottom: 12 }}>Recent Orders</h3>
                    </div>
                    {recentOrders.length === 0 ? (
                        <div className="dash-empty">
                            <div className="empty-icon">📦</div>
                            <h3>No orders yet</h3>
                            <p>Start shopping to see your orders here.</p>
                        </div>
                    ) : (
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Date</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((o) => (
                                    <tr key={o._id}>
                                        <td>
                                            <Link to={`/buyer/orders/${o._id}`} style={{ color: 'var(--fresh-green)', fontWeight: 600 }}>
                                                {o.orderNumber}
                                            </Link>
                                        </td>
                                        <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                                        <td>Rs {o.totalAmount}</td>
                                        <td>
                                            <span className={`status-badge ${statusClass(o.orderStatus)}`}>{o.orderStatus}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {recentOrders.length > 0 && (
                        <div style={{ padding: 16, textAlign: 'center' }}>
                            <Link to="/buyer/orders" className="btn btn-outline btn-sm">View All Orders</Link>
                        </div>
                    )}
                </div>

                <div className="dash-card">
                    <h3>Recent Notifications</h3>
                    {notifications.length === 0 ? (
                        <div className="dash-empty">
                            <div className="empty-icon">🔔</div>
                            <p>No notifications yet.</p>
                        </div>
                    ) : (
                        <div className="notif-list">
                            {notifications.slice(0, 5).map((n) => (
                                <div key={n._id} className={`notif-item ${n.isRead ? '' : 'unread'}`}>
                                    <span className="notif-icon">🔔</span>
                                    <div className="notif-body">
                                        <p>{n.message}</p>
                                        <small>{new Date(n.createdAt).toLocaleString()}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div style={{ marginTop: 16, textAlign: 'center' }}>
                        <Link to="/buyer/notifications" className="btn btn-outline btn-sm">View All</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}