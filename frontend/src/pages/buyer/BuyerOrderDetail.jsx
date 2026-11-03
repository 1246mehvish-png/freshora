import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderService } from '../../services';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import '../Dashboard.css';

const statusClass = (s) => `status-${(s || 'pending').toLowerCase().replace(/\s+/g, '-')}`;

export default function BuyerOrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { success, error } = useToast();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [reason, setReason] = useState('');
    const [showCancel, setShowCancel] = useState(false);

    const load = async () => {
        try {
            const res = await orderService.getOne(id);
            setOrder(res.data.order);
        } catch (err) {
            error(err.message || 'Failed to load order');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleCancel = async () => {
        setCancelling(true);
        try {
            await orderService.cancel(id, reason);
            success('Order cancelled successfully');
            setShowCancel(false);
            await load();
        } catch (err) {
            error(err.message || 'Failed to cancel order');
        } finally {
            setCancelling(false);
        }
    };

    if (loading) return <Spinner text="Loading order..." />;

    if (!order) {
        return (
            <EmptyState
                icon="📦"
                title="Order not found"
                message="This order may have been removed."
                action={<Link to="/buyer/orders" className="btn btn-primary">Back to Orders</Link>}
            />
        );
    }

    const canCancel = ['Pending', 'Confirmed'].includes(order.orderStatus);

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h2>Order {order.orderNumber}</h2>
                    <p>Placed on {new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Link to="/buyer/orders" className="btn btn-outline btn-sm">← Back</Link>
                    {canCancel && (
                        <button className="btn btn-danger btn-sm" onClick={() => setShowCancel(true)}>
                            Cancel Order
                        </button>
                    )}
                </div>
            </div>

            <div className="order-detail-grid">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="dash-card">
                        <h3>Order Items</h3>
                        <div className="order-items-list">
                            {order.orderItems.map((item, idx) => (
                                <div key={idx} className="order-item-row">
                                    <div className="table-img">
                                        {item.image ? <img src={item.image} alt={item.productName} /> : '🥬'}
                                    </div>
                                    <div className="oi-info">
                                        <div className="oi-name">{item.productName}</div>
                                        <div className="oi-meta">
                                            {item.quantity} × Rs {item.finalPrice} / {item.unit} · {item.sellerName}
                                        </div>
                                        <span className={`status-badge ${statusClass(item.sellerStatus)}`} style={{ marginTop: 6 }}>
                                            {item.sellerStatus}
                                        </span>
                                    </div>
                                    <div className="oi-total">Rs {item.subtotal}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="dash-card">
                        <h3>Order Timeline</h3>
                        <div className="timeline">
                            {(order.statusHistory || []).map((h, idx) => (
                                <div key={idx} className="timeline-item">
                                    <span className="timeline-dot" />
                                    <div className="timeline-body">
                                        <strong>{h.status}</strong>
                                        {h.note && <div style={{ color: '#666', fontSize: '0.85rem' }}>{h.note}</div>}
                                        <small>{new Date(h.changedAt).toLocaleString()}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="dash-card">
                        <h3>Order Summary</h3>
                        <div className="info-list">
                            <div className="info-row"><span>Status</span><span className={`status-badge ${statusClass(order.orderStatus)}`}>{order.orderStatus}</span></div>
                            <div className="info-row"><span>Payment Method</span><span>{order.paymentMethod}</span></div>
                            <div className="info-row"><span>Payment Status</span><span className={`status-badge ${statusClass(order.paymentStatus)}`}>{order.paymentStatus}</span></div>
                            <div className="info-row"><span>Subtotal</span><span>Rs {order.subtotal}</span></div>
                            <div className="info-row"><span>Delivery</span><span>{order.deliveryCharges === 0 ? 'FREE' : `Rs ${order.deliveryCharges}`}</span></div>
                            <div className="info-row"><span>Total</span><span>Rs {order.totalAmount}</span></div>
                        </div>
                    </div>

                    <div className="dash-card">
                        <h3>Delivery Address</h3>
                        <div className="info-list">
                            <div className="info-row"><span>Name</span><span>{order.deliveryAddress?.fullName}</span></div>
                            <div className="info-row"><span>Phone</span><span>{order.deliveryAddress?.phone}</span></div>
                            <div className="info-row"><span>Address</span><span>{order.deliveryAddress?.addressLine}</span></div>
                            <div className="info-row"><span>City</span><span>{order.deliveryAddress?.city}</span></div>
                            <div className="info-row"><span>Province</span><span>{order.deliveryAddress?.province}</span></div>
                            <div className="info-row"><span>Postal Code</span><span>{order.deliveryAddress?.postalCode}</span></div>
                            <div className="info-row"><span>Country</span><span>{order.deliveryAddress?.country}</span></div>
                            {order.deliveryAddress?.notes && (
                                <div className="info-row"><span>Notes</span><span>{order.deliveryAddress.notes}</span></div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showCancel && (
                <div className="modal-overlay" onClick={() => setShowCancel(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <h3>Cancel Order</h3>
                        <p style={{ color: '#666', marginBottom: 16 }}>
                            Are you sure you want to cancel this order? This action cannot be undone.
                        </p>
                        <div className="form-group">
                            <label>Reason (optional)</label>
                            <textarea
                                rows="3"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Why are you cancelling?"
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={() => setShowCancel(false)}>Keep Order</button>
                            <button className="btn btn-danger" onClick={handleCancel} disabled={cancelling}>
                                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}