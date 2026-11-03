import { useState, useEffect } from 'react';
import { categoryService, uploadService } from '../../services';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';
import '../Dashboard.css';

const statusClass = (s) => `status-${(s || 'active').toLowerCase().replace(/\s+/g, '-')}`;

const emptyForm = { name: '', description: '', image: '', status: 'active', displayOrder: 0 };

export default function AdminCategories() {
    const toast = useToast();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try {
            const res = await categoryService.getAll();
            setCategories(res.data.categories || []);
        } catch (err) {
            toast.error(err.message || 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openAdd = () => {
        setEditingId(null);
        setForm(emptyForm);
        setImageFile(null);
        setImagePreview('');
        setShowModal(true);
    };

    const openEdit = (c) => {
        setEditingId(c._id);
        setForm({
            name: c.name || '',
            description: c.description || '',
            image: c.image || '',
            status: c.status || 'active',
            displayOrder: c.displayOrder || 0,
        });
        setImageFile(null);
        setImagePreview(c.image || '');
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
        if (!form.name.trim()) {
            toast.error('Category name is required');
            return;
        }

        setSaving(true);
        try {
            let image = form.image;
            if (imageFile) {
                const up = await uploadService.single(imageFile);
                image = up.data.url;
            }

            const payload = { ...form, image, displayOrder: Number(form.displayOrder) || 0 };
            if (editingId) {
                await categoryService.update(editingId, payload);
                toast.success('Category updated');
            } else {
                await categoryService.create(payload);
                toast.success('Category created');
            }
            setShowModal(false);
            await load();
        } catch (err) {
            toast.error(err.message || 'Failed to save category');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete category "${name}"?`)) return;
        try {
            await categoryService.delete(id);
            toast.success('Category deleted');
            await load();
        } catch (err) {
            toast.error(err.message || 'Failed to delete category');
        }
    };

    if (loading) {
        return (
            <div className="dash-page">
                <div className="dash-card">
                    <p>Loading categories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h1>Manage Categories</h1>
                    <p>Organize products into categories</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={openAdd}>
                    + Add Category
                </button>
            </div>

            {categories.length === 0 ? (
                <div className="dash-card">
                    <EmptyState icon="🗂️" title="No categories" message="Create your first category to organize products." />
                </div>
            ) : (
                <div className="dash-table-wrap">
                    <table className="dash-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Slug</th>
                                <th>Description</th>
                                <th>Order</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((c) => (
                                <tr key={c._id}>
                                    <td>
                                        {c.image ? (
                                            <img src={c.image} alt={c.name} className="table-img" />
                                        ) : (
                                            <div className="table-img">🗂️</div>
                                        )}
                                    </td>
                                    <td>
                                        <strong>{c.name}</strong>
                                    </td>
                                    <td>{c.slug}</td>
                                    <td className="table-desc">{c.description || '—'}</td>
                                    <td>{c.displayOrder}</td>
                                    <td>
                                        <span className={`status-badge ${statusClass(c.status)}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="btn btn-xs btn-outline" onClick={() => openEdit(c)}>
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-xs btn-danger"
                                                onClick={() => handleDelete(c._id, c.name)}
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
                        <h3>{editingId ? 'Edit Category' : 'Add Category'}</h3>
                        <form className="dash-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Category Name *</label>
                                <input type="text" name="name" value={form.name} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows="3"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Status</label>
                                    <select name="status" value={form.status} onChange={handleChange}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
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
                                <label>Category Image</label>
                                {imagePreview && (
                                    <div className="logo-preview">
                                        <img src={imagePreview} alt="category preview" />
                                    </div>
                                )}
                                <div className="upload-area">
                                    <input type="file" accept="image/*" onChange={handleImage} id="cat-image" />
                                    <label htmlFor="cat-image" className="upload-trigger">
                                        <span className="upload-icon">🖼️</span>
                                        <span>Upload image</span>
                                    </label>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}