import { useState } from 'react';
import { userService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';
import '../Dashboard.css';

const emptyForm = {
    label: 'Home',
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Pakistan',
    isDefault: false,
};

export default function BuyerAddresses() {
    const { user, updateUser } = useAuth();
    const { success, error } = useToast();
    const [addresses, setAddresses] = useState(user?.addresses || []);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const openAdd = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEdit = (addr) => {
        setEditingId(addr._id);
        setForm({ ...addr });
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.fullName || !form.phone || !form.addressLine || !form.city || !form.province || !form.postalCode || !form.country) {
            error('Please fill in all required fields');
            return;
        }
        setSaving(true);
        try {
            const res = editingId
                ? await userService.updateAddress(editingId, form)
                : await userService.addAddress(form);
            const updated = res.data.addresses || res.data.user?.addresses || [];
            setAddresses(updated);
            if (res.data.user) updateUser(res.data.user);
            success(editingId ? 'Address updated' : 'Address added');
            setShowModal(false);
        } catch (err) {
            error(err.message || 'Failed to save address');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this address?')) return;
        try {
            const res = await userService.deleteAddress(id);
            const updated = res.data.addresses || res.data.user?.addresses || [];
            setAddresses(updated);
            if (res.data.user) updateUser(res.data.user);
            success('Address deleted');
        } catch (err) {
            error(err.message || 'Failed to delete address');
        }
    };

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h2>Saved Addresses</h2>
                    <p>Manage your delivery addresses for faster checkout.</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}>+ Add Address</button>
            </div>

            {addresses.length === 0 ? (
                <EmptyState
                    icon="📍"
                    title="No saved addresses"
                    message="Add an address to speed up your checkout process."
                    action={<button className="btn btn-primary" onClick={openAdd}>Add Address</button>}
                />
            ) : (
                <div className="address-grid">
                    {addresses.map((a) => (
                        <div key={a._id} className={`address-card ${a.isDefault ? 'default' : ''}`}>
                            <span className="addr-label">{a.label}</span>
                            {a.isDefault && <span className="addr-label addr-default-tag">Default</span>}
                            <h4>{a.fullName}</h4>
                            <p>{a.phone}</p>
                            <p>{a.addressLine}, {a.city}, {a.province} {a.postalCode}, {a.country}</p>
                            <div className="addr-actions">
                                <button className="btn btn-outline btn-xs" onClick={() => openEdit(a)}>Edit</button>
                                <button className="btn btn-danger btn-xs" onClick={() => handleDelete(a._id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <h3>{editingId ? 'Edit Address' : 'Add New Address'}</h3>
                        <form className="dash-form" onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Label</label>
                                    <input name="label" value={form.label} onChange={handleChange} placeholder="Home / Office" />
                                </div>
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input name="fullName" value={form.fullName} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Phone *</label>
                                <input name="phone" value={form.phone} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Address Line *</label>
                                <input name="addressLine" value={form.addressLine} onChange={handleChange} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>City *</label>
                                    <input name="city" value={form.city} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Province *</label>
                                    <input name="province" value={form.province} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Postal Code *</label>
                                    <input name="postalCode" value={form.postalCode} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Country *</label>
                                    <input name="country" value={form.country} onChange={handleChange} />
                                </div>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                                <input type="checkbox" name="isDefault" checked={!!form.isDefault} onChange={handleChange} style={{ width: 'auto' }} />
                                Set as default address
                            </label>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Address'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}