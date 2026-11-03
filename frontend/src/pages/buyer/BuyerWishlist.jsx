import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { wishlistService } from '../../services';
import { useToast } from '../../context/ToastContext';
import ProductCard from '../../components/ProductCard';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import '../Dashboard.css';

export default function BuyerWishlist() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { success, error } = useToast();

    const load = async () => {
        try {
            const res = await wishlistService.get();
            setProducts(res.data.products || []);
        } catch (err) {
            error(err.message || 'Failed to load wishlist');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRemove = async (productId) => {
        try {
            await wishlistService.remove(productId);
            success('Removed from wishlist');
            setProducts((prev) => prev.filter((p) => p._id !== productId));
        } catch (err) {
            error(err.message || 'Failed to remove item');
        }
    };

    if (loading) return <Spinner text="Loading your wishlist..." />;

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h2>My Wishlist</h2>
                    <p>Products you've saved for later.</p>
                </div>
            </div>

            {products.length === 0 ? (
                <EmptyState
                    icon="❤️"
                    title="Your wishlist is empty"
                    message="Save products you love to find them here later."
                    action={<Link to="/shop" className="btn btn-primary">Browse Products</Link>}
                />
            ) : (
                <div className="product-grid">
                    {products.map((p) => (
                        <div key={p._id} style={{ position: 'relative' }}>
                            <ProductCard product={p} />
                            <button
                                className="btn btn-outline btn-xs"
                                style={{ position: 'absolute', top: 8, right: 8, background: '#fff' }}
                                onClick={() => handleRemove(p._id)}
                                title="Remove from wishlist"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}