import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSettings } from '../context/SettingsContext';
import './Auth.css';

export default function Login() {
    const { login, loading } = useAuth();
    const toast = useToast();
    const { settings } = useSettings();
    const navigate = useNavigate();

    const [role, setRole] = useState('buyer');
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await login(form.email, form.password, role);
            toast.success(res.message || 'Login successful');
            const userRole = res.user.role;
            if (userRole === 'admin') navigate('/admin');
            else if (userRole === 'seller') navigate('/seller');
            else navigate('/buyer');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card card">
                <div className="auth-logo">
                    {settings?.logo ? <img src={settings.logo} alt="Freshora" /> : <span className="logo-mark">🥬</span>}
                    <h1>Fresh<span>ora</span></h1>
                </div>
                <h2 className="auth-welcome">Welcome Back!</h2>
                <p className="auth-sub">Login to continue shopping fresh</p>

                <div className="role-tabs">
                    <button className={role === 'buyer' ? 'active' : ''} onClick={() => setRole('buyer')}>
                        🛒 Buyer
                    </button>
                    <button className={role === 'seller' ? 'active' : ''} onClick={() => setRole('seller')}>
                        🏪 Seller
                    </button>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address <span className="req">*</span></label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password <span className="req">*</span></label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="auth-row">
                        <label className="remember">
                            <input type="checkbox" /> Remember me
                        </label>
                        <Link to="/login" className="forgot">Forgot Password?</Link>
                    </div>
                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="auth-switch">
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
                <p className="auth-admin">
                    <Link to="/login">Admin Login</Link>
                </p>
            </div>
        </div>
    );
}