import { useState, useEffect } from 'react';
import { sellerService } from '../../services';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';
import '../Dashboard.css';

const statusClass = (s) => `status-${(s || 'pending').toLowerCase().replace(/\s+/g, '-')}`;

const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

export default function AdminSellers() {
    const toast = useToast();
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const load = async () => {
        try {
            const res = await sellerService.getAll();
            setSellers(res.data.sellers || []);
        } catch (err) {
            toast.error(err.message || 'Failed to load sellers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleApproval = async (id, approvalStatus) => {
        try {
            await sellerService.updateApproval(id, { approvalStatus });
            toast.success(`Seller ${approvalStatus}`);
            await load();
        } catch (err) {
            toast.error(err.message || 'Failed to update seller');
        }
    };

    const handleFeatured = async (id) => {
        try {
            await sellerService.toggleFeatured(id);
            toast.success('Featured status updated');
            await load();
        } catch (err) {
            toast.error(err.message || 'Failed to update featured status');
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete seller "${name}"? This cannot be undone.`)) return;
        try {
            await sellerService.delete(id);
            toast.success('Seller deleted');
            await load();
        } catch (err) {
            toast.error(err.message || 'Failed to delete seller');
        }
    };

    const filtered = sellers.filter(
        (s) =>
            !search ||
            s.storeName?.toLowerCase().includes(search.toLowerCase()) ||
            s.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
            s.userId?.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="dash-page">
                <div className="dash-card">
                    <p>Loading sellers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h1>Manage Sellers</h1>
                    <p>View and manage all registered sellers</p>
                </div>
            </div>

            <div className="dash-toolbar">
                <input
                    type="text"
                    placeholder="Search by store name, owner, or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {filtered.length === 0 ? (
                <div className="dash-card">
                    <EmptyState icon="🏪" title="No sellers found" message="No sellers match your search." />
                </div>
            ) : (
                <div className="dash-table-wrap">
                    <table className="dash-table">
                        <thead>
                            <tr>
                                <th>Store</th>
                                <th>Owner</th>
                                <th>Type</th>
                                <th>Rating</th>
                                <th>Joined</th>
                                <th>Approval</th>
                                <th>Featured</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((s) => (
                                <tr key={s._id}>
                                    <td>
                                        <strong>{s.storeName}</strong>
                                    </td>
                                    <td>
                                        {s.userId?.name || '—'}
                                        <div className="dash-muted">{s.userId?.email}</div>
                                    </td>
                                    <td>{s.businessType}</td>
                                    <td>⭐ {s.rating || 0}</td>
                                    <td>{formatDate(s.createdAt)}</td>
                                    <td>
                                        <span className={`status-badge ${statusClass(s.approvalStatus)}`}>
                                            {s.approvalStatus}
                                        </span>
                                    </td>
                                    <td>{s.isFeatured ? '✅' : '—'}</td>
                                    <td>
                                        <div className="table-actions">
                                            {s.approvalStatus !== 'approved' && (
                                                <button
                                                    className="btn btn-xs btn-primary"
                                                    onClick={() => handleApproval(s._id, 'approved')}
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {s.approvalStatus !== 'rejected' && (
                                                <button
                                                    className="btn btn-xs btn-outline"
                                                    onClick={() => handleApproval(s._id, 'rejected')}
                                                >
                                                    Reject
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-xs btn-outline"
                                                onClick={() => handleFeatured(s._id)}
                                            >
                                                {s.isFeatured ? 'Unfeature' : 'Feature'}
                                            </button>
                                            <button
                                                className="btn btn-xs btn-danger"
                                                onClick={() => handleDelete(s._id, s.storeName)}
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
        </div>
    );
}