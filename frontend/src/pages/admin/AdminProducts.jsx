import { useState, useEffect } from 'react';
import { productService, categoryService } from '../../services';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';
import '../Dashboard.css';

const statusClass = (s) => `status-${(s || 'active').toLowerCase().replace(/\s+/g, '-')}`;

export default function AdminProducts() {
    const toast = useToast();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const load = async () => {
        try {
            const params = { page, limit: 15 };
            if (search) params.search = search;
            if (categoryFilter !== 'all') params.category = categoryFilter;
            if (statusFilter !== 'all') params.status = statusFilter;
            const res = await productService.getAll(params);
            setProducts(res.data.products || []);
            setTotalPages(res.data.pages || 1);
        } catch (err) {
            toast.error(err.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadCats = async () => {
            try {
                const res = await categoryService.getAll();
                setCategories(res.data.categories || []);
            } catch (err) {
                // ignore
            }
        };
        loadCats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, categoryFilter, statusFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        load();
    };

    const handleStatus = async (id, status) => {
        try {
            await productService.update(id, { status });
            toast.success('Product status updated');
            await load();
        } catch (err) {
            toast.error(err.message || 'Failed to update product');
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete product "${name}"? This cannot be undone.`)) return;
        try {
            await productService.delete(id);
            toast.success('Product deleted');
            await load();
        } catch (err) {
            toast.error(err.message || 'Failed to delete product');
        }
    };

    return (
        <div className="dash-page">
            <div className="dash-page-head">
                <div>
                    <h1>Manage Products</h1>
                    <p>View and manage all products in the marketplace</p>
                </div>
            </div>

            <form className="dash-toolbar" onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                            {c.name}
                        </option>
                    ))}
                </select>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blocked">Blocked</option>
                </select>
                <button type="submit" className="btn btn-primary btn-sm">
                    Search
                </button>
            </form>

            {loading ? (
                <div className="dash-card">
                    <p>Loading products...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="dash-card">
                    <EmptyState icon="🥬" title="No products found" message="No products match your filters." />
                </div>
            ) : (
                <>
                    <div className="dash-table-wrap">
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Seller</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p) => (
                                    <tr key={p._id}>
                                        <td>
                                            <div className="table-product">
                                                {p.images?.[0] ? (
                                                    <img src={p.images[0]} alt={p.productName} className="table-img" />
                                                ) : (
                                                    <div className="table-img">🥬</div>
                                                )}
                                                <div>
                                                    <strong>{p.productName}</strong>
                                                    <div className="dash-muted">{p.unit}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{p.category?.name || '—'}</td>
                                        <td>
                                            Rs {Number(p.finalPrice || p.price || 0).toLocaleString()}
                                            {p.discount > 0 && (
                                                <span className="dash-muted old-price">
                                                    Rs {Number(p.price).toLocaleString()}
                                                </span>
                                            )}
                                        </td>
                                        <td>{p.stock}</td>
                                        <td>{p.sellerId?.storeName || '—'}</td>
                                        <td>
                                            <span className={`status-badge ${statusClass(p.status)}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <select
                                                    className="status-select"
                                                    value={p.status}
                                                    onChange={(e) => handleStatus(p._id, e.target.value)}
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                    <option value="blocked">Blocked</option>
                                                </select>
                                                <button
                                                    className="btn btn-xs btn-danger"
                                                    onClick={() => handleDelete(p._id, p.productName)}
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