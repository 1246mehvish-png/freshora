import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService, reviewService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import './ProductDetail.css';

export default function ProductDetail() {
    const { id } = useParams();
    const { isAuthenticated, isBuyer } = useAuth();
    const { addToCart } = useCart();
    const toast = useToast();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [activeImg, setActiveImg] = useState(0);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await productService.getOne(id);
                setProduct(res.data.product);
                setRelated(res.data.related || []);
                const revRes = await reviewService.getProduct(id);
                setReviews(revRes.data.reviews || []);
            } catch (err) {
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleAddToCart = async () => {
        if (!isAuthenticated || !isBuyer) {
            toast.info('Please login as a buyer to add items to cart');
            navigate('/login');
            return;
        }
        try {
            await addToCart(product._id, qty);
            toast.success('Added to cart');
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleReview = async (e) => {
        e.preventDefault();
        if (!isAuthenticated || !isBuyer) {
            toast.info('Please login as a buyer to review');
            navigate('/login');
            return;
        }
        try {
            await reviewService.create({
                productId: product._id,
                sellerId: product.sellerId?._id,
                rating: reviewForm.rating,
                comment: reviewForm.comment,
            });
            toast.success('Review submitted');
            setReviewForm({ rating: 5, comment: '' });
            const revRes = await reviewService.getProduct(id);
            setReviews(revRes.data.reviews || []);
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) return <Spinner text="Loading product..." />;
    if (!product) return <div className="container"><p className="text-center mt-4">Product not found.</p></div>;

    const finalPrice = product.discount
        ? Number((product.price - (product.price * product.discount) / 100).toFixed(2))
        : product.price;

    return (
        <div className="product-detail container">
            <div className="breadcrumb">
                <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <span>{product.productName}</span>
            </div>

            <div className="pd-layout">
                <div className="pd-gallery">
                    <div className="pd-main-img">
                        {product.images?.[activeImg] ? (
                            <img src={product.images[activeImg]} alt={product.productName} />
                        ) : (
                            <div className="pd-placeholder">🥬</div>
                        )}
                    </div>
                    {product.images?.length > 1 && (
                        <div className="pd-thumbs">
                            {product.images.map((img, i) => (
                                <button key={i} className={i === activeImg ? 'active' : ''} onClick={() => setActiveImg(i)}>
                                    <img src={img} alt={`${product.productName} ${i + 1}`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="pd-info">
                    <span className="pd-category">{product.category?.name}</span>
                    <h1>{product.productName}</h1>
                    <div className="pd-rating">
                        <span>⭐ {product.rating ? product.rating.toFixed(1) : 'New'}</span>
                        <span className="text-muted">({product.totalReviews} reviews)</span>
                        {product.organic && <span className="badge badge-green">🌿 Organic</span>}
                    </div>
                    <p className="pd-desc">{product.description}</p>

                    <div className="pd-price">
                        <span className="pd-price-current">Rs. {finalPrice.toFixed(2)}</span>
                        {product.discount > 0 && (
                            <>
                                <span className="pd-price-old">Rs. {product.price.toFixed(2)}</span>
                                <span className="badge badge-red">-{product.discount}% OFF</span>
                            </>
                        )}
                    </div>

                    <div className="pd-meta">
                        <div><strong>Unit:</strong> {product.unit}</div>
                        <div><strong>Stock:</strong> {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</div>
                        <div><strong>Freshness:</strong> {product.freshnessInformation || 'Freshly harvested'}</div>
                        <div><strong>Seller:</strong> <Link to={`/seller/${product.sellerId?._id}`}>{product.sellerId?.storeName}</Link></div>
                    </div>

                    <div className="pd-actions">
                        <div className="qty-selector">
                            <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                            <span>{qty}</span>
                            <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>+</button>
                        </div>
                        <button className="btn btn-primary" onClick={handleAddToCart} disabled={product.stock <= 0}>
                            🛒 Add to Cart
                        </button>
                    </div>
                </div>
            </div>

            {/* Reviews */}
            <section className="pd-reviews">
                <h2>Customer Reviews</h2>
                {reviews.length ? (
                    <div className="review-list">
                        {reviews.map((r) => (
                            <div key={r._id} className="review-item">
                                <div className="review-avatar">{r.buyerId?.name?.charAt(0).toUpperCase()}</div>
                                <div>
                                    <strong>{r.buyerId?.name}</strong>
                                    <div className="review-stars">{'⭐'.repeat(r.rating)}</div>
                                    <p>{r.comment}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted">No reviews yet. Be the first to review!</p>
                )}

                <form className="review-form" onSubmit={handleReview}>
                    <h3>Write a Review</h3>
                    <div className="form-group">
                        <label>Rating</label>
                        <select className="form-control" value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}>
                            {[5, 4, 3, 2, 1].map((r) => (
                                <option key={r} value={r}>{'⭐'.repeat(r)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Comment</label>
                        <textarea className="form-control" value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="Share your experience..." />
                    </div>
                    <button type="submit" className="btn btn-primary">Submit Review</button>
                </form>
            </section>

            {/* Related */}
            {related.length > 0 && (
                <section className="pd-related">
                    <h2>Related Products</h2>
                    <div className="product-grid">
                        {related.map((p) => (
                            <ProductCard key={p._id} product={p} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}