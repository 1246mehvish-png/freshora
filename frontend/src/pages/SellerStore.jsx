import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sellerService } from '../services';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import './SellerStore.css';

export default function SellerStore() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sort, setSort] = useState('newest');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await sellerService.getPublic(id);
                setData(res.data);
            } catch (err) {
                setError(err.message || 'Seller not found');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) return <Spinner text="Loading store..." />;

    if (error) {
        return (
            <div className="container section">
                <EmptyState
                    icon="🏪"
                    title="Store not found"
                    message={error}
                    action={<Link to="/sellers" className="btn btn-primary">Browse Sellers</Link>}
                />
            </div>
        );
    }

    const { seller, products = [], reviews = [] } = data;

    const sortedProducts = [...products].sort((a, b) => {
        if (sort === 'price-low') return a.price - b.price;
        if (sort === 'price-high') return b.price - a.price;
        if (sort === 'name') return a.productName.localeCompare(b.productName);
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return (
        <div className="seller-store">
            <div className="store-banner">
                {seller.storeBanner ? (
                    <img src={seller.storeBanner} alt={seller.storeName} />
                ) : (
                    <div className="store-banner-placeholder" />
                )}
            </div>

            <div className="container">
                <div className="store-header">
                    <div className="store-logo">
                        {seller.storeLogo ? <img src={seller.storeLogo} alt={seller.storeName} /> : '🏪'}
                    </div>
                    <div className="store-info">
                        <h1>{seller.storeName}</h1>
                        <div className="store-badges">
                            <span className="badge badge-green">{seller.businessType}</span>
                            {seller.isFeatured && <span className="badge badge-cream">⭐ Featured</span>}
                            <span className="badge badge-green">✅ Verified</span>
                        </div>
                        <p className="store-description">
                            {seller.storeDescription || 'A trusted Freshora seller offering fresh, quality produce.'}
                        </p>
                        <div className="store-meta">
                            <span>⭐ {seller.rating ? seller.rating.toFixed(1) : 'New'} rating</span>
                            <span>📦 {products.length} products</span>
                            <span>📍 {seller.storeAddress}</span>
                            <span>📞 {seller.storeContactNumber}</span>
                        </div>
                    </div>
                </div>

                <div className="store-products">
                    <div className="store-products-head">
                        <h2>Products from {seller.storeName}</h2>
                        <select value={sort} onChange={(e) => setSort(e.target.value)} className="store-sort">
                            <option value="newest">Newest</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="name">Name: A to Z</option>
                        </select>
                    </div>

                    {sortedProducts.length === 0 ? (
                        <EmptyState
                            icon="🥬"
                            title="No products yet"
                            message="This seller hasn't listed any products."
                        />
                    ) : (
                        <div className="product-grid">
                            {sortedProducts.map((p) => (
                                <ProductCard key={p._id} product={p} />
                            ))}
                        </div>
                    )}
                </div>

                {reviews.length > 0 && (
                    <div className="store-reviews">
                        <h2>Customer Reviews</h2>
                        <div className="reviews-list">
                            {reviews.map((r) => (
                                <div key={r._id} className="review-card">
                                    <div className="review-head">
                                        <strong>{r.buyerId?.name || 'Customer'}</strong>
                                        <span className="review-stars">
                                            {'⭐'.repeat(Math.round(r.rating || 0))}
                                        </span>
                                    </div>
                                    <p>{r.comment}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}