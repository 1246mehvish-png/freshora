import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import '../Dashboard.css';

const statusClass = (s) => `status-${(s || 'active').toLowerCase()}`;

export default function SellerProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { success, error } = useToast();

    const load = async () => {
        try {
            const res = await productService.getMine();
            setProducts(res.data.products || []);
        } catch (err) {
            error(err.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleAvailability = async (p) => {
        const next = p.availability === 'in-stock' ? 'out-of-stock' : 'in-stock';
        try {
            await productService.updateAvailability(p._id, next);
            success('Availability updated');
            await load();
        } catch (err) {
            error(err.message || 'Failed to update availability');
        }
    };

    const handleDelete = async (p) => {
        if (!window.confirm(`Delete "${p.productName}"? This cannot be undone.`)) return;
        try {
            await productService.delete(p._id);
            success('Product deleted');
            await load();
        } catch (err) {
            error(err.message || 'Failed to delete product');
        }
    };

    if (loading) return <Spinner text="Loading your products..." />;

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h2>My Products</h2>
                    <p>Manage your product listings.</p>
                </div>
                <Link to="/seller/products/add" className="btn btn-primary">+ Add Product</Link>
            </div>

            {products.length === 0 ? (
                <EmptyState
                    icon="🥬"
                    title="No products yet"
                    message="Add your first product to start selling on Freshora."
                    action={<Link to="/seller/products/add" className="btn btn-primary">Add Product</Link>}
                />
            ) : (
                <div className="dash-table-wrap">
                    <table className="dash-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p) => (
                                <tr key={p._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div className="table-img">
                                                {p.images?.[0] ? <img src={p.images[0]} alt={p.productName} /> : '🥬'}
                                            </div>
                                            <div>
                                                <strong style={{ color: 'var(--dark-green)' }}>{p.productName}</strong>
                                                <div style={{ fontSize: '0.78rem', color: '#999' }}>
                                                    {p.organic && '🌿 Organic · '}{p.unit}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{p.category?.name || '—'}</td>
                                    <td>
                                        <strong>Rs {p.finalPrice}</strong>
                                        {p.discount > 0 && (
                                            <div style={{ fontSize: '0.78rem', color: '#999', textDecoration: 'line-through' }}>
                                                Rs {p.price}
                                            </div>
                                        )}
                                    </td>
                                    <td>{p.stock}</td>
                                    <td>
                                        <span className={`status-badge ${statusClass(p.status)}`}>{p.status}</span>
                                        <div style={{ fontSize: '0.75rem', color: '#999', marginTop: 4 }}>
                                            {p.availability}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <Link to={`/seller/products/edit/${p._id}`} className="btn btn-outline btn-xs">Edit</Link>
                                            <button className="btn btn-outline btn-xs" onClick={() => toggleAvailability(p)}>
                                                {p.availability === 'in-stock' ? 'Out' : 'In'}
                                            </button>
                                            <button className="btn btn-danger btn-xs" onClick={() => handleDelete(p)}>Delete</button>
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