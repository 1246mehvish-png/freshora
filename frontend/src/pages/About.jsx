import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import './About.css';

export default function About() {
    const { settings } = useSettings();
    const about = settings?.aboutUs || { title: 'About Freshora', content: '', image: '' };

    return (
        <div className="about-page">
            <section className="page-banner">
                <div className="container">
                    <h1>About Us</h1>
                    <p>Freshora — Your Daily Freshness Delivered.</p>
                </div>
            </section>

            <section className="section container">
                <div className="about-grid">
                    <div className="about-image">
                        {about.image ? (
                            <img src={about.image} alt="About Freshora" />
                        ) : (
                            <div className="about-image-placeholder">🌿</div>
                        )}
                    </div>
                    <div className="about-content">
                        <span className="section-tag">Who We Are</span>
                        <h2>{about.title || 'About Freshora'}</h2>
                        <p>
                            {about.content ||
                                'Freshora is a multi-vendor marketplace that connects local farmers, growers, and fresh produce stores directly with customers. We believe in farm-to-table freshness — no middlemen, no long storage, just the freshest fruits and vegetables delivered to your doorstep.'}
                        </p>
                        <div className="about-features">
                            <div className="about-feature">
                                <span className="feature-icon">🚚</span>
                                <div>
                                    <h4>Fast Delivery</h4>
                                    <p>Same-day and next-day delivery options available.</p>
                                </div>
                            </div>
                            <div className="about-feature">
                                <span className="feature-icon">🥬</span>
                                <div>
                                    <h4>Farm Fresh</h4>
                                    <p>Products sourced directly from trusted local sellers.</p>
                                </div>
                            </div>
                            <div className="about-feature">
                                <span className="feature-icon">💳</span>
                                <div>
                                    <h4>Secure Payments</h4>
                                    <p>Multiple payment options including cash on delivery.</p>
                                </div>
                            </div>
                            <div className="about-feature">
                                <span className="feature-icon">⭐</span>
                                <div>
                                    <h4>Quality Guaranteed</h4>
                                    <p>Every product is quality-checked before it reaches you.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section container">
                <div className="section-title">
                    <h2>Our Mission</h2>
                    <p>What drives us every day</p>
                    <div className="title-line" />
                </div>
                <div className="mission-grid">
                    <div className="mission-card">
                        <span className="mission-icon">🎯</span>
                        <h3>Our Mission</h3>
                        <p>
                            To make fresh, healthy, and affordable produce accessible to every household by
                            empowering local sellers and farmers with a modern digital marketplace.
                        </p>
                    </div>
                    <div className="mission-card">
                        <span className="mission-icon">👁️</span>
                        <h3>Our Vision</h3>
                        <p>
                            To become the leading fresh produce marketplace in the region, setting the standard
                            for quality, freshness, and customer trust.
                        </p>
                    </div>
                    <div className="mission-card">
                        <span className="mission-icon">🤝</span>
                        <h3>Our Values</h3>
                        <p>
                            Freshness first, transparency always, and community growth. We support local
                            businesses and sustainable farming practices.
                        </p>
                    </div>
                </div>
            </section>

            <section className="section container">
                <div className="cta-banner">
                    <div>
                        <h2>Ready to shop fresh?</h2>
                        <p>Browse our marketplace and get the freshest produce delivered to your door.</p>
                    </div>
                    <div className="cta-actions">
                        <Link to="/shop" className="btn btn-primary">Shop Now</Link>
                        <Link to="/register" className="btn btn-light">Become a Seller</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
