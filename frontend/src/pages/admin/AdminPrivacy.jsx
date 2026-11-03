import { useState, useEffect } from 'react';
import { settingsService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import '../Dashboard.css';

export default function AdminPrivacy() {
    const toast = useToast();
    const { fetchSettings } = useSettings();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [content, setContent] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await settingsService.get();
                setContent(res.data.settings?.privacyPolicy || '');
            } catch (err) {
                toast.error(err.message || 'Failed to load privacy policy');
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
            await settingsService.update({ privacyPolicy: content });
            await fetchSettings();
            toast.success('Privacy policy updated');
        } catch (err) {
            toast.error(err.message || 'Failed to save privacy policy');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="dash-page">
                <div className="dash-card">
                    <p>Loading privacy policy...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h1>Privacy Policy</h1>
                    <p>Edit the privacy policy shown on the public Privacy Policy page</p>
                </div>
            </div>

            <form className="dash-card dash-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Policy Content</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows="18"
                        placeholder="Write your privacy policy here..."
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
