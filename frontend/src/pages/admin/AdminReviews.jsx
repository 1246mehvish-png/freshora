import { useState, useEffect } from 'react';
import { reviewService } from '../../services';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';
import '../Dashboard.css';

const REVIEW_STATUSES = ['active', 'hidden', 'removed'];

const statusClass = (s) => `status-${(s || 'active').toLowerCase().replace(/\s+/g, '-')}`;

const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

export default function AdminReviews() {
    const toast = useToast();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [updating, setUpdating] = useState(null);

    const load = async () => {
        try {
            const res = await reviewService.getAll();
            setReviews(res.data.reviews || []);
        } catch (err) {
            toast.error(err.message || 'Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleModerate = async (id, status) => {
        setUpdating(id);
        try {
            await reviewService.moderate(id, status);
            toast.success(`Review marked as ${status}`);
            await load();
        } catch (err) {
            toast.error(err.message || 'Failed to update review');
        } finally {
            setUpdating(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this review? This cannot be undone.')) return;
        try {
            await reviewService.delete(id);
            toast.success('Review deleted');
            await load();
        } catch (err) {
            toast.error(err.message || 'Failed to delete review');
        }
    };

    const filtered = reviews.filter((r) => {
        const q = search.toLowerCase();
        const matchesSearch =
            !search ||
            r.buyerId?.name?.toLowerCase().includes(q) ||
            r.buyerId?.email?.toLowerCase().includes(q) ||
            r.productId?.productName?.toLowerCase().includes(q) ||
            r.sellerId?.storeName?.toLowerCase().includes(q) ||
            r.comment?.toLowerCase().includes(q);
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="dash-page">
                <div className="dash-card">
                    <p>Loading reviews...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h1>Manage Reviews</h1>
                    <p>Moderate product and seller reviews across the marketplace</p>
                </div>
            </div>

            <div className="dash-toolbar">
                <input
                    type="text"
                    placeholder="Search by buyer, product, seller, or comment..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">All Statuses</option>
                    {REVIEW_STATUSES.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>
            </div>

            {filtered.length === 0 ? (
                <div className="dash-card">
                    <EmptyState icon="⭐" title="No reviews found" message="No reviews match your filters." />
                </div>
            ) : (
                <div className="dash-table-wrap">
                    <table className="dash-table">
                        <thead>
                            <tr>
                                <th>Buyer</th>
                                <th>Product</th>
                                <th>Seller</th>
                                <th>Rating</th>
                                <th>Comment</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((r) => (
                                <tr key={r._id}>
                                    <td>
                                        <strong>{r.buyerId?.name || '—'}</strong>
                                        <div className="dash-muted">{r.buyerId?.email}</div>
                                    </td>
                                    <td>{r.productId?.productName || '—'}</td>
                                    <td>{r.sellerId?.storeName || '—'}</td>
                                    <td>{'⭐'.repeat(Math.round(r.rating || 0))} {r.rating}</td>
                                    <td className="table-desc">{r.comment || '—'}</td>
                                    <td>{formatDate(r.createdAt)}</td>
                                    <td>
                                        <span className={`status-badge ${statusClass(r.status)}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <select
                                                className="status-select"
                                                value={r.status}
                                                disabled={updating === r._id}
                                                onChange={(e) => handleModerate(r._id, e.target.value)}
                                            >
                                                {REVIEW_STATUSES.map((s) => (
                                                    <option key={s} value={s}>
                                                        {s}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                className="btn btn-xs btn-danger"
                                                onClick={() => handleDelete(r._id)}
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
