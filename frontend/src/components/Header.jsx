import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import './Header.css';

export default function Header() {
    const { user, isAuthenticated, isBuyer, isSeller, isAdmin, logout } = useAuth();
    const { itemCount } = useCart();
    const { settings } = useSettings();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [userMenu, setUserMenu] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
            setSearch('');
            setMobileOpen(false);
        }
    };

    const dashboardPath = isAdmin ? '/admin' : isSeller ? '/seller' : '/buyer';

    const handleLogout = () => {
        logout();
        setUserMenu(false);
        setMobileOpen(false);
        navigate('/');
    };

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/shop', label: 'Shop' },
        { to: '/sellers', label: 'Find Sellers' },
        { to: '/about', label: 'About Us' },
        { to: '/contact', label: 'Contact Us' },
    ];

    return (
        <header className="header">
            <div className="header-top">
                <div className="container header-top-inner">
                    <span>🚚 Free delivery on orders above Rs. {settings?.deliveryCharges?.freeAbove || 3000}</span>
                    <span>🌿 Fresh from local farms, daily</span>
                </div>
            </div>

            <div className="header-main">
                <div className="container header-inner">
                    <Link to="/" className="logo">
                        {settings?.logo ? (
                            <img src={settings.logo} alt="Freshora" className="logo-img" />
                        ) : (
                            <span className="logo-mark">🥬</span>
                        )}
                        <span className="logo-text">
                            Fresh<span>ora</span>
                        </span>
                    </Link>

                    <form className="header-search" onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Search fresh fruits & vegetables..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit" aria-label="Search">
                            🔍
                        </button>
                    </form>

                    <nav className={`header-nav ${mobileOpen ? 'open' : ''}`}>
                        {navLinks.map((l) => (
                            <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={() => setMobileOpen(false)}>
                                {l.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="header-actions">
                        {isBuyer && (
                            <Link to="/cart" className="cart-btn" aria-label="Cart">
                                🛒
                                {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
                            </Link>
                        )}

                        {isAuthenticated ? (
                            <div className="user-menu-wrap">
                                <button className="user-btn" onClick={() => setUserMenu((v) => !v)}>
                                    <span className="avatar">{user.name?.charAt(0).toUpperCase()}</span>
                                    <span className="user-name">{user.name?.split(' ')[0]}</span>
                                    <span className="caret">▾</span>
                                </button>
                                {userMenu && (
                                    <div className="user-menu" onMouseLeave={() => setUserMenu(false)}>
                                        <div className="user-menu-head">
                                            <strong>{user.name}</strong>
                                            <small>{user.email}</small>
                                            <span className="badge badge-green">{user.role}</span>
                                        </div>
                                        <Link to={dashboardPath} onClick={() => setUserMenu(false)}>
                                            📊 Dashboard
                                        </Link>
                                        {isBuyer && (
                                            <>
                                                <Link to="/buyer/orders" onClick={() => setUserMenu(false)}>📦 My Orders</Link>
                                                <Link to="/buyer/wishlist" onClick={() => setUserMenu(false)}>❤️ Wishlist</Link>
                                            </>
                                        )}
                                        <button onClick={handleLogout} className="logout-link">🚪 Logout</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="auth-btns">
                                <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
                                <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
                            </div>
                        )}

                        <button className="hamburger" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
                            ☰
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}