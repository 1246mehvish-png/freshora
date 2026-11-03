import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService, categoryService, uploadService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import '../Dashboard.css';

const UNITS = ['500 grams', '1 kilogram', '2 kilograms', '5 kilograms', 'Dozen', 'Piece'];
const AVAILABILITY = ['in-stock', 'out-of-stock', 'limited'];

export default function SellerEditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { seller } = useAuth();
    const toast = useToast();

    const [form, setForm] = useState({
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
        isFeatured: false,
        isTrending: false,
        isBestSelling: false,
        isSeasonal: false,
        status: 'active',
    });
    const [categories, setCategories] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [newImageFiles, setNewImageFiles] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const load = async () => {
            try {
                const [prodRes, catRes] = await Promise.all([
                    productService.getOne(id),
                    categoryService.getAll(),
                ]);
                const product = prodRes.data.product;
                setForm({
                    productName: product.productName || '',
                    category: product.category || '',
                    description: product.description || '',
                    price: product.price || '',
                    unit: product.unit || '1 kilogram',
                    stock: product.stock || '',
                    freshnessInformation: product.freshnessInformation || '',
                    organic: product.organic || false,
                    discount: product.discount || 0,
                    availability: product.availability || 'in-stock',
                    isFeatured: product.isFeatured || false,
                    isTrending: product.isTrending || false,
                    isBestSelling: product.isBestSelling || false,
                    isSeasonal: product.isSeasonal || false,
                    status: product.status || 'active',
                });
                setExistingImages(product.images || []);
                setCategories(catRes.data.categories || catRes.data || []);
            } catch (err) {
                toast.error(err.message || 'Failed to load product');
                navigate('/seller/products');
            } finally {
                setLoading(false);
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleFiles = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setNewImageFiles((prev) => [...prev, ...files]);
        const previews = files.map((f) => URL.createObjectURL(f));
        setNewImagePreviews((prev) => [...prev, ...previews]);
    };

    const removeNewImage = (idx) => {
        setNewImageFiles((prev) => prev.filter((_, i) => i !== idx));
        setNewImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    };

    const removeExistingImage = (idx) => {
        setExistingImages((prev) => prev.filter((_, i) => i !== idx));
    };

    const validate = () => {
        const errs = {};
        if (!form.productName.trim()) errs.productName = 'Product name is required';
        if (!form.category) errs.category = 'Please select a category';
        if (!form.description.trim()) errs.description = 'Description is required';
        if (!form.price || Number(form.price) <= 0) errs.price = 'Enter a valid price';
        if (form.stock === '' || Number(form.stock) < 0) errs.stock = 'Enter a valid stock';
        if (Number(form.discount) < 0 || Number(form.discount) > 100) errs.discount = 'Discount must be 0-100';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        if (seller && seller.approvalStatus !== 'approved') {
            toast.error('Your store is not approved yet.');
            return;
        }

        setUploading(true);
        try {
            let newImageUrls = [];
            if (newImageFiles.length) {
                const up = await uploadService.multiple(newImageFiles);
                newImageUrls = (up.data.images || []).map((img) => img.url);
            }

            setUploading(false);
            setSaving(true);

            const payload = {
                ...form,
                price: Number(form.price),
                stock: Number(form.stock),
                discount: Number(form.discount) || 0,
                organic: form.organic,
            };

            // Append new images to existing ones
            if (newImageUrls.length) {
                payload.images = [...existingImages, ...newImageUrls];
            }

            await productService.update(id, payload);
            toast.success('Product updated successfully');
            navigate('/seller/products');
        } catch (err) {
            setUploading(false);
            setSaving(false);
            toast.error(err.message || 'Failed to update product');
        }
    };

    if (loading) return <div className="dash-page"><div className="dash-card"><p>Loading...</p></div></div>;

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h1>Edit Product</h1>
                    <p>Update your product details</p>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => navigate('/seller/products')}>
                    ← Back to Products
                </button>
            </div>

            <form className="dash-card dash-form" onSubmit={handleSubmit}>
                <div className="form-row">
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
                    <label>Description *</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Describe your product, quality, origin, etc."
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
                        <label>Freshness Information</label>
                        <input
                            type="text"
                            name="freshnessInformation"
                            value={form.freshnessInformation}
                            onChange={handleChange}
                            placeholder="e.g. Harvested today"
                        />
                    </div>
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
                    <label>Product Images</label>
                    <div className="image-preview-grid">
                        {existingImages.map((img, i) => (
                            <div className="image-preview" key={`existing-${i}`}>
                                <img src={img} alt={`existing ${i + 1}`} />
                                <button
                                    type="button"
                                    className="image-remove"
                                    onClick={() => removeExistingImage(i)}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        {newImagePreviews.map((src, i) => (
                            <div className="image-preview" key={`new-${i}`}>
                                <img src={src} alt={`new ${i + 1}`} />
                                <button
                                    type="button"
                                    className="image-remove"
                                    onClick={() => removeNewImage(i)}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="upload-area">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFiles}
                            id="product-images-edit"
                        />
                        <label htmlFor="product-images-edit" className="upload-trigger">
                            <span className="upload-icon">📷</span>
                            <span>Add more images</span>
                        </label>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn btn-outline" onClick={() => navigate('/seller/products')}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={uploading || saving}>
                        {uploading ? 'Uploading...' : saving ? 'Saving...' : 'Update Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}