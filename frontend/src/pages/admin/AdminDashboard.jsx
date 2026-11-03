import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService, orderService, sellerService } from '../../services';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/StatCard';
import '../Dashboard.css';

const statusClass = (s) => `status-${(s || 'pending').toLowerCase().replace(/\s+/g, '-')}`;

const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

export default function AdminDashboard() {
    const toast = useToast();
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [pendingSellers, setPendingSellers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [statsRes, ordersRes, sellersRes] = await Promise.all([
                    dashboardService.admin(),
                    orderService.getAll({ limit: 6 }),
                    sellerService.getAll(),
                ]);
                setStats(statsRes.data.stats || null);
                setOrders(ordersRes.data.orders || []);
                const allSellers = sellersRes.data.sellers || [];
                setPendingSellers(allSellers.filter((s) => s.approvalStatus === 'pending').slice(0, 5));
            } catch (err) {
                toast.error(err.message || 'Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return (
            <div className="dash-page">
                <div className="dash-card">
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>Overview of your Freshora marketplace</p>
                </div>
            </div>

            <div className="dash-stats">
                <StatCard icon="👥" label="Total Buyers" value={stats?.totalBuyers || 0} color="blue" />
                <StatCard icon="🏪" label="Total Sellers" value={stats?.totalSellers || 0} color="green" />
                <StatCard icon="🥬" label="Total Products" value={stats?.totalProducts || 0} color="orange" />
                <StatCard icon="📦" label="Total Orders" value={stats?.totalOrders || 0} color="blue" />
                <StatCard icon="💰" label="Total Sales" value={`Rs ${Number(stats?.totalSales || 0).toLocaleString()}`} color="green" />
                <StatCard icon="⏳" label="Pending Orders" value={stats?.pendingOrders || 0} color="orange" />
                <StatCard icon="✅" label="Completed Orders" value={stats?.completedOrders || 0} color="green" />
                <StatCard icon="📨" label="Unread Messages" value={stats?.unreadMessages || 0} color="blue" />
            </div>

            <div className="dash-grid-2">
                <div className="dash-card">
                    <h3>Recent Orders</h3>
                    {orders.length === 0 ? (
                        <p className="dash-muted">No orders yet.</p>
                    ) : (
                        <div className="dash-table-wrap">
                            <table className="dash-table">
                                <thead>
                                    <tr>
                                        <th>Order #</th>
                                        <th>Buyer</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((o) => (
                                        <tr key={o._id}>
                                            <td>
                                                <strong>{o.orderNumber}</strong>
                                                <div className="dash-muted">{formatDate(o.createdAt)}</div>
                                            </td>
                                            <td>{o.buyerId?.name || o.buyerName}</td>
                                            <td>Rs {Number(o.totalAmount || 0).toLocaleString()}</td>
                                            <td>
                                                <span className={`status-badge ${statusClass(o.orderStatus)}`}>
                                                    {o.orderStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <Link to="/admin/orders" className="btn btn-outline btn-sm" style={{ marginTop: 14 }}>
                        View all orders
                    </Link>
                </div>

                <div className="dash-card">
                    <h3>Pending Seller Requests</h3>
                    {pendingSellers.length === 0 ? (
                        <p className="dash-muted">No pending seller requests.</p>
                    ) : (
                        <div className="dash-table-wrap">
                            <table className="dash-table">
                                <thead>
                                    <tr>
                                        <th>Store</th>
                                        <th>Owner</th>
                                        <th>Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingSellers.map((s) => (
                                        <tr key={s._id}>
                                            <td>
                                                <strong>{s.storeName}</strong>
                                            </td>
                                            <td>{s.userId?.name || '—'}</td>
                                            <td>{s.businessType}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <Link to="/admin/seller-requests" className="btn btn-outline btn-sm" style={{ marginTop: 14 }}>
                        Review requests
                    </Link>
                </div>
            </div>
        </div>
    );
}