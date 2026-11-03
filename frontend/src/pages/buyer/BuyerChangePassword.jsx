import { useState } from 'react';
import { authService } from '../../services';
import { useToast } from '../../context/ToastContext';
import '../Dashboard.css';

export default function BuyerChangePassword() {
    const { success, error } = useToast();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.newPassword.length < 6) {
            error('New password must be at least 6 characters');
            return;
        }
        if (form.newPassword !== form.confirmPassword) {
            error('Passwords do not match');
            return;
        }
        setSaving(true);
        try {
            await authService.changePassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });
            success('Password changed successfully');
            setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            error(err.message || 'Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h2>Change Password</h2>
                    <p>Keep your account secure with a strong password.</p>
                </div>
            </div>

            <div className="dash-card" style={{ maxWidth: 520 }}>
                <form className="dash-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Current Password *</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={form.currentPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>New Password *</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={form.newPassword}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm New Password *</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}