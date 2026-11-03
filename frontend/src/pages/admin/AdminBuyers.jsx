import { useState, useEffect } from 'react';
import { userService } from '../../services';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';
import '../Dashboard.css';

const statusClass = (s) => `status-${(s || 'active').toLowerCase().replace(/\s+/g, '-')}`;

const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

export default function AdminBuyers() {
    const toast = useToast();
    const [buyers, setBuyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const load = async () => {
        try {
            const res = await userService.getBuyers();
            setBuyers(res.data.buyers || []);
        } catch (err) {
            toast.error(err.message || 'Failed to load buyers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleStatus = async (id, status) => {
        try {
            await userService.updateStatus(id, { status });
            toast.success('Buyer status updated');
            await load();
        } catch (err) {
            toast.error(err.message || 'Failed to update status');
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete buyer "${name}"? This cannot be undone.`)) return;
        try {
            await userService.deleteUser(id);
            toast.success('Buyer deleted');
            await load();
        } catch (err) {
            toast.error(err.message || 'Failed to delete buyer');
        }
    };

    const filtered = buyers.filter((b) => {
        const matchesSearch =
            !search ||
            b.name?.toLowerCase().includes(search.toLowerCase()) ||
            b.email?.toLowerCase().includes(search.toLowerCase()) ||
            b.username?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="dash-page">
                <div className="dash-card">
                    <p>Loading buyers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h1>Manage Buyers</h1>
                    <p>View and manage all registered buyers</p>
                </div>
            </div>

            <div className="dash-toolbar">
                <input
                    type="text"
                    placeholder="Search by name, email, or username..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="deactivated">Deactivated</option>
                </select>
            </div>

            {filtered.length === 0 ? (
                <div className="dash-card">
                    <EmptyState icon="👥" title="No buyers found" message="No buyers match your search." />
                </div>
            ) : (
                <div className="dash-table-wrap">
                    <table className="dash-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>City</th>
                                <th>Joined</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((b) => (
                                <tr key={b._id}>
                                    <td>
                                        <strong>{b.name}</strong>
                                        <div className="dash-muted">@{b.username}</div>
                                    </td>
                                    <td>{b.email}</td>
                                    <td>{b.phone || '—'}</td>
                                    <td>{b.city || '—'}</td>
                                    <td>{formatDate(b.createdAt)}</td>
                                    <td>
                                        <span className={`status-badge ${statusClass(b.status)}`}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <select
                                                className="status-select"
                                                value={b.status}
                                                onChange={(e) => handleStatus(b._id, e.target.value)}
                                            >
                                                <option value="active">Active</option>
                                                <option value="suspended">Suspended</option>
                                                <option value="deactivated">Deactivated</option>
                                            </select>
                                            <button
                                                className="btn btn-xs btn-danger"
                                                onClick={() => handleDelete(b._id, b.name)}
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