import { useState, useEffect } from 'react';
import { settingsService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import '../Dashboard.css';

export default function AdminContactUs() {
    const toast = useToast();
    const { fetchSettings } = useSettings();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        email: '',
        phone: '',
        whatsapp: '',
        businessAddress: '',
        description: '',
    });

    useEffect(() => {
        const load = async () => {
            try {
                const res = await settingsService.get();
                const c = res.data.settings?.contactUs;
                if (c) {
                    setForm({
                        email: c.email || '',
                        phone: c.phone || '',
                        whatsapp: c.whatsapp || '',
                        businessAddress: c.businessAddress || '',
                        description: c.description || '',
                    });
                }
            } catch (err) {
                toast.error(err.message || 'Failed to load contact details');
            } finally {
                setLoading(false);
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email.trim()) {
            toast.error('Contact email is required');
            return;
        }

        setSaving(true);
        try {
            await settingsService.update({ contactUs: form });
            await fetchSettings();
            toast.success('Contact details updated');
        } catch (err) {
            toast.error(err.message || 'Failed to save contact details');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="dash-page">
                <div className="dash-card">
                    <p>Loading contact details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h1>Contact Us</h1>
                    <p>Edit the contact details shown on the public Contact page</p>
                </div>
            </div>

            <form className="dash-card dash-form" onSubmit={handleSubmit} style={{ maxWidth: 760 }}>
                <div className="form-row">
                    <div className="form-group">
                        <label>Email *</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Phone</label>
                        <input type="text" name="phone" value={form.phone} onChange={handleChange} />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>WhatsApp</label>
                        <input type="text" name="whatsapp" value={form.whatsapp} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Business Address</label>
                        <input
                            type="text"
                            name="businessAddress"
                            value={form.businessAddress}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" value={form.description} onChange={handleChange} rows="4" />
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
