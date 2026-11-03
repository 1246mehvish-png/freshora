import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellerService, uploadService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import '../Dashboard.css';

const BUSINESS_TYPES = [
    'Fruit Seller',
    'Vegetable Seller',
    'Fruits and Vegetables Seller',
    'Organic Farm',
    'Grocery Store',
];

export default function SellerStoreProfile() {
    const navigate = useNavigate();
    const { seller, updateSeller } = useAuth();
    const toast = useToast();

    const [form, setForm] = useState({
        storeName: '',
        businessType: '',
        storeDescription: '',
        storeAddress: '',
        storeContactNumber: '',
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState('');
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (seller) {
            setForm({
                storeName: seller.storeName || '',
                businessType: seller.businessType || '',
                storeDescription: seller.storeDescription || '',
                storeAddress: seller.storeAddress || '',
                storeContactNumber: seller.storeContactNumber || '',
            });
            setLogoPreview(seller.storeLogo || '');
            setBannerPreview(seller.storeBanner || '');
        }
    }, [seller]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleLogo = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
    };

    const handleBanner = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
    };

    const validate = () => {
        const errs = {};
        if (!form.storeName.trim()) errs.storeName = 'Store name is required';
        if (!form.businessType) errs.businessType = 'Select a business type';
        if (!form.storeContactNumber.trim()) errs.storeContactNumber = 'Contact number is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSaving(true);
        try {
            let storeLogo = seller?.storeLogo || '';
            let storeBanner = seller?.storeBanner || '';

            if (logoFile) {
                const up = await uploadService.single(logoFile);
                storeLogo = up.data.url;
            }
            if (bannerFile) {
                const up = await uploadService.single(bannerFile);
                storeBanner = up.data.url;
            }

            const res = await sellerService.updateMine({
                ...form,
                storeLogo,
                storeBanner,
            });
            updateSeller(res.data.seller);
            toast.success('Store profile updated');
            navigate('/seller');
        } catch (err) {
            toast.error(err.message || 'Failed to update store profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h1>Store Profile</h1>
                    <p>Manage your store's public information</p>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => navigate('/seller')}>
                    ← Back
                </button>
            </div>

            {seller && seller.approvalStatus !== 'approved' && (
                <div className="dash-card approval-warning">
                    <strong>⚠️ Store Approval Status:</strong>{' '}
                    <span className={`status-badge status-${seller.approvalStatus}`}>
                        {seller.approvalStatus}
                    </span>
                    {seller.rejectionReason && (
                        <p className="rejection-reason">Reason: {seller.rejectionReason}</p>
                    )}
                </div>
            )}

            <form className="dash-card dash-form" onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label>Store Name *</label>
                        <input
                            type="text"
                            name="storeName"
                            value={form.storeName}
                            onChange={handleChange}
                            placeholder="e.g. Fresh Farm Market"
                        />
                        {errors.storeName && <span className="form-error">{errors.storeName}</span>}
                    </div>
                    <div className="form-group">
                        <label>Business Type *</label>
                        <select name="businessType" value={form.businessType} onChange={handleChange}>
                            <option value="">Select business type</option>
                            {BUSINESS_TYPES.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                        {errors.businessType && <span className="form-error">{errors.businessType}</span>}
                    </div>
                </div>

                <div className="form-group">
                    <label>Store Description</label>
                    <textarea
                        name="storeDescription"
                        value={form.storeDescription}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Tell buyers about your store, products, and quality..."
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Store Address</label>
                        <input
                            type="text"
                            name="storeAddress"
                            value={form.storeAddress}
                            onChange={handleChange}
                            placeholder="e.g. Main Bazaar, Lahore"
                        />
                    </div>
                    <div className="form-group">
                        <label>Contact Number *</label>
                        <input
                            type="text"
                            name="storeContactNumber"
                            value={form.storeContactNumber}
                            onChange={handleChange}
                            placeholder="e.g. 0300-1234567"
                        />
                        {errors.storeContactNumber && (
                            <span className="form-error">{errors.storeContactNumber}</span>
                        )}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Store Logo</label>
                        {logoPreview && (
                            <div className="logo-preview">
                                <img src={logoPreview} alt="logo preview" />
                            </div>
                        )}
                        <div className="upload-area">
                            <input type="file" accept="image/*" onChange={handleLogo} id="store-logo" />
                            <label htmlFor="store-logo" className="upload-trigger">
                                <span className="upload-icon">🏷️</span>
                                <span>Upload logo</span>
                            </label>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Store Banner</label>
                        {bannerPreview && (
                            <div className="banner-preview">
                                <img src={bannerPreview} alt="banner preview" />
                            </div>
                        )}
                        <div className="upload-area">
                            <input type="file" accept="image/*" onChange={handleBanner} id="store-banner" />
                            <label htmlFor="store-banner" className="upload-trigger">
                                <span className="upload-icon">🖼️</span>
                                <span>Upload banner</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn btn-outline" onClick={() => navigate('/seller')}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Store Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
}