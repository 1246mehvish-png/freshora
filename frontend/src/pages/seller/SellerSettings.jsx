import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, uploadService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import '../Dashboard.css';

export default function SellerSettings() {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const toast = useToast();

    const [form, setForm] = useState({
        name: '',
        phone: '',
        whatsapp: '',
        address: '',
        city: '',
        province: '',
        postalCode: '',
        country: '',
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || '',
                phone: user.phone || '',
                whatsapp: user.whatsapp || '',
                address: user.address || '',
                city: user.city || '',
                province: user.province || '',
                postalCode: user.postalCode || '',
                country: user.country || '',
            });
            setAvatarPreview(user.avatar || '');
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleAvatar = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Name is required';
        if (!form.phone.trim()) errs.phone = 'Phone number is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSaving(true);
        try {
            let avatar = user?.avatar || '';
            if (avatarFile) {
                const up = await uploadService.single(avatarFile);
                avatar = up.data.url;
            }

            const res = await userService.updateProfile({ ...form, avatar });
            updateUser(res.data.user);
            toast.success('Account settings updated');
            navigate('/seller');
        } catch (err) {
            toast.error(err.message || 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h1>Account Settings</h1>
                    <p>Manage your personal account information</p>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => navigate('/seller')}>
                    ← Back
                </button>
            </div>

            <form className="dash-card dash-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Profile Photo</label>
                    <div className="avatar-upload">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="avatar" className="avatar-preview" />
                        ) : (
                            <div className="avatar-placeholder">👤</div>
                        )}
                        <div className="upload-area">
                            <input type="file" accept="image/*" onChange={handleAvatar} id="seller-avatar" />
                            <label htmlFor="seller-avatar" className="upload-trigger">
                                <span className="upload-icon">📷</span>
                                <span>Upload photo</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Full Name *</label>
                        <input type="text" name="name" value={form.name} onChange={handleChange} />
                        {errors.name && <span className="form-error">{errors.name}</span>}
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={user?.email || ''} disabled />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Phone *</label>
                        <input type="text" name="phone" value={form.phone} onChange={handleChange} />
                        {errors.phone && <span className="form-error">{errors.phone}</span>}
                    </div>
                    <div className="form-group">
                        <label>WhatsApp</label>
                        <input type="text" name="whatsapp" value={form.whatsapp} onChange={handleChange} />
                    </div>
                </div>

                <div className="form-group">
                    <label>Address</label>
                    <input type="text" name="address" value={form.address} onChange={handleChange} />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>City</label>
                        <input type="text" name="city" value={form.city} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Province</label>
                        <input type="text" name="province" value={form.province} onChange={handleChange} />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Postal Code</label>
                        <input type="text" name="postalCode" value={form.postalCode} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Country</label>
                        <input type="text" name="country" value={form.country} onChange={handleChange} />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn btn-outline" onClick={() => navigate('/seller')}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}