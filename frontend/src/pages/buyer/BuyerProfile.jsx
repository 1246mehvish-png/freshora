import { useState } from 'react';
import { userService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import '../Dashboard.css';

export default function BuyerProfile() {
    const { user, updateUser } = useAuth();
    const { success, error } = useToast();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || '',
        username: user?.username || '',
        email: user?.email || '',
        phone: user?.phone || '',
        whatsapp: user?.whatsapp || '',
        address: user?.address || '',
        city: user?.city || '',
        province: user?.province || '',
        postalCode: user?.postalCode || '',
        country: user?.country || '',
    });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await userService.updateProfile(form);
            updateUser(res.data.user);
            success('Profile updated successfully');
        } catch (err) {
            error(err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h2>My Profile</h2>
                    <p>Manage your personal information and contact details.</p>
                </div>
            </div>

            <div className="dash-card">
                <form className="dash-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input name="name" value={form.name} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Username</label>
                            <input name="username" value={form.username} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Email</label>
                            <input name="email" type="email" value={form.email} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input name="phone" value={form.phone} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>WhatsApp Number</label>
                        <input name="whatsapp" value={form.whatsapp} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Address</label>
                        <input name="address" value={form.address} onChange={handleChange} />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>City</label>
                            <input name="city" value={form.city} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Province</label>
                            <input name="province" value={form.province} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Postal Code</label>
                            <input name="postalCode" value={form.postalCode} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Country</label>
                            <input name="country" value={form.country} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}