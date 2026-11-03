import { useState, useEffect } from 'react';
import { settingsService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import '../Dashboard.css';

export default function AdminTerms() {
    const toast = useToast();
    const { fetchSettings } = useSettings();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [content, setContent] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await settingsService.get();
                setContent(res.data.settings?.termsAndConditions || '');
            } catch (err) {
                toast.error(err.message || 'Failed to load terms and conditions');
            } finally {
                setLoading(false);
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await settingsService.update({ termsAndConditions: content });
            await fetchSettings();
            toast.success('Terms and conditions updated');
        } catch (err) {
            toast.error(err.message || 'Failed to save terms and conditions');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="dash-page">
                <div className="dash-card">
                    <p>Loading terms and conditions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h1>Terms & Conditions</h1>
                    <p>Edit the terms shown on the public Terms page</p>
                </div>
            </div>

            <form className="dash-card dash-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Terms Content</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows="18"
                        placeholder="Write your terms and conditions here..."
                    />
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
