import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService, orderService, notificationService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import Spinner from '../../components/Spinner';
import '../Dashboard.css';

const statusClass = (s) => `status-${(s || 'pending').toLowerCase().replace(/\s+/g, '-')}`;

export default function SellerDashboard() {
    const { user, seller } = useAuth();
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [s, o, n] = await Promise.all([
                    dashboardService.seller(),
                    orderService.getSellerOrders(),
                    notificationService.getMine(),
                ]);
                setStats(s.data.stats);
                setOrders(o.data.orders || []);
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
                    <p>Manage your store, products, and orders.</p>
                </div>
                <Link to="/seller/products/add" className="btn btn-primary">+ Add Product</Link>
            </div>

            {seller?.approvalStatus !== 'approved' && (
                <div className="dash-card" style={{ background: 'rgba(255, 243, 205, 0.5)', borderColor: '#ffeeba' }}>
                    <h3 style={{ color: '#856404' }}>⏳ Store Pending Approval</h3>
                    <p style={{ color: '#856404' }}>
                        Your store is awaiting admin approval. You can prepare your products, but they won't be
                        visible to customers until your store is approved.
                    </p>
                </div>
            )}

            <div className="dash-stats">
                <StatCard icon="📦" label="Total Sales" value={stats?.totalSales || 0} color="green" />
                <StatCard icon="🥬" label="Products" value={stats?.totalProducts || 0} color="amber" />
                <StatCard icon="⏳" label="Pending Orders" value={stats?.pendingOrders || 0} color="blue" />
                <StatCard icon="💰" label="Earnings" value={`Rs ${stats?.totalEarnings || 0}`} color="cream" />
            </div>

            <div className="dash-grid-2">
                <div className="dash-table-wrap">
                    <div style={{ padding: '18px 18px 0' }}>
                        <h3 style={{ color: 'var(--dark-green)', marginBottom: 12 }}>Recent Orders</h3>
                    </div>
                    {orders.length === 0 ? (
                        <div className="dash-empty">
                            <div className="empty-icon">📦</div>
                            <h3>No orders yet</h3>
                            <p>Orders for your products will appear here.</p>
                        </div>
                    ) : (
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Buyer</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.slice(0, 5).map((o) => (
                                    <tr key={o._id}>
                                        <td><strong>{o.orderNumber}</strong></td>
                                        <td>{o.buyerName}</td>
                                        <td>{o.orderItems?.length || 0}</td>
                                        <td>Rs {o.sellerSubtotal || o.totalAmount}</td>
                                        <td>
                                            <span className={`status-badge ${statusClass(o.orderStatus)}`}>{o.orderStatus}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {orders.length > 0 && (
                        <div style={{ padding: 16, textAlign: 'center' }}>
                            <Link to="/seller/orders" className="btn btn-outline btn-sm">View All Orders</Link>
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
                        <Link to="/seller/notifications" className="btn btn-outline btn-sm">View All</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}