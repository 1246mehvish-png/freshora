import { useState, useEffect } from 'react';
import { orderService, dashboardService } from '../../services';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/StatCard';
import EmptyState from '../../components/EmptyState';
import '../Dashboard.css';

const statusClass = (s) => `status-${(s || 'pending').toLowerCase().replace(/\s+/g, '-')}`;

const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

export default function SellerSales() {
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
                toast.error(err.message || 'Failed to load sales data');
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
                    <p>Loading sales...</p>
                </div>
            </div>
        );
    }

    const delivered = orders.filter((o) => o.orderStatus === 'Delivered');
    const totalItemsSold = delivered.reduce(
        (sum, o) => sum + (o.orderItems || []).reduce((s, i) => s + (i.quantity || 0), 0),
        0
    );

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h1>Sales Overview</h1>
                    <p>Track your store performance and completed sales</p>
                </div>
            </div>

            <div className="dash-stats">
                <StatCard icon="💰" label="Total Sales" value={`Rs ${Number(stats?.totalSales || 0).toLocaleString()}`} color="green" />
                <StatCard icon="📦" label="Total Orders" value={orders.length} color="blue" />
                <StatCard icon="✅" label="Delivered Orders" value={delivered.length} color="green" />
                <StatCard icon="🥕" label="Items Sold" value={totalItemsSold} color="orange" />
            </div>

            <div className="dash-card">
                <h3>Recent Sales</h3>
                {orders.length === 0 ? (
                    <EmptyState icon="📈" title="No sales yet" message="Your sales will appear here once buyers place orders." />
                ) : (
                    <div className="dash-table-wrap">
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Date</th>
                                    <th>Buyer</th>
                                    <th>Items</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((o) => (
                                    <tr key={o._id}>
                                        <td>
                                            <strong>{o.orderNumber}</strong>
                                        </td>
                                        <td>{formatDate(o.createdAt)}</td>
                                        <td>{o.buyerId?.name || o.buyerName}</td>
                                        <td>{o.orderItems?.length || 0}</td>
                                        <td>Rs {Number(o.sellerSubtotal || 0).toLocaleString()}</td>
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
            </div>
        </div>
    );
}