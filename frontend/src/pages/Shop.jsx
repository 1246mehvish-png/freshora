import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService, categoryService } from '../services';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import './Shop.css';

export default function Shop() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);

    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        minPrice: '',
        maxPrice: '',
        organic: '',
        availability: '',
        sort: 'newest',
        page: 1,
    });

    useEffect(() => {
        categoryService.getAll().then((res) => setCategories(res.data.categories)).catch(() => { });
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const params = {};
                if (filters.search) params.search = filters.search;
                if (filters.category) params.category = filters.category;
                if (filters.minPrice) params.minPrice = filters.minPrice;
                if (filters.maxPrice) params.maxPrice = filters.maxPrice;
                if (filters.organic) params.organic = filters.organic;
                if (filters.availability) params.availability = filters.availability;
                if (filters.sort) params.sort = filters.sort;
                params.page = filters.page;
                params.limit = 12;

                const res = await productService.getAll(params);
                setProducts(res.data.products);
                setTotal(res.data.total);
                setPages(res.data.pages);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [filters]);

    const updateFilter = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
        if (key === 'search' || key === 'category') {
            const newParams = new URLSearchParams(searchParams);
            if (value) newParams.set(key, value);
            else newParams.delete(key);
            setSearchParams(newParams, { replace: true });
        }
    };

    const clearFilters = () => {
        setFilters({ search: '', category: '', minPrice: '', maxPrice: '', organic: '', availability: '', sort: 'newest', page: 1 });
        setSearchParams({}, { replace: true });
    };

    return (
        <div className="shop-page container">
            <div className="shop-header">
                <h1>Shop Fresh Products</h1>
                <p>{total} products available</p>
            </div>

            <div className="shop-layout">
                {/* Filters sidebar */}
                <aside className="shop-filters">
                    <div className="filter-group">
                        <h3>Search</h3>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search products..."
                            value={filters.search}
                            onChange={(e) => updateFilter('search', e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <h3>Category</h3>
                        <select className="form-control" value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}>
                            <option value="">All Categories</option>
                            {categories.map((c) => (
                                <option key={c._id} value={c.slug}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <h3>Price Range</h3>
                        <div className="price-range">
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Min"
                                value={filters.minPrice}
                                onChange={(e) => updateFilter('minPrice', e.target.value)}
                            />
                            <span>-</span>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Max"
                                value={filters.maxPrice}
                                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="filter-group">
                        <h3>Availability</h3>
                        <select className="form-control" value={filters.availability} onChange={(e) => updateFilter('availability', e.target.value)}>
                            <option value="">All</option>
                            <option value="in-stock">In Stock</option>
                            <option value="limited">Limited</option>
                            <option value="out-of-stock">Out of Stock</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <h3>Organic</h3>
                        <select className="form-control" value={filters.organic} onChange={(e) => updateFilter('organic', e.target.value)}>
                            <option value="">All</option>
                            <option value="true">Organic Only</option>
                        </select>
                    </div>

                    <button className="btn btn-outline btn-block btn-sm" onClick={clearFilters}>Clear Filters</button>
                </aside>

                {/* Products */}
                <div className="shop-products">
                    <div className="shop-toolbar">
                        <span>Showing {products.length} of {total}</span>
                        <select className="form-control" value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)}>
                            <option value="newest">Newest Products</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="best_selling">Best Selling</option>
                            <option value="rating">Top Rated</option>
                        </select>
                    </div>

                    {loading ? (
                        <Spinner text="Loading products..." />
                    ) : products.length ? (
                        <>
                            <div className="product-grid">
                                {products.map((p) => (
                                    <ProductCard key={p._id} product={p} />
                                ))}
                            </div>
                            {pages > 1 && (
                                <div className="pagination">
                                    <button disabled={filters.page === 1} onClick={() => updateFilter('page', filters.page - 1)}>‹ Prev</button>
                                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                                        <button key={p} className={p === filters.page ? 'active' : ''} onClick={() => updateFilter('page', p)}>
                                            {p}
                                        </button>
                                    ))}
                                    <button disabled={filters.page === pages} onClick={() => updateFilter('page', filters.page + 1)}>Next ›</button>
                                </div>
                            )}
                        </>
                    ) : (
                        <EmptyState icon="🔍" title="No products found" message="Try adjusting your filters or search." />
                    )}
                </div>
            </div>
        </div>
    );
}