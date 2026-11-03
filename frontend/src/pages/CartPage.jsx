import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import './CartPage.css';

export default function CartPage() {
    const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();
    const { success, error } = useToast();
    const navigate = useNavigate();

    const handleUpdate = async (productId, quantity) => {
        try {
            await updateQuantity(productId, quantity);
        } catch (err) {
            error(err.message || 'Failed to update quantity');
        }
    };

    const handleRemove = async (productId) => {
        try {
            await removeFromCart(productId);
            success('Item removed from cart');
        } catch (err) {
            error(err.message || 'Failed to remove item');
        }
    };

    const handleClear = async () => {
        try {
            await clearCart();
            success('Cart cleared');
        } catch (err) {
            error(err.message || 'Failed to clear cart');
        }
    };

    if (loading) return <Spinner text="Loading your cart..." />;

    const items = cart.items || [];

    return (
        <div className="cart-page">
            <section className="page-banner">
                <div className="container">
                    <h1>Your Cart</h1>
                    <p>Review your fresh picks before checkout</p>
                </div>
            </section>

            <section className="section container">
                {items.length === 0 ? (
                    <EmptyState
                        icon="🛒"
                        title="Your cart is empty"
                        message="Looks like you haven't added any fresh produce yet."
                        action={<Link to="/shop" className="btn btn-primary">Start Shopping</Link>}
                    />
                ) : (
                    <div className="cart-layout">
                        <div className="cart-items">
                            {items.map((item) => {
                                const p = item.product;
                                return (
                                    <div key={p._id} className="cart-item">
                                        <Link to={`/product/${p._id}`} className="cart-item-img">
                                            {p.images?.[0] ? (
                                                <img src={p.images[0]} alt={p.productName} />
                                            ) : (
                                                <span>🥬</span>
                                            )}
                                        </Link>
                                        <div className="cart-item-info">
                                            <Link to={`/product/${p._id}`} className="cart-item-name">
                                                {p.productName}
                                            </Link>
                                            <span className="cart-item-seller">by {item.sellerName}</span>
                                            <div className="cart-item-price">
                                                <span className="price-final">Rs {item.finalPrice}</span>
                                                {p.discount > 0 && (
                                                    <span className="price-original">Rs {item.unitPrice}</span>
                                                )}
                                                <span className="cart-item-unit">/ {p.unit}</span>
                                            </div>
                                        </div>
                                        <div className="cart-item-qty">
                                            <button
                                                className="qty-btn"
                                                onClick={() => handleUpdate(p._id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                −
                                            </button>
                                            <span className="qty-value">{item.quantity}</span>
                                            <button
                                                className="qty-btn"
                                                onClick={() => handleUpdate(p._id, item.quantity + 1)}
                                                disabled={item.quantity >= item.stock}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="cart-item-total">Rs {item.lineTotal}</div>
                                        <button
                                            className="cart-item-remove"
                                            onClick={() => handleRemove(p._id)}
                                            title="Remove"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                );
                            })}
                            <div className="cart-actions">
                                <button className="btn btn-outline" onClick={handleClear}>
                                    Clear Cart
                                </button>
                                <Link to="/shop" className="btn btn-outline">Continue Shopping</Link>
                            </div>
                        </div>

                        <div className="cart-summary">
                            <h3>Order Summary</h3>
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>Rs {cart.subtotal}</span>
                            </div>
                            <div className="summary-row">
                                <span>Delivery Charges</span>
                                <span>{cart.deliveryCharges === 0 ? 'FREE' : `Rs ${cart.deliveryCharges}`}</span>
                            </div>
                            {cart.freeAbove > 0 && cart.subtotal < cart.freeAbove && (
                                <div className="summary-note">
                                    Add Rs {cart.freeAbove - cart.subtotal} more to get FREE delivery!
                                </div>
                            )}
                            <div className="summary-row summary-total">
                                <span>Total</span>
                                <span>Rs {cart.totalAmount}</span>
                            </div>
                            <button className="btn btn-primary btn-block" onClick={() => navigate('/checkout')}>
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}