import { useState, useEffect } from 'react';
import { paymentService } from '../../services';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';
import '../Dashboard.css';

const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Refunded'];

const statusClass = (s) => `status-${(s || 'pending').toLowerCase().replace(/\s+/g, '-')}`;

const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

export default function AdminPayments() {
    const toast = useToast();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [verifying, setVerifying] = useState(null);

    const load = async () => {
        try {
            const params = { page, limit: 15 };
            if (statusFilter !== 'all') params.status = statusFilter;
            const res = await paymentService.getAll(params);
            setPayments(res.data.payments || []);
            setTotalPages(res.data.pages || 1);
        } catch (err) {
            toast.error(err.message || 'Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, statusFilter]);

    const handleVerify = async (id, status) => {
        setVerifying(id);
        try {
            await paymentService.verify(id, { status });
            toast.success(`Payment marked as ${status}`);
            await load();
        } catch (err) {
            toast.error(err.message || 'Failed to update payment');
        } finally {
            setVerifying(null);
        }
    };

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h1>Manage Payments</h1>
                    <p>Review and verify all marketplace payments</p>
                </div>
            </div>

            <div className="dash-toolbar">
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                    <option value="all">All Statuses</option>
                    {PAYMENT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="dash-card">
                    <p>Loading payments...</p>
                </div>
            ) : payments.length === 0 ? (
                <div className="dash-card">
                    <EmptyState icon="💳" title="No payments found" message="No payments match your filters." />
                </div>
            ) : (
                <>
                    <div className="dash-table-wrap">
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Date</th>
                                    <th>Buyer</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Reference</th>
                                    <th>Status</th>
                                    <th>Update</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((p) => (
                                    <tr key={p._id}>
                                        <td>
                                            <strong>{p.order?.orderNumber || '—'}</strong>
                                        </td>
                                        <td>{formatDate(p.createdAt)}</td>
                                        <td>
                                            {p.buyerId?.name || '—'}
                                            <div className="dash-muted">{p.buyerId?.email}</div>
                                        </td>
                                        <td>Rs {Number(p.amount || 0).toLocaleString()}</td>
                                        <td>{p.method}</td>
                                        <td>{p.reference || '—'}</td>
                                        <td>
                                            <span className={`status-badge ${statusClass(p.status)}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td>
                                            <select
                                                className="status-select"
                                                value={p.status}
                                                disabled={verifying === p._id}
                                                onChange={(e) => handleVerify(p._id, e.target.value)}
                                            >
                                                {PAYMENT_STATUSES.map((s) => (
                                                    <option key={s} value={s}>
                                                        {s}
                                                    </option>
                                                ))}
                                            </select>
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
        </div>
    );
}
