import { useState, useEffect } from 'react';
import { productService, categoryService, sellerService, uploadService } from '../../services';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';
import '../Dashboard.css';

const statusClass = (s) => `status-${(s || 'active').toLowerCase().replace(/\s+/g, '-')}`;

const UNITS = ['500 grams', '1 kilogram', '2 kilograms', '5 kilograms', 'Dozen', 'Piece'];
const AVAILABILITY = ['in-stock', 'out-of-stock', 'limited'];

const emptyForm = {
    sellerId: '',
    productName: '',
    category: '',
    description: '',
    price: '',
    unit: '1 kilogram',
    stock: '',
    freshnessInformation: '',
    organic: false,
    discount: 0,
    availability: 'in-stock',
    status: 'active',
    isFeatured: false,
    isTrending: false,
    isBestSelling: false,
    isSeasonal: false,
};

export default function AdminProducts() {
    const toast = useToast();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Add product modal
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const load = async () => {
        try {
            const params = { page, limit: 15 };
            if (search) params.search = search;
            if (categoryFilter !== 'all') params.category = categoryFilter;
            if (statusFilter !== 'all') params.status = statusFilter;
            const res = await productService.getAll(params);
            setProducts(res.data.products || []);
            setTotalPages(res.data.pages || 1);
        } catch (err) {
            toast.error(err.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadCats = async () => {
            try {
                const res = await categoryService.getAll();
                setCategories(res.data.categories || []);
            } catch (err) {
                // ignore
            }
        };
        loadCats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, categoryFilter, statusFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        load();
    };

    const handleStatus = async (id, status) => {
        try {
            await productService.update(id, { status });
            toast.success('Product status updated');
            await load();
        } catch (err) {
            toast.error(err.message || 'Failed to update product');
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete product "${name}"? This cannot be undone.`)) return;
        try {
            await productService.delete(id);
            toast.success('Product deleted');
            await load();
        } catch (err) {
            toast.error(err.message || 'Failed to delete product');
        }
    };

    // ---------- Add product ----------
    const openAdd = async () => {
        setForm(emptyForm);
        setImageFiles([]);
        setImagePreviews([]);
        setErrors({});
        setShowAdd(true);
        if (sellers.length === 0) {
            try {
                const res = await sellerService.getAll();
                setSellers(res.data.sellers || []);
            } catch (err) {
                toast.error(err.message || 'Failed to load sellers');
            }
        }
    };

    const closeAdd = () => {
        if (uploading || saving) return;
        setShowAdd(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleFiles = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setImageFiles((prev) => [...prev, ...files]);
        setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    };

    const removeImage = (idx) => {
        setImageFiles((prev) => prev.filter((_, i) => i !== idx));
        setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    };

    const validate = () => {
        const errs = {};
        if (!form.sellerId) errs.sellerId = 'Please select a seller';
        if (!form.productName.trim()) errs.productName = 'Product name is required';
        if (!form.category) errs.category = 'Please select a category';
        if (!form.description.trim()) errs.description = 'Description is required';
        if (!form.price || Number(form.price) <= 0) errs.price = 'Enter a valid price';
        if (form.stock === '' || Number(form.stock) < 0) errs.stock = 'Enter a valid stock';
        if (Number(form.discount) < 0 || Number(form.discount) > 100) errs.discount = 'Discount must be 0-100';
        if (!imageFiles.length) errs.images = 'Please upload at least one product image';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setUploading(true);
        try {
            let images = [];
            if (imageFiles.length) {
                const up = await uploadService.multiple(imageFiles);
                images = (up.data.images || []).map((img) => img.url);
            }

            setUploading(false);
            setSaving(true);

            const payload = {
                ...form,
                price: Number(form.price),
                stock: Number(form.stock),
                discount: Number(form.discount) || 0,
                images,
            };

            await productService.createAsAdmin(payload);
            toast.success('Product added successfully');
            setShowAdd(false);
            setPage(1);
            await load();
        } catch (err) {
            toast.error(err.message || 'Failed to add product');
        } finally {
            setUploading(false);
            setSaving(false);
        }
    };

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h1>Manage Products</h1>
                    <p>View and manage all products in the marketplace</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}>
                    + Add Product
                </button>
            </div>

            <form className="dash-toolbar" onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                            {c.name}
                        </option>
                    ))}
                </select>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blocked">Blocked</option>
                </select>
                <button type="submit" className="btn btn-primary btn-sm">
                    Search
                </button>
            </form>

            {loading ? (
                <div className="dash-card">
                    <p>Loading products...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="dash-card">
                    <EmptyState icon="🥬" title="No products found" message="No products match your filters." />
                </div>
            ) : (
                <>
                    <div className="dash-table-wrap">
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Seller</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p) => (
                                    <tr key={p._id}>
                                        <td>
                                            <div className="table-product">
                                                {p.images?.[0] ? (
                                                    <img src={p.images[0]} alt={p.productName} className="table-img" />
                                                ) : (
                                                    <div className="table-img">🥬</div>
                                                )}
                                                <div>
                                                    <strong>{p.productName}</strong>
                                                    <div className="dash-muted">{p.unit}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{p.category?.name || '—'}</td>
                                        <td>
                                            Rs {Number(p.finalPrice || p.price || 0).toLocaleString()}
                                            {p.discount > 0 && (
                                                <span className="dash-muted old-price">
                                                    Rs {Number(p.price).toLocaleString()}
                                                </span>
                                            )}
                                        </td>
                                        <td>{p.stock}</td>
                                        <td>{p.sellerId?.storeName || '—'}</td>
                                        <td>
                                            <span className={`status-badge ${statusClass(p.status)}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <select
                                                    className="status-select"
                                                    value={p.status}
                                                    onChange={(e) => handleStatus(p._id, e.target.value)}
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                    <option value="blocked">Blocked</option>
                                                </select>
                                                <button
                                                    className="btn btn-xs btn-danger"
                                                    onClick={() => handleDelete(p._id, p.productName)}
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

                    {totalPages > 1 && (
                        <div className="dash-pagination">
                            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                                Previous
                            </button>
                            <span>
                                Page {page} of {totalPages}
                            </span>
                            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {showAdd && (
                <div className="modal-overlay" onClick={closeAdd}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <h3>Add New Product</h3>

                        <form className="dash-form" onSubmit={handleAddSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Seller *</label>
                                    <select name="sellerId" value={form.sellerId} onChange={handleChange}>
                                        <option value="">Select seller</option>
                                        {sellers.map((s) => (
                                            <option key={s._id} value={s._id}>
                                                {s.storeName}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.sellerId && <span className="form-error">{errors.sellerId}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Category *</label>
                                    <select name="category" value={form.category} onChange={handleChange}>
                                        <option value="">Select category</option>
                                        {categories.map((c) => (
                                            <option key={c._id} value={c._id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category && <span className="form-error">{errors.category}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Product Name *</label>
                                <input
                                    type="text"
                                    name="productName"
                                    value={form.productName}
                                    onChange={handleChange}
                                    placeholder="e.g. Fresh Red Apples"
                                />
                                {errors.productName && <span className="form-error">{errors.productName}</span>}
                            </div>

                            <div className="form-group">
                                <label>Description *</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Describe the product, quality, origin, etc."
                                />
                                {errors.description && <span className="form-error">{errors.description}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price (Rs) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={form.price}
                                        onChange={handleChange}
                                        placeholder="e.g. 250"
                                        min="0"
                                    />
                                    {errors.price && <span className="form-error">{errors.price}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Unit *</label>
                                    <select name="unit" value={form.unit} onChange={handleChange}>
                                        {UNITS.map((u) => (
                                            <option key={u} value={u}>
                                                {u}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Stock *</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={form.stock}
                                        onChange={handleChange}
                                        placeholder="e.g. 50"
                                        min="0"
                                    />
                                    {errors.stock && <span className="form-error">{errors.stock}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Discount (%)</label>
                                    <input
                                        type="number"
                                        name="discount"
                                        value={form.discount}
                                        onChange={handleChange}
                                        placeholder="e.g. 10"
                                        min="0"
                                        max="100"
                                    />
                                    {errors.discount && <span className="form-error">{errors.discount}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Availability</label>
                                    <select name="availability" value={form.availability} onChange={handleChange}>
                                        {AVAILABILITY.map((a) => (
                                            <option key={a} value={a}>
                                                {a.replace('-', ' ')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select name="status" value={form.status} onChange={handleChange}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="blocked">Blocked</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Freshness Information</label>
                                <input
                                    type="text"
                                    name="freshnessInformation"
                                    value={form.freshnessInformation}
                                    onChange={handleChange}
                                    placeholder="e.g. Harvested today"
                                />
                            </div>

                            <div className="form-group form-check">
                                <label className="check-label">
                                    <input
                                        type="checkbox"
                                        name="organic"
                                        checked={form.organic}
                                        onChange={handleChange}
                                    />
                                    <span>This is an organic product</span>
                                </label>
                            </div>

                            <div className="form-group">
                                <label>Product Images *</label>
                                <div className="upload-area">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFiles}
                                        id="admin-product-images"
                                    />
                                    <label htmlFor="admin-product-images" className="upload-trigger">
                                        <span className="upload-icon">📷</span>
                                        <span>Click to upload images</span>
                                        <span className="upload-hint">You can select multiple images</span>
                                    </label>
                                </div>
                                {errors.images && <span className="form-error">{errors.images}</span>}
                                {imagePreviews.length > 0 && (
                                    <div className="image-preview-grid">
                                        {imagePreviews.map((src, i) => (
                                            <div className="image-preview" key={i}>
                                                <img src={src} alt={`preview ${i + 1}`} />
                                                <button
                                                    type="button"
                                                    className="image-remove"
                                                    onClick={() => removeImage(i)}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={closeAdd}
                                    disabled={uploading || saving}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={uploading || saving}>
                                    {uploading ? 'Uploading images...' : saving ? 'Saving...' : 'Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
