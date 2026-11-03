import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services';
import { useToast } from '../../context/ToastContext';
import '../Dashboard.css';

export default function SellerChangePassword() {
    const navigate = useNavigate();
    const toast = useToast();

    const [form, setForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const validate = () => {
        const errs = {};
        if (!form.currentPassword) errs.currentPassword = 'Current password is required';
        if (!form.newPassword || form.newPassword.length < 6) {
            errs.newPassword = 'New password must be at least 6 characters';
        }
        if (form.confirmPassword !== form.newPassword) {
            errs.confirmPassword = 'Passwords do not match';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSaving(true);
        try {
            await authService.changePassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });
            toast.success('Password changed successfully');
            setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            navigate('/seller');
        } catch (err) {
            toast.error(err.message || 'Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h1>Change Password</h1>
                    <p>Update your account password</p>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => navigate('/seller')}>
                    ← Back
                </button>
            </div>

            <form className="dash-card dash-form" onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
                <div className="form-group">
                    <label>Current Password *</label>
                    <input
                        type="password"
                        name="currentPassword"
                        value={form.currentPassword}
                        onChange={handleChange}
                        placeholder="Enter current password"
                    />
                    {errors.currentPassword && <span className="form-error">{errors.currentPassword}</span>}
                </div>

                <div className="form-group">
                    <label>New Password *</label>
                    <input
                        type="password"
                        name="newPassword"
                        value={form.newPassword}
                        onChange={handleChange}
                        placeholder="At least 6 characters"
                    />
                    {errors.newPassword && <span className="form-error">{errors.newPassword}</span>}
                </div>

                <div className="form-group">
                    <label>Confirm New Password *</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter new password"
                    />
                    {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
                </div>

                <div className="form-actions">
                    <button type="button" className="btn btn-outline" onClick={() => navigate('/seller')}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Updating...' : 'Change Password'}
                    </button>
                </div>
            </form>
        </div>
    );
}