import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import './Footer.css';

export default function Footer() {
    const { settings } = useSettings();
    const footer = settings?.footerContent || {};
    const contact = settings?.contactUs || {};
    const social = footer.socialLinks || {};

    return (
        <footer className="footer">
            <div className="container footer-grid">
                <div className="footer-col footer-brand">
                    <div className="footer-logo">
                        {settings?.logo ? (
                            <img src={settings.logo} alt="Freshora" className="footer-logo-img" />
                        ) : (
                            <span className="logo-mark">🥬</span>
                        )}
                        <span className="logo-text">Fresh<span>ora</span></span>
                    </div>
                    <p>{footer.aboutText || 'Freshora is a multi-vendor marketplace connecting local fruit and vegetable sellers with online customers.'}</p>
                    <div className="footer-social">
                        {social.facebook && <a href={social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">📘</a>}
                        {social.twitter && <a href={social.twitter} target="_blank" rel="noreferrer" aria-label="Twitter">🐦</a>}
                        {social.instagram && <a href={social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">📸</a>}
                        {social.youtube && <a href={social.youtube} target="_blank" rel="noreferrer" aria-label="YouTube">▶️</a>}
                    </div>
                </div>

                <div className="footer-col">
                    <h4>Quick Links</h4>
                    <Link to="/">Home</Link>
                    <Link to="/shop">Shop</Link>
                    <Link to="/sellers">Find Sellers</Link>
                    <Link to="/about">About Us</Link>
                    <Link to="/contact">Contact Us</Link>
                </div>

                <div className="footer-col">
                    <h4>Categories</h4>
                    <Link to="/shop?category=fresh-fruits">Fresh Fruits</Link>
                    <Link to="/shop?category=fresh-vegetables">Fresh Vegetables</Link>
                    <Link to="/shop?category=organic-products">Organic Products</Link>
                    <Link to="/shop?category=seasonal-fruits">Seasonal Fruits</Link>
                    <Link to="/shop?category=leafy-vegetables">Leafy Vegetables</Link>
                </div>

                <div className="footer-col">
                    <h4>Contact</h4>
                    <p>📍 {contact.businessAddress || 'Freshora HQ, Lahore, Pakistan'}</p>
                    <p>📧 {contact.email || 'support@freshora.com'}</p>
                    <p>📞 {contact.phone || '+92 300 0000000'}</p>
                    <p>💬 {contact.whatsapp || '+92 300 0000000'}</p>
                </div>

                <div className="footer-col">
                    <h4>Legal</h4>
                    <Link to="/privacy-policy">Privacy Policy</Link>
                    <Link to="/terms">Terms and Conditions</Link>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <p>{footer.copyright || `© ${new Date().getFullYear()} Freshora. All rights reserved.`}</p>
                </div>
            </div>
        </footer>
    );
}