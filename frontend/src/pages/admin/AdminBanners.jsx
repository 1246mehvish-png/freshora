import { useState, useEffect } from 'react';
import { settingsService, uploadService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import EmptyState from '../../components/EmptyState';
import '../Dashboard.css';

const emptyForm = { title: '', subtitle: '', link: '', displayOrder: 0 };

export default function AdminBanners() {
    const toast = useToast();
    const { fetchSettings } = useSettings();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try {
            const res = await settingsService.get();
            setBanners(res.data.settings?.banners || []);
        } catch (err) {
            toast.error(err.message || 'Failed to load banners');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openAdd = () => {
        setForm(emptyForm);
        setImageFile(null);
        setImagePreview('');
        setShowModal(true);
    };

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
        if (!imageFile) {
            toast.error('Banner image is required');
            return;
        }

        setSaving(true);
        try {
            const up = await uploadService.single(imageFile);
            await settingsService.addBanner({
                title: form.title,
                subtitle: form.subtitle,
                link: form.link,
                image: up.data.url,
                displayOrder: Number(form.displayOrder) || 0,
            });
            toast.success('Banner added');
            setShowModal(false);
            await load();
            await fetchSettings();
        } catch (err) {
            toast.error(err.message || 'Failed to add banner');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Delete banner "${title || 'Untitled'}"?`)) return;
        try {
            await settingsService.deleteBanner(id);
            toast.success('Banner deleted');
            await load();
            await fetchSettings();
        } catch (err) {
            toast.error(err.message || 'Failed to delete banner');
        }
    };

    if (loading) {
        return (
            <div className="dash-page">
                <div className="dash-card">
                    <p>Loading banners...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h1>Homepage Banners</h1>
                    <p>Manage the rotating banners shown in the homepage hero</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={openAdd}>
                    + Add Banner
                </button>
            </div>

            {banners.length === 0 ? (
                <div className="dash-card">
                    <EmptyState icon="🎪" title="No banners" message="Add your first homepage banner to get started." />
                </div>
            ) : (
                <div className="dash-table-wrap">
                    <table className="dash-table">
                        <thead>
                            <tr>
                                <th>Preview</th>
                                <th>Title</th>
                                <th>Subtitle</th>
                                <th>Link</th>
                                <th>Order</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {banners.map((b) => (
                                <tr key={b._id}>
                                    <td>
                                        <div className="banner-preview">
                                            <img src={b.image} alt={b.title || 'banner'} />
                                        </div>
                                    </td>
                                    <td>
                                        <strong>{b.title || '—'}</strong>
                                    </td>
                                    <td>{b.subtitle || '—'}</td>
                                    <td>{b.link || '—'}</td>
                                    <td>{b.displayOrder}</td>
                                    <td>
                                        <div className="table-actions">
                                            <button
                                                className="btn btn-xs btn-danger"
                                                onClick={() => handleDelete(b._id, b.title)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <h3>Add Banner</h3>
                        <form className="dash-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Title</label>
                                <input type="text" name="title" value={form.title} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Subtitle</label>
                                <input type="text" name="subtitle" value={form.subtitle} onChange={handleChange} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Link</label>
                                    <input
                                        type="text"
                                        name="link"
                                        value={form.link}
                                        onChange={handleChange}
                                        placeholder="/shop"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Display Order</label>
                                    <input
                                        type="number"
                                        name="displayOrder"
                                        value={form.displayOrder}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Banner Image *</label>
                                {imagePreview && (
                                    <div className="banner-preview">
                                        <img src={imagePreview} alt="banner preview" />
                                    </div>
                                )}
                                <div className="upload-area">
                                    <input type="file" accept="image/*" onChange={handleImage} />
                                    <div className="upload-trigger">
                                        <span className="upload-icon">🎪</span>
                                        <span className="upload-hint">Choose a banner image</span>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : 'Add Banner'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
