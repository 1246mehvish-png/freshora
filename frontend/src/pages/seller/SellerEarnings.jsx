import { useState, useEffect } from 'react';
import { orderService, dashboardService } from '../../services';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/StatCard';
import EmptyState from '../../components/EmptyState';
import '../Dashboard.css';

const statusClass = (s) => `status-${(s || 'pending').toLowerCase().replace(/\s+/g, '-')}`;

const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

export default function SellerEarnings() {
    const toast = useToast();
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [ordersRes, statsRes] = await Promise.all([
                    orderService.getSellerOrders(),
                    dashboardService.seller(),
                ]);
                setOrders(ordersRes.data.orders || []);
                setStats(statsRes.data.stats || null);
            } catch (err) {
                toast.error(err.message || 'Failed to load earnings');
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
                    <p>Loading earnings...</p>
                </div>
            </div>
        );
    }

    const delivered = orders.filter((o) => o.orderStatus === 'Delivered');
    const deliveredEarnings = delivered.reduce((sum, o) => sum + Number(o.sellerSubtotal || 0), 0);
    const pendingEarnings = orders
        .filter((o) => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled')
        .reduce((sum, o) => sum + Number(o.sellerSubtotal || 0), 0);

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h1>Earnings</h1>
                    <p>Your store earnings from completed and pending orders</p>
                </div>
            </div>

            <div className="dash-stats">
                <StatCard icon="🏦" label="Total Earnings" value={`Rs ${Number(stats?.totalEarnings || 0).toLocaleString()}`} color="green" />
                <StatCard icon="✅" label="Delivered Earnings" value={`Rs ${deliveredEarnings.toLocaleString()}`} color="green" />
                <StatCard icon="⏳" label="Pending Earnings" value={`Rs ${pendingEarnings.toLocaleString()}`} color="orange" />
                <StatCard icon="📦" label="Total Orders" value={orders.length} color="blue" />
            </div>

            <div className="dash-card">
                <h3>Earnings Breakdown</h3>
                {orders.length === 0 ? (
                    <EmptyState icon="💵" title="No earnings yet" message="Your earnings will appear here once orders are placed." />
                ) : (
                    <div className="dash-table-wrap">
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Date</th>
                                    <th>Buyer</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Earning</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((o) => {
                                    const isDelivered = o.orderStatus === 'Delivered';
                                    const isCancelled = o.orderStatus === 'Cancelled';
                                    return (
                                        <tr key={o._id}>
                                            <td>
                                                <strong>{o.orderNumber}</strong>
                                            </td>
                                            <td>{formatDate(o.createdAt)}</td>
                                            <td>{o.buyerId?.name || o.buyerName}</td>
                                            <td>Rs {Number(o.sellerSubtotal || 0).toLocaleString()}</td>
                                            <td>
                                                <span className={`status-badge ${statusClass(o.orderStatus)}`}>
                                                    {o.orderStatus}
                                                </span>
                                            </td>
                                            <td>
                                                {isCancelled ? (
                                                    <span className="status-badge status-cancelled">—</span>
                                                ) : isDelivered ? (
                                                    <strong className="earning-positive">
                                                        +Rs {Number(o.sellerSubtotal || 0).toLocaleString()}
                                                    </strong>
                                                ) : (
                                                    <span className="earning-pending">
                                                        Rs {Number(o.sellerSubtotal || 0).toLocaleString()}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}