import { useState, useEffect } from 'react';
import { sellerService } from '../../services';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';
import '../Dashboard.css';

const statusClass = (s) => `status-${(s || 'pending').toLowerCase().replace(/\s+/g, '-')}`;

const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

export default function AdminSellerRequests() {
    const toast = useToast();
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('pending');
    const [rejecting, setRejecting] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const load = async () => {
        try {
            const res = await sellerService.getAllAdmin();
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

    const handleApprove = async (id) => {
        try {
            await sellerService.updateApproval(id, { approvalStatus: 'approved' });
            toast.success('Seller approved');
            await load();
        } catch (err) {
            toast.error(err.message || 'Failed to approve seller');
        }
    };

    const handleReject = async (id) => {
        try {
            await sellerService.updateApproval(id, {
                approvalStatus: 'rejected',
                rejectionReason: rejectReason || 'Your application was not approved.',
            });
            toast.success('Seller rejected');
            setRejecting(null);
            setRejectReason('');
            await load();
        } catch (err) {
            toast.error(err.message || 'Failed to reject seller');
        }
    };

    const filtered = sellers.filter((s) => s.approvalStatus === tab);

    if (loading) {
        return (
            <div className="dash-page">
                <div className="dash-card">
                    <p>Loading seller requests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h1>Seller Requests</h1>
                    <p>Review and approve new seller applications</p>
                </div>
            </div>

            <div className="dash-toolbar">
                <button
                    className={`btn btn-sm ${tab === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setTab('pending')}
                >
                    Pending ({sellers.filter((s) => s.approvalStatus === 'pending').length})
                </button>
                <button
                    className={`btn btn-sm ${tab === 'approved' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setTab('approved')}
                >
                    Approved ({sellers.filter((s) => s.approvalStatus === 'approved').length})
                </button>
                <button
                    className={`btn btn-sm ${tab === 'rejected' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setTab('rejected')}
                >
                    Rejected ({sellers.filter((s) => s.approvalStatus === 'rejected').length})
                </button>
            </div>

            {filtered.length === 0 ? (
                <div className="dash-card">
                    <EmptyState
                        icon="📨"
                        title={`No ${tab} requests`}
                        message={`There are no ${tab} seller requests.`}
                    />
                </div>
            ) : (
                <div className="dash-card">
                    <div className="request-list">
                        {filtered.map((s) => (
                            <div className="request-card" key={s._id}>
                                <div className="request-header">
                                    <div className="request-store">
                                        {s.storeLogo ? (
                                            <img src={s.storeLogo} alt={s.storeName} className="request-logo" />
                                        ) : (
                                            <div className="request-logo request-logo-placeholder">🏪</div>
                                        )}
                                        <div>
                                            <h4>{s.storeName}</h4>
                                            <span className={`status-badge ${statusClass(s.approvalStatus)}`}>
                                                {s.approvalStatus}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="request-date">{formatDate(s.createdAt)}</span>
                                </div>

                                <div className="request-details">
                                    <div className="request-row">
                                        <span>Owner:</span>
                                        <strong>{s.userId?.name || '—'}</strong>
                                    </div>
                                    <div className="request-row">
                                        <span>Email:</span>
                                        <strong>{s.userId?.email || '—'}</strong>
                                    </div>
                                    <div className="request-row">
                                        <span>Phone:</span>
                                        <strong>{s.userId?.phone || '—'}</strong>
                                    </div>
                                    <div className="request-row">
                                        <span>Business Type:</span>
                                        <strong>{s.businessType}</strong>
                                    </div>
                                    <div className="request-row">
                                        <span>Store Address:</span>
                                        <strong>{s.storeAddress || '—'}</strong>
                                    </div>
                                    <div className="request-row">
                                        <span>Contact Number:</span>
                                        <strong>{s.storeContactNumber || '—'}</strong>
                                    </div>
                                </div>

                                {s.storeDescription && (
                                    <p className="request-description">{s.storeDescription}</p>
                                )}

                                {s.approvalStatus === 'rejected' && s.rejectionReason && (
                                    <p className="request-rejection">Rejection reason: {s.rejectionReason}</p>
                                )}

                                {s.approvalStatus === 'pending' && (
                                    <div className="request-actions">
                                        {rejecting === s._id ? (
                                            <div className="reject-form">
                                                <textarea
                                                    value={rejectReason}
                                                    onChange={(e) => setRejectReason(e.target.value)}
                                                    placeholder="Reason for rejection (optional)"
                                                    rows="2"
                                                />
                                                <div className="reject-form-actions">
                                                    <button
                                                        className="btn btn-xs btn-outline"
                                                        onClick={() => {
                                                            setRejecting(null);
                                                            setRejectReason('');
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        className="btn btn-xs btn-danger"
                                                        onClick={() => handleReject(s._id)}
                                                    >
                                                        Confirm Reject
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    className="btn btn-xs btn-primary"
                                                    onClick={() => handleApprove(s._id)}
                                                >
                                                    ✅ Approve
                                                </button>
                                                <button
                                                    className="btn btn-xs btn-danger"
                                                    onClick={() => setRejecting(s._id)}
                                                >
                                                    ❌ Reject
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}