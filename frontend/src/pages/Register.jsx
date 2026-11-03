import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSettings } from '../context/SettingsContext';
import './Auth.css';

const businessTypes = [
    'Fruit Seller',
    'Vegetable Seller',
    'Fruits and Vegetables Seller',
    'Organic Farm',
    'Grocery Store',
];

export default function Register() {
    const { register, loading } = useAuth();
    const toast = useToast();
    const { settings } = useSettings();
    const navigate = useNavigate();

    const [role, setRole] = useState('buyer');
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        name: '',
        username: '',
        phone: '',
        whatsapp: '',
        email: '',
        password: '',
        confirmPassword: '',
        address: '',
        city: '',
        province: '',
        postalCode: '',
        country: 'Pakistan',
        // Seller fields
        storeName: '',
        businessType: businessTypes[0],
        storeContactNumber: '',
        storeAddress: '',
        storeDescription: '',
    });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            const payload = { role, ...form };
            delete payload.confirmPassword;
            const res = await register(payload);
            toast.success(res.message || 'Registration successful!');
            if (role === 'seller') {
                navigate('/login');
            } else {
                navigate('/buyer');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card card auth-card-lg">
                <div className="auth-logo">
                    {settings?.logo ? <img src={settings.logo} alt="Freshora" /> : <span className="logo-mark">🥬</span>}
                    <h1>Fresh<span>ora</span></h1>
                </div>
                <h2 className="auth-welcome">Create Your Account</h2>
                <p className="auth-sub">Join Freshora today</p>

                <div className="role-tabs">
                    <button className={role === 'buyer' ? 'active' : ''} onClick={() => setRole('buyer')}>
                        🛒 Register as Buyer
                    </button>
                    <button className={role === 'seller' ? 'active' : ''} onClick={() => setRole('seller')}>
                        🏪 Register as Seller
                    </button>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <h3 className="form-section-title">Personal Details</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Full Name <span className="req">*</span></label>
                            <input type="text" name="name" className="form-control" value={form.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Username <span className="req">*</span></label>
                            <input type="text" name="username" className="form-control" value={form.username} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Phone Number <span className="req">*</span></label>
                            <input type="tel" name="phone" className="form-control" value={form.phone} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>WhatsApp Number</label>
                            <input type="tel" name="whatsapp" className="form-control" value={form.whatsapp} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Email Address <span className="req">*</span></label>
                        <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Password <span className="req">*</span></label>
                            <input type="password" name="password" className="form-control" value={form.password} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Confirm Password <span className="req">*</span></label>
                            <input type="password" name="confirmPassword" className="form-control" value={form.confirmPassword} onChange={handleChange} required />
                        </div>
                    </div>

                    {role === 'buyer' && (
                        <>
                            <h3 className="form-section-title">Delivery Address</h3>
                            <div className="form-group">
                                <label>Delivery Address <span className="req">*</span></label>
                                <input type="text" name="address" className="form-control" value={form.address} onChange={handleChange} required />
                            </div>
                            <div className="form-row-3">
                                <div className="form-group">
                                    <label>City <span className="req">*</span></label>
                                    <input type="text" name="city" className="form-control" value={form.city} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Province <span className="req">*</span></label>
                                    <input type="text" name="province" className="form-control" value={form.province} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Postal Code <span className="req">*</span></label>
                                    <input type="text" name="postalCode" className="form-control" value={form.postalCode} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Country <span className="req">*</span></label>
                                <input type="text" name="country" className="form-control" value={form.country} onChange={handleChange} required />
                            </div>
                        </>
                    )}

                    {role === 'seller' && (
                        <>
                            <h3 className="form-section-title">Store Details</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Store Name <span className="req">*</span></label>
                                    <input type="text" name="storeName" className="form-control" value={form.storeName} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Business Type <span className="req">*</span></label>
                                    <select name="businessType" className="form-control" value={form.businessType} onChange={handleChange}>
                                        {businessTypes.map((b) => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Store Contact Number <span className="req">*</span></label>
                                    <input type="tel" name="storeContactNumber" className="form-control" value={form.storeContactNumber} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Store Address <span className="req">*</span></label>
                                    <input type="text" name="storeAddress" className="form-control" value={form.storeAddress} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Store Description</label>
                                <textarea name="storeDescription" className="form-control" value={form.storeDescription} onChange={handleChange} placeholder="Describe your store..." />
                            </div>
                            <div className="form-row-3">
                                <div className="form-group">
                                    <label>City <span className="req">*</span></label>
                                    <input type="text" name="city" className="form-control" value={form.city} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Province <span className="req">*</span></label>
                                    <input type="text" name="province" className="form-control" value={form.province} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Country <span className="req">*</span></label>
                                    <input type="text" name="country" className="form-control" value={form.country} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="alert alert-info">
                                ℹ️ Your seller account will be pending admin approval before you can start selling.
                            </div>
                        </>
                    )}

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'Creating account...' : role === 'seller' ? 'Register as Seller' : 'Register as Buyer'}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
}