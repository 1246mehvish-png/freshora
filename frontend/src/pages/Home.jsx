import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService, sellerService } from '../services';
import { useSettings } from '../context/SettingsContext';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import './Home.css';

export default function Home() {
    const { settings } = useSettings();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await productService.getHome();
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
        }
    };

    if (loading) return <Spinner text="Loading Freshora..." />;

    const heroImage = settings?.banners?.[0]?.image || '';
    const heroHeading = settings?.heroHeading || 'Your Daily Freshness Delivered.';
    const heroSub = settings?.heroSubheading || 'Fresh fruits and vegetables from trusted local sellers, delivered to your doorstep.';

    const sections = [
        { title: 'Trending Products', products: data?.trending || [], empty: 'No trending products yet' },
        { title: 'Best Selling Products', products: data?.bestSelling || [], empty: 'No best selling products yet' },
        { title: 'Seasonal Products', products: data?.seasonal || [], empty: 'No seasonal products yet' },
        { title: 'Special Offers & Discounts', products: data?.offers || [], empty: 'No special offers right now' },
        { title: 'Recommended Products', products: data?.featured || [], empty: 'No recommended products yet' },
    ];

    return (
        <div className="home">
            {/* Hero */}
            <section className="hero" style={heroImage ? { backgroundImage: `url(${heroImage})` } : {}}>
                <div className="hero-overlay" />
                <div className="container hero-content">
                    <span className="hero-badge">🌿 100% Fresh & Organic</span>
                    <h1>{heroHeading}</h1>
                    <p>{heroSub}</p>
                    <form className="hero-search" onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Search for fruits, vegetables, organic..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary">Search</button>
                    </form>
                    <div className="hero-actions">
                        <Link to="/shop" className="btn btn-primary">🛒 Shop Now</Link>
                        <Link to="/sellers" className="btn btn-light">Find Sellers</Link>
                    </div>
                    <div className="hero-stats">
                        <div><strong>100%</strong><span>Fresh</span></div>
                        <div><strong>5+</strong><span>Categories</span></div>
                        <div><strong>24h</strong><span>Delivery</span></div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="section container">
                <div className="section-title">
                    <h2>Shop by Category</h2>
                    <p>Explore our fresh categories</p>
                    <div className="title-line" />
                </div>
                <div className="category-grid">
                    {(data?.categories || []).map((cat) => (
                        <Link key={cat._id} to={`/shop?category=${cat.slug}`} className="category-card card-hover">
                            <div className="category-icon">
                                {cat.image ? <img src={cat.image} alt={cat.name} /> : '🥬'}
                            </div>
                            <h3>{cat.name}</h3>
                            <span>Shop now →</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Featured Sellers */}
            <section className="section container">
                <div className="section-title">
                    <h2>Featured Sellers</h2>
                    <p>Trusted local farmers and stores</p>
                    <div className="title-line" />
                </div>
                {data?.sellers?.length ? (
                    <div className="seller-grid">
                        {data.sellers.map((s) => (
                            <Link key={s._id} to={`/seller/${s._id}`} className="seller-card card-hover">
                                <div className="seller-logo">
                                    {s.storeLogo ? <img src={s.storeLogo} alt={s.storeName} /> : '🏪'}
                                </div>
                                <h3>{s.storeName}</h3>
                                <span className="badge badge-green">{s.businessType}</span>
                                <div className="seller-rating">⭐ {s.rating ? s.rating.toFixed(1) : 'New'}</div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <EmptyState icon="🏪" title="No featured sellers yet" message="Sellers will appear here once approved." />
                )}
            </section>

            {/* Product sections */}
            {sections.map((sec) => (
                <section key={sec.title} className="section container">
                    <div className="section-title">
                        <h2>{sec.title}</h2>
                        <div className="title-line" />
                    </div>
                    {sec.products?.length ? (
                        <div className="product-grid">
                            {sec.products.map((p) => (
                                <ProductCard key={p._id} product={p} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState icon="🥬" title={sec.empty} />
                    )}
                </section>
            ))}

            {/* About Freshora */}
            <section className="section container">
                <div className="about-banner card">
                    <div className="about-banner-content">
                        <h2>{settings?.aboutUs?.title || 'About Freshora'}</h2>
                        <p>
                            {settings?.aboutUs?.content ||
                                'Freshora connects local fruit and vegetable sellers with online customers. We bring farm-fresh produce from trusted sellers straight to your doorstep, supporting local farmers and giving you the freshest options at the best prices.'}
                        </p>
                        <Link to="/about" className="btn btn-dark">Learn More</Link>
                    </div>
                    <div className="about-banner-img">
                        {settings?.aboutUs?.image ? (
                            <img src={settings.aboutUs.image} alt="About Freshora" />
                        ) : (
                            <span>🥕🍎🥦</span>
                        )}
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <section className="section container">
                <div className="newsletter card">
                    <h2>Stay Fresh with Our Newsletter</h2>
                    <p>Get the latest offers, seasonal picks, and fresh arrivals in your inbox.</p>
                    <form
                        className="newsletter-form"
                        onSubmit={(e) => {
                            e.preventDefault();
                            alert('Thank you for subscribing! (Demo)');
                        }}
                    >
                        <input type="email" placeholder="Enter your email" required />
                        <button type="submit" className="btn btn-primary">Subscribe</button>
                    </form>
                </div>
            </section>
        </div>
    );
}