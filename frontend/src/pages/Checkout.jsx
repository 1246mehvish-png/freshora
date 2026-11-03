import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { orderService } from '../services';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import './Checkout.css';

const PAYMENT_METHODS = [
    {
        value: 'Cash on Delivery',
        label: 'Cash on Delivery',
        icon: '💵',
        desc: 'Pay in cash when your order is delivered.',
        available: true,
    },
    {
        value: 'Credit Card / Debit Card',
        label: 'Credit / Debit Card',
        icon: '💳',
        desc: 'Online card payment (requires gateway configuration).',
        available: false,
    },
    {
        value: 'Online Payment Gateway',
        label: 'Online Payment Gateway',
        icon: '🏦',
        desc: 'Pay via a secure payment gateway (requires credentials).',
        available: false,
    },
    {
        value: 'Digital Wallet',
        label: 'Digital Wallet',
        icon: '📱',
        desc: 'Pay using a digital wallet (requires gateway configuration).',
        available: false,
    },
];

const emptyAddress = {
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Pakistan',
};

export default function Checkout() {
    const { cart, loading, fetchCart } = useCart();
    const { user } = useAuth();
    const { success, error } = useToast();
    const navigate = useNavigate();

    const [address, setAddress] = useState(emptyAddress);
    const [notes, setNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
    const [selectedSaved, setSelectedSaved] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const savedAddresses = user?.addresses || [];

    useEffect(() => {
        if (savedAddresses.length > 0) {
            const def = savedAddresses.find((a) => a.isDefaultRev) || savedAddresses.find((a) => a.isDefault / dm) || savedAddresses[0];
            if (def) {
                setSelectedSaved(def._id);
                setAddress({
                    fullName: def.fullName || user?.name || '',
                    phone: def.phone || user?.phone || '',
                    addressLine: def.addressLine || '',
                    city: def.city || '',
                    province: def.province || '',
                    postalCode: def.postalCode || '',
                    country: def.country || 'Pakistan',
                });
            }
        } else if (user) {
            setAddress((a) => ({
                ...a,
                fullName: user.name || '',
                phone: user.phone || '',
                city: user.city || '',
                province: user.province || '',
                postalCode: user.postalCode || '',
                country: user.country || 'Pakistan',
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

    const handleSavedSelect = (e) => {
        const id = e.target.value;
        setSelectedSaved(id);
        const found = savedAddresses.find((a) => a._id === id);
        if (found) {
            setAddress({
                fullName: found.fullName,
                phone: found.phone,
                addressLine: found.addressLine,
                city: found.city,
                province: found.province,
                postalCode: found.postalCode,
                country: found.country,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const required = ['fullName', 'phone', 'addressLine', 'city', 'province', 'postalCode', 'country'];
        for (const f of required) {
            if (!address[f]?.trim()) {
                error('Please fill in all delivery address fields');
                return;
            }
        }
        setSubmitting(true);
        try {
            const res = await orderService.create({
                deliveryAddress: address,
                paymentMethod,
                notes,
            });
            await fetchCart();
            success('Order placed successfully!');
            navigate(`/order-success/${res.data.order._id}`);
        } catch (err) {
            error(err.message || 'Failed to place order');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Spinner text="Preparing checkout..." />;

    const items = cart.items || [];

    if (items.length === 0) {
        return (
            <div className="container section">
                <EmptyState
                    icon="🛒"
                    title="Your cart is empty"
                    message="Add some fresh products before checking out."
                    action={<Link to="/shop" className="btn btn-primary">Go to Shop</Link>}
                />
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <section className="page-banner">
                <div className="container">
                    <h1>Checkout</h1>
                    <p>Almost there — confirm your details to place the order</p>
                </div>
            </section>

            <section className="section container">
                <form className="checkout-layout" onSubmit={handleSubmit}>
                    <div className="checkout-main">
                        {/* Delivery Address */}
                        <div className="checkout-card">
                            <h2>📍 Delivery Address</h2>

                            {savedAddresses.length > 0 && (
                                <div className="form-group">
                                    <label>Use a saved address</label>
                                    <select value={selectedSaved} onChange={handleSavedSelect}>
                                        <option value="">— Enter a new address —</option>
                                        {savedAddresses.map((a) => (
                                            <option key={a._id} value={a._id}>
                                                {a.label}: {a.addressLine}, {a.city}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input name="fullName" value={address.fullName} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Phone *</label>
                                    <input name="phone" value={address.phone} onChange={handleChange} />
                                </div>
                                <div className="form-group form-full">
                                    <label>Address Line *</label>
                                    <input
                                        name="addressLine"
                                        value={address.addressLine}
                                        onChange={handleChange}
                                        placeholder="House / Street / Area"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>City *</label>
                                    <input name="city" value={address.city} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Province *</label>
                                    <input name="province" value={address.province} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Postal Code *</label>
                                    <input name="postalCode" value={address.postalCode} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Country *</label>
                                    <input name="country" value={address.country} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Order Notes (optional)</label>
                                <textarea
                                    rows="2"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Any special instructions for delivery..."
                                />
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="checkout-card">
                            <h2>💳 Payment Method</h2>
                            <div className="payment-options">
                                {PAYMENT_METHODS.map((m) => (
                                    <label
                                        key={m.value}
                                        className={`payment-option ${!m.available ? 'disabled' : ''} ${paymentMethod === m.value ? 'selected' : ''
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={m.value}
                                            checked={paymentMethod === m.value}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            disabled={!m.available}
                                        />
                                        <span className="payment-icon">{m.icon}</span>
                                        <span className="payment-text">
                                            <strong>{m.label}</strong>
                                            <small>{m.desc}</small>
                                        </span>
                                        {!m.available && <span className="payment-tag">Coming soon</span>}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="checkout-summary">
                        <h3>Order Summary</h3>
                        <div className="checkout-items">
                            {items.map((item) => (
                                <div key={item.product._id} className="checkout-item">
                                    <div className="checkout-item-img">
                                        {item.product.images?.[0] ? (
                                            <img src={item.product.images[0]} alt={item.product.productName} />
                                        ) : (
                                            <span>🥬</span>
                                        )}
                                    </div>
                                    <div className="checkout-item-info">
                                        <span className="checkout-item-name">{item.product.productName}</span>
                                        <span className="checkout-item-qty">
                                            {item.quantity} × Rs {item.finalPrice}
                                        </span>
                                    </div>
                                    <span className="checkout-item-total">Rs {item.lineTotal}</span>
                                </div>
                            ))}
                        </div>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>Rs {cart.subtotal}</span>
                        </div>
                        <div className="summary-row">
                            <span>Delivery</span>
                            <span>{cart.deliveryCharges === 0 ? 'FREE' : `Rs ${cart.deliveryCharges}`}</span>
                        </div>
                        <div className="summary-row summary-total">
                            <span>Total</span>
                            <span>Rs {cart.totalAmount}</span>
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                            {submitting ? 'Placing Order...' : 'Place Order'}
                        </button>
                        <Link to="/cart" className="btn btn-outline btn-block mt-2">Back to Cart</Link>
                    </div>
                </form>
            </section>
        </div>
    );
}