import { useState, useEffect } from 'react';
import { settingsService, uploadService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import '../Dashboard.css';

export default function AdminAboutUs() {
    const toast = useToast();
    const { fetchSettings } = useSettings();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ title: '', content: '', image: '' });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await settingsService.get();
                const about = res.data.settings?.aboutUs;
                if (about) {
                    setForm({
                        title: about.title || '',
                        content: about.content || '',
                        image: about.image || '',
                    });
                    setImagePreview(about.image || '');
                }
            } catch (err) {
                toast.error(err.message || 'Failed to load About Us content');
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

    const handleImage = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) {
            toast.error('Title is required');
            return;
        }

        setSaving(true);
        try {
            let image = form.image;
            if (imageFile) {
                const up = await uploadService.single(imageFile);
                image = up.data.url;
            }

            await settingsService.update({ aboutUs: { title: form.title, content: form.content, image } });
            setForm({ ...form, image });
            setImageFile(null);
            await fetchSettings();
            toast.success('About Us content updated');
        } catch (err) {
            toast.error(err.message || 'Failed to save About Us content');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="dash-page">
                <div className="dash-card">
                    <p>Loading About Us content...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h1>About Us</h1>
                    <p>Edit the content shown on the public About page</p>
                </div>
            </div>

            <form className="dash-card dash-form" onSubmit={handleSubmit} style={{ maxWidth: 760 }}>
                <div className="form-group">
                    <label>Title *</label>
                    <input type="text" name="title" value={form.title} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Content</label>
                    <textarea name="content" value={form.content} onChange={handleChange} rows="10" />
                </div>
                <div className="form-group">
                    <label>About Image</label>
                    {imagePreview && (
                        <div className="banner-preview">
                            <img src={imagePreview} alt="about preview" />
                        </div>
                    )}
                    <div className="upload-area">
                        <input type="file" accept="image/*" onChange={handleImage} />
                        <div className="upload-trigger">
                            <span className="upload-icon">ℹ️</span>
                            <span className="upload-hint">Choose an image for the About page</span>
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
