import { useState, useEffect } from 'react';
import { orderService } from '../../services';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';
import '../Dashboard.css';

const STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

const statusClass = (s) => `status-${(s || 'pending').toLowerCase().replace(/\s+/g, '-')}`;

const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

export default function SellerOrders() {
    const toast = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [updating, setUpdating] = useState(null);

    const load = async () => {
        try {
            const res = await orderService.getSellerOrders();
            setOrders(res.data.orders || []);
        } catch (err) {
            toast.error(err.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleStatus = async (orderId, status) => {
        setUpdating(orderId);
        try {
            await orderService.updateStatus(orderId, { status });
            toast.success(`Order marked as ${status}`);
            await load();
        } catch (err) {
            toast.error(err.message || 'Failed to update status');
        } finally {
            setUpdating(null);
        }
    };

    const filteredOrders =
        filter === 'all' ? orders : orders.filter((o) => o.orderStatus === filter);

    if (loading) {
        return (
            <div className="dash-page">
                <div className="dash-card">
                    <p>Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h1>My Orders</h1>
                    <p>Manage orders placed for your products</p>
                </div>
            </div>

            <div className="dash-toolbar">
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="all">All Orders ({orders.length})</option>
                    {STATUSES.map((s) => (
                        <option key={s} value={s}>
                            {s} ({orders.filter((o) => o.orderStatus === s).length})
                        </option>
                    ))}
                </select>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="dash-card">
                    <EmptyState
                        icon="📦"
                        title="No orders yet"
                        message="Orders containing your products will appear here."
                    />
                </div>
            ) : (
                <div className="dash-table-wrap">
                    <table className="dash-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Date</th>
                                <th>Buyer</th>
                                <th>Items</th>
                                <th>Your Total</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((o) => (
                                <tr key={o._id}>
                                    <td>
                                        <strong>{o.orderNumber}</strong>
                                    </td>
                                    <td>{formatDate(o.createdAt)}</td>
                                    <td>{o.buyerId?.name || o.buyerName}</td>
                                    <td>{o.orderItems?.length || 0}</td>
                                    <td>Rs {Number(o.sellerSubtotal || 0).toLocaleString()}</td>
                                    <td>
                                        <span className={`status-badge ${statusClass(o.paymentStatus)}`}>
                                            {o.paymentStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${statusClass(o.orderStatus)}`}>
                                            {o.orderStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <select
                                            className="status-select"
                                            value={o.orderStatus}
                                            disabled={updating === o._id || o.orderStatus === 'Cancelled'}
                                            onChange={(e) => handleStatus(o._id, e.target.value)}
                                        >
                                            {STATUSES.map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}