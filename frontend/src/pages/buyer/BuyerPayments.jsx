import { useEffect, useState } from 'react';
import { paymentService } from '../../services';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import '../Dashboard.css';

const statusClass = (s) => `status-${(s || 'pending').toLowerCase()}`;

export default function BuyerPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await paymentService.getMine();
                setPayments(res.data.payments || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <Spinner text="Loading payment history..." />;

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h2>Payment History</h2>
                    <p>View all your payment records and their status.</p>
                </div>
            </div>

            {payments.length === 0 ? (
                <EmptyState
                    icon="💳"
                    title="No payments yet"
                    message="Your payment history will appear here after you place orders."
                />
            ) : (
                <div className="dash-table-wrap">
                    <table className="dash-table">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Date</th>
                                <th>Method</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((p) => (
                                <tr key={p._id}>
                                    <td><strong>{p.order?.orderNumber || '—'}</strong></td>
                                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                                    <td>{p.method}</td>
                                    <td>Rs {p.amount}</td>
                                    <td>
                                        <span className={`status-badge ${statusClass(p.status)}`}>{p.status}</span>
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