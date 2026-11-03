import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import '../Dashboard.css';

const statusClass = (s) => `status-${(s || 'pending').toLowerCase().replace(/\s+/g, '-')}`;

export default function BuyerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await orderService.getMine();
                setOrders(res.data.orders || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <Spinner text="Loading your orders..." />;

    const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.orderStatus === filter);

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h2>My Orders</h2>
                    <p>Track and manage all your Freshora orders.</p>
                </div>
            </div>

            <div className="dash-toolbar">
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="all">All Orders</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            {filteredOrders.length === 0 ? (
                <EmptyState
                    icon="📦"
                    title="No orders found"
                    message={filter === 'all' ? "You haven't placed any orders yet." : 'No orders with this status.'}
                    action={<Link to="/shop" className="btn btn-primary">Start Shopping</Link>}
                />
            ) : (
                <div className="dash-table-wrap">
                    <table className="dash-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((o) => (
                                <tr key={o._id}>
                                    <td><strong>{o.orderNumber}</strong></td>
                                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                                    <td>{o.orderItems?.length || 0}</td>
                                    <td>Rs {o.totalAmount}</td>
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
                                        <Link to={`/buyer/orders/${o._id}`} className="btn btn-outline btn-xs">
                                            View
                                        </Link>
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