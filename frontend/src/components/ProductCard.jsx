import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
    const { isAuthenticated, isBuyer } = useAuth();
    const { addToCart } = useCart();
    const toast = useToast();
    const navigate = useNavigate();

    const finalPrice = product.discount
        ? Number((product.price - (product.price * product.discount) / 100).toFixed(2))
        : product.price;

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated || !isBuyer) {
            toast.info('Please login as a buyer to add items to cart');
            navigate('/login');
            return;
        }
        if (product.stock <= 0) {
            toast.error('This product is out of stock');
            return;
        }
        try {
            await addToCart(product._id, 1);
            toast.success('Added to cart');
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <Link to={`/product/${product._id}`} className="product-card">
            <div className="product-img-wrap">
                {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.productName} className="product-img" loading="lazy" />
                ) : (
                    <div className="product-img-placeholder">🥬</div>
                )}
                {product.discount > 0 && <span className="product-discount">-{product.discount}%</span>}
                {product.organic && <span className="product-organic">🌿 Organic</span>}
                {product.stock <= 0 && <span className="product-out">Out of Stock</span>}
            </div>
            <div className="product-info">
                <span className="product-category">{product.category?.name || 'Fresh'}</span>
                <h3 className="product-name">{product.productName}</h3>
                <span className="product-seller">by {product.sellerId?.storeName || 'Freshora Seller'}</span>
                <div className="product-rating">
                    <span>⭐ {product.rating ? product.rating.toFixed(1) : 'New'}</span>
                    <span className="product-unit">{product.unit}</span>
                </div>
                <div className="product-bottom">
                    <div className="product-price">
                        <span className="price-current">Rs. {finalPrice.toFixed(2)}</span>
                        {product.discount > 0 && <span className="price-old">Rs. {product.price.toFixed(2)}</span>}
                    </div>
                    <button
                        className="add-cart-btn"
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0}
                        aria-label="Add to cart"
                    >
                        🛒
                    </button>
                </div>
            </div>
        </Link>
    );
}