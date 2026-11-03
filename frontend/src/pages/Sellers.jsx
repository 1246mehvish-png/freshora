import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sellerService } from '../services';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import './Sellers.css';

export default function Sellers() {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [featuredOnly, setFeaturedOnly] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const params = {};
                if (search.trim()) params.search = search.trim();
                if (featuredOnly) params.featured = 'true';
                const res = await sellerService.getAll(params);
                setSellers(res.data.sellers || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        const t = setTimeout(load, 300);
        return () => clearTimeout(t);
    }, [search, featuredOnly]);

    return (
        <div className="sellers-page">
            <section className="page-banner">
                <div className="container">
                    <h1>Our Sellers</h1>
                    <p>Discover trusted local farmers and fresh produce stores</p>
                </div>
            </section>

            <section className="section container">
                <div className="sellers-toolbar">
                    <input
                        type="text"
                        className="sellers-search"
                        placeholder="🔍 Search by store name or business type..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <label className="sellers-toggle">
                        <input
                            type="checkbox"
                            checked={featuredOnly}
                            onChange={(e) => setFeaturedOnly(e.target.checked)}
                        />
                        <span>Featured only</span>
                    </label>
                </div>

                {loading ? (
                    <Spinner text="Loading sellers..." />
                ) : sellers.length === 0 ? (
                    <EmptyState
                        icon="🏪"
                        title="No sellers found"
                        message="Try adjusting your search or check back later."
                    />
                ) : (
                    <div className="sellers-grid">
                        {sellers.map((s) => (
                            <Link key={s._id} to={`/seller/${s._id}`} className="seller-list-card card-hover">
                                <div className="seller-list-banner">
                                    {s.storeBanner ? (
                                        <img src={s.storeBanner} alt={s.storeName} />
                                    ) : (
                                        <div className="seller-banner-placeholder" />
                                    )}
                                    {s.isFeatured && <span className="featured-badge">⭐ Featured</span>}
                                </div>
                                <div className="seller-list-body">
                                    <div className="seller-list-logo">
                                        {s.storeLogo ? <img src={s.storeLogo} alt={s.storeName} /> : '🏪'}
                                    </div>
                                    <h3>{s.storeName}</h3>
                                    <span className="badge badge-green">{s.businessType}</span>
                                    <p className="seller-list-desc">
                                        {s.storeDescription || 'Fresh produce from a trusted local seller.'}
                                    </p>
                                    <div className="seller-list-meta">
                                        <span>⭐ {s.rating ? s.rating.toFixed(1) : 'New'}</span>
                                        <span>📍 {s.userId?.city || s.storeAddress || 'Local'}</span>
                                    </div>
                                    <span className="btn btn-outline btn-block">Visit Store</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}