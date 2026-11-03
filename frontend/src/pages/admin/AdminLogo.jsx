import { useState, useEffect } from 'react';
import { settingsService, uploadService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import '../Dashboard.css';

export default function AdminLogo() {
    const toast = useToast();
    const { fetchSettings } = useSettings();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [logo, setLogo] = useState('');
    const [favicon, setFavicon] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [faviconFile, setFaviconFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [faviconPreview, setFaviconPreview] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await settingsService.get();
                const s = res.data.settings || {};
                setLogo(s.logo || '');
                setFavicon(s.favicon || '');
                setLogoPreview(s.logo || '');
                setFaviconPreview(s.favicon || '');
            } catch (err) {
                toast.error(err.message || 'Failed to load logo settings');
            } finally {
                setLoading(false);
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLogo = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
    };

    const handleFavicon = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFaviconFile(file);
        setFaviconPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            let nextLogo = logo;
            let nextFavicon = favicon;

            if (logoFile) {
                const up = await uploadService.single(logoFile);
                nextLogo = up.data.url;
            }
            if (faviconFile) {
                const up = await uploadService.single(faviconFile);
                nextFavicon = up.data.url;
            }

            await settingsService.update({ logo: nextLogo, favicon: nextFavicon });
            setLogo(nextLogo);
            setFavicon(nextFavicon);
            setLogoFile(null);
            setFaviconFile(null);
            await fetchSettings();
            toast.success('Logo settings updated');
        } catch (err) {
            toast.error(err.message || 'Failed to save logo settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="dash-page">
                <div className="dash-card">
                    <p>Loading logo settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h1>Manage Logo</h1>
                    <p>Update the site logo and favicon shown across the website</p>
                </div>
            </div>

            <form className="dash-card dash-form" onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
                <div className="form-group">
                    <label>Site Logo</label>
                    {logoPreview && (
                        <div className="logo-preview">
                            <img src={logoPreview} alt="site logo" />
                        </div>
                    )}
                    <div className="upload-area">
                        <input type="file" accept="image/*" onChange={handleLogo} />
                        <div className="upload-trigger">
                            <span className="upload-icon">🖼️</span>
                            <span className="upload-hint">Choose a new logo image</span>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label>Favicon</label>
                    {faviconPreview && (
                        <div className="logo-preview">
                            <img src={faviconPreview} alt="favicon preview" />
                        </div>
                    )}
                    <div className="upload-area">
                        <input type="file" accept="image/*" onChange={handleFavicon} />
                        <div className="upload-trigger">
                            <span className="upload-icon">🔖</span>
                            <span className="upload-hint">Choose a new favicon image</span>
                        </div>
                    </div>
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
