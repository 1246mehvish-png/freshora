import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services';
import Spinner from '../components/Spinner';
import './OrderSuccess.css';

export default function OrderSuccess() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await orderService.getOne(id);
                setOrder(res.data.order);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) return <Spinner text="Loading order..." />;

    return (
        <div className="order-success">
            <div className="success-card">
                <div className="success-icon">✅</div>
                <h1>Order Placed Successfully!</h1>
                <p className="success-sub">
                    Thank you for shopping with Freshora. Your order has been received and is being processed.
                </p>

                {order && (
                    <div className="success-details">
                        <div className="detail-row">
                            <span>Order Number</span>
                            <strong>{order.orderNumber}</strong>
                        </div>
                        <div className="detail-row">
                            <span>Total Amount</span>
                            <strong>Rs {order.totalAmount}</strong>
                        </div>
                        <div className="detail-row">
                            <span>Payment Method</span>
                            <strong>{order.paymentMethod}</strong>
                        </div>
                        <div className="detail-row">
                            <span>Delivery Address</span>
                            <strong>
                                {order.deliveryAddress?.addressLine}, {order.deliveryAddress?.city}
                            </strong>
                        </div>
                    </div>
                )}

                <div className="success-actions">
                    <Link to={`/buyer/orders${order ? `/${order._id}` : ''}`} className="btn btn-primary">
                        View Order Details
                    </Link>
                    <Link to="/shop" className="btn btn-outline">Continue Shopping</Link>
                </div>
            </div>
        </div>
    );
}