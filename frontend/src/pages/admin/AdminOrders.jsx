import { useState, useEffect } from 'react';
import { orderService } from '../../services';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';
import '../Dashboard.css';

const STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

const statusClass = (s) => `status-${(s || 'pending').toLowerCase().replace(/\s+/g, '-')}`;

const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

export default function AdminOrders() {
    const toast = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [updating, setUpdating] = useState(null);

    const load = async () => {
        try {
            const params = { page, limit: 15 };
            if (statusFilter !== 'all') params.status = statusFilter;
            if (search) params.search = search;
            const res = await orderService.getAll(params);
            setOrders(res.data.orders || []);
            setTotalPages(res.data.pages || 1);
        } catch (err) {
            toast.error(err.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, statusFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        load();
    };

    const handleStatus = async (id, status) => {
        setUpdating(id);
        try {
            await orderService.updateStatus(id, { status });
            toast.success(`Order marked as ${status}`);
            await load();
        } catch (err) {
            toast.error(err.message || 'Failed to update order');
        } finally {
            setUpdating(null);
        }
    };

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h1>Manage Orders</h1>
                    <p>View and update all marketplace orders</p>
                </div>
            </div>

            <form className="dash-toolbar" onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Search by order number..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                    <option value="all">All Statuses</option>
                    {STATUSES.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>
                <button type="submit" className="btn btn-primary btn-sm">
                    Search
                </button>
            </form>

            {loading ? (
                <div className="dash-card">
                    <p>Loading orders...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="dash-card">
                    <EmptyState icon="📦" title="No orders found" message="No orders match your filters." />
                </div>
            ) : (
                <>
                    <div className="dash-table-wrap">
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Date</th>
                                    <th>Buyer</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Payment</th>
                                    <th>Status</th>
                                    <th>Update</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((o) => (
                                    <tr key={o._id}>
                                        <td>
                                            <strong>{o.orderNumber}</strong>
                                        </td>
                                        <td>{formatDate(o.createdAt)}</td>
                                        <td>
                                            {o.buyerId?.name || o.buyerName}
                                            <div className="dash-muted">{o.buyerId?.email}</div>
                                        </td>
                                        <td>{o.orderItems?.length || 0}</td>
                                        <td>Rs {Number(o.totalAmount || 0).toLocaleString()}</td>
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
                                                disabled={updating === o._id}
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

                    {totalPages > 1 && (
                        <div className="dash-pagination">
                            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                                Previous
                            </button>
                            <span>
                                Page {page} of {totalPages}
                            </span>
                            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}