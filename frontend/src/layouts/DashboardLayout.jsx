import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import './DashboardLayout.css';

const buyerLinks = [
    { to: '/buyer', label: 'Dashboard Overview', icon: '📊', end: true },
    { to: '/buyer/profile', label: 'My Profile', icon: '👤' },
    { to: '/buyer/orders', label: 'My Orders', icon: '📦' },
    { to: '/buyer/payments', label: 'Payment History', icon: '💳' },
    { to: '/buyer/wishlist', label: 'Wishlist', icon: '❤️' },
    { to: '/buyer/addresses', label: 'Saved Addresses', icon: '📍' },
    { to: '/buyer/notifications', label: 'Notifications', icon: '🔔' },
    { to: '/buyer/change-password', label: 'Change Password', icon: '🔒' },
];

const sellerLinks = [
    { to: '/seller', label: 'Dashboard Overview', icon: '📊', end: true },
    { to: '/seller/products', label: 'My Products', icon: '🥬' },
    { to: '/seller/products/add', label: 'Add New Product', icon: '➕' },
    { to: '/seller/orders', label: 'Manage Orders', icon: '📦' },
    { to: '/seller/sales', label: 'Sales History', icon: '📈' },
    { to: '/seller/earnings', label: 'Earnings', icon: '💰' },
    { to: '/seller/store', label: 'Store Profile', icon: '🏪' },
    { to: '/seller/settings', label: 'Store Settings', icon: '⚙️' },
    { to: '/seller/notifications', label: 'Notifications', icon: '🔔' },
    { to: '/seller/change-password', label: 'Change Password', icon: '🔒' },
];

const adminLinks = [
    { to: '/admin', label: 'Dashboard Overview', icon: '📊', end: true },
    { to: '/admin/buyers', label: 'Manage Buyers', icon: '👥' },
    { to: '/admin/sellers', label: 'Manage Sellers', icon: '🏪' },
    { to: '/admin/seller-requests', label: 'Seller Requests', icon: '📨' },
    { to: '/admin/products', label: 'Manage Products', icon: '🥬' },
    { to: '/admin/categories', label: 'Manage Categories', icon: '🗂️' },
    { to: '/admin/orders', label: 'Manage Orders', icon: '📦' },
    { to: '/admin/payments', label: 'Manage Payments', icon: '💳' },
    { to: '/admin/delivery-charges', label: 'Delivery Charges', icon: '🚚' },
    { to: '/admin/reviews', label: 'Manage Reviews', icon: '⭐' },
    { to: '/admin/contact-messages', label: 'Contact Messages', icon: '✉️' },
    { to: '/admin/notifications', label: 'Notifications', icon: '🔔' },
    { to: '/admin/settings', label: 'Website Settings', icon: '⚙️' },
    { to: '/admin/logo', label: 'Manage Logo', icon: '🖼️' },
    { to: '/admin/banners', label: 'Homepage Banners', icon: '🎪' },
    { to: '/admin/about-us', label: 'About Us', icon: 'ℹ️' },
    { to: '/admin/contact-us', label: 'Contact Us', icon: '📞' },
    { to: '/admin/privacy', label: 'Privacy Policy', icon: '🔐' },
    { to: '/admin/terms', label: 'Terms & Conditions', icon: '📜' },
];

export default function DashboardLayout({ role }) {
    const { user, logout } = useAuth();
    const { settings } = useSettings();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const links = role === 'buyer' ? buyerLinks : role === 'seller' ? sellerLinks : adminLinks;
    const title = role === 'buyer' ? 'Buyer Dashboard' : role === 'seller' ? 'Seller Dashboard' : 'Admin Dashboard';

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="dash-layout">
            <aside className={`dash-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="dash-sidebar-head">
                    <Link to="/" className="dash-logo">
                        {settings?.logo ? (
                            <img src={settings.logo} alt="Freshora" className="dash-logo-img" />
                        ) : (
                            <span className="logo-mark">🥬</span>
                        )}
                        <span className="logo-text">Fresh<span>ora</span></span>
                    </Link>
                    <button className="dash-close" onClick={() => setSidebarOpen(false)}>✕</button>
                </div>

                <div className="dash-user">
                    <span className="avatar">{user?.name?.charAt(0).toUpperCase()}</span>
                    <div>
                        <strong>{user?.name}</strong>
                        <small>{title}</small>
                    </div>
                </div>

                <nav className="dash-nav">
                    {links.map((l) => (
                        <NavLink
                            key={l.to}
                            to={l.to}
                            end={l.end}
                            className={({ isActive }) => (isActive ? 'active' : '')}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="dash-nav-icon">{l.icon}</span>
                            {l.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="dash-sidebar-foot">
                    <Link to="/" className="dash-foot-link">🏠 Back to Website</Link>
                    <button onClick={handleLogout} className="dash-foot-link logout">🚪 Logout</button>
                </div>
            </aside>

            {sidebarOpen && <div className="dash-overlay" onClick={() => setSidebarOpen(false)} />}

            <div className="dash-main">
                <div className="dash-topbar">
                    <button className="dash-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
                    <h1>{title}</h1>
                    <div className="dash-topbar-right">
                        <Link to="/" className="btn btn-light btn-sm">View Store</Link>
                    </div>
                </div>
                <div className="dash-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}