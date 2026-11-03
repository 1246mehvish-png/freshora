import { useState, useEffect } from 'react';
import { settingsService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import '../Dashboard.css';

export default function AdminDeliveryCharges() {
    const toast = useToast();
    const { fetchSettings } = useSettings();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ defaultCharge: 150, freeAbove: 3000 });

    useEffect(() => {
        const load = async () => {
            try {
                const res = await settingsService.get();
                const dc = res.data.settings?.deliveryCharges;
                if (dc) {
                    setForm({
                        defaultCharge: dc.defaultCharge ?? 150,
                        freeAbove: dc.freeAbove ?? 3000,
                    });
                }
            } catch (err) {
                toast.error(err.message || 'Failed to load delivery charges');
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
        const defaultCharge = Number(form.defaultCharge);
        const freeAbove = Number(form.freeAbove);

        if (Number.isNaN(defaultCharge) || defaultCharge < 0) {
            toast.error('Default charge must be zero or more');
            return;
        }
        if (Number.isNaN(freeAbove) || freeAbove < 0) {
            toast.error('Free delivery threshold must be zero or more');
            return;
        }

        setSaving(true);
        try {
            await settingsService.update({ deliveryCharges: { defaultCharge, freeAbove } });
            await fetchSettings();
            toast.success('Delivery charges updated');
        } catch (err) {
            toast.error(err.message || 'Failed to update delivery charges');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="dash-page">
                <div className="dash-card">
                    <p>Loading delivery charges...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h1>Delivery Charges</h1>
                    <p>Control the default delivery fee and free-delivery threshold</p>
                </div>
            </div>

            <div className="dash-card" style={{ maxWidth: 640 }}>
                <h3>Charge Settings</h3>
                <form className="dash-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Default Delivery Charge (Rs) *</label>
                            <input
                                type="number"
                                name="defaultCharge"
                                value={form.defaultCharge}
                                onChange={handleChange}
                                min="0"
                                step="1"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Free Delivery Above (Rs) *</label>
                            <input
                                type="number"
                                name="freeAbove"
                                value={form.freeAbove}
                                onChange={handleChange}
                                min="0"
                                step="1"
                                required
                            />
                        </div>
                    </div>
                    <p className="dash-muted">
                        Orders with a subtotal above the free-delivery threshold ship free. Set the threshold to 0 to
                        always charge the default fee.
                    </p>
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
