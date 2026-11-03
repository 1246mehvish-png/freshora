import { useState, useEffect } from 'react';
import { settingsService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import '../Dashboard.css';

export default function AdminWebsiteSettings() {
    const toast = useToast();
    const { fetchSettings } = useSettings();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        siteName: '',
        tagline: '',
        heroHeading: '',
        heroSubheading: '',
        promotionalContent: '',
        footerAboutText: '',
        footerCopyright: '',
        facebook: '',
        twitter: '',
        instagram: '',
        youtube: '',
    });

    useEffect(() => {
        const load = async () => {
            try {
                const res = await settingsService.get();
                const s = res.data.settings || {};
                setForm({
                    siteName: s.siteName || '',
                    tagline: s.tagline || '',
                    heroHeading: s.heroHeading || '',
                    heroSubheading: s.heroSubheading || '',
                    promotionalContent: s.promotionalContent || '',
                    footerAboutText: s.footerContent?.aboutText || '',
                    footerCopyright: s.footerContent?.copyright || '',
                    facebook: s.footerContent?.socialLinks?.facebook || '',
                    twitter: s.footerContent?.socialLinks?.twitter || '',
                    instagram: s.footerContent?.socialLinks?.instagram || '',
                    youtube: s.footerContent?.socialLinks?.youtube || '',
                });
            } catch (err) {
                toast.error(err.message || 'Failed to load settings');
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
        if (!form.siteName.trim()) {
            toast.error('Site name is required');
            return;
        }

        setSaving(true);
        try {
            await settingsService.update({
                siteName: form.siteName,
                tagline: form.tagline,
                heroHeading: form.heroHeading,
                heroSubheading: form.heroSubheading,
                promotionalContent: form.promotionalContent,
                footerContent: {
                    aboutText: form.footerAboutText,
                    copyright: form.footerCopyright,
                    socialLinks: {
                        facebook: form.facebook,
                        twitter: form.twitter,
                        instagram: form.instagram,
                        youtube: form.youtube,
                    },
                },
            });
            await fetchSettings();
            toast.success('Website settings updated');
        } catch (err) {
            toast.error(err.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="dash-page">
                <div className="dash-card">
                    <p>Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h1>Website Settings</h1>
                    <p>Manage branding, homepage hero, and footer content</p>
                </div>
            </div>

            <form className="dash-card dash-form" onSubmit={handleSubmit}>
                <h3>Branding</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label>Site Name *</label>
                        <input type="text" name="siteName" value={form.siteName} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Tagline</label>
                        <input type="text" name="tagline" value={form.tagline} onChange={handleChange} />
                    </div>
                </div>

                <h3>Homepage Hero</h3>
                <div className="form-group">
                    <label>Hero Heading</label>
                    <input type="text" name="heroHeading" value={form.heroHeading} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Hero Subheading</label>
                    <textarea name="heroSubheading" value={form.heroSubheading} onChange={handleChange} rows="2" />
                </div>
                <div className="form-group">
                    <label>Promotional Content</label>
                    <textarea
                        name="promotionalContent"
                        value={form.promotionalContent}
                        onChange={handleChange}
                        rows="3"
                    />
                </div>

                <h3>Footer</h3>
                <div className="form-group">
                    <label>About Text</label>
                    <textarea
                        name="footerAboutText"
                        value={form.footerAboutText}
                        onChange={handleChange}
                        rows="3"
                    />
                </div>
                <div className="form-group">
                    <label>Copyright</label>
                    <input type="text" name="footerCopyright" value={form.footerCopyright} onChange={handleChange} />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Facebook</label>
                        <input type="text" name="facebook" value={form.facebook} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Twitter</label>
                        <input type="text" name="twitter" value={form.twitter} onChange={handleChange} />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Instagram</label>
                        <input type="text" name="instagram" value={form.instagram} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>YouTube</label>
                        <input type="text" name="youtube" value={form.youtube} onChange={handleChange} />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}
