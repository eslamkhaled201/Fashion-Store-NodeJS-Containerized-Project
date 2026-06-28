import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../../components/products/ProductCard';
import ProductFilter from '../../components/products/ProductFilter';
import './ProductsPage.css';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    sort: 'newest', page: 1, limit: 12,
  });

  const { products, total, pages, loading } = useProducts(filters);

  const updateFilters = (f) => {
    setFilters(f);
    setSearchParams(Object.fromEntries(Object.entries(f).filter(([,v]) => v)));
  };

  return (
    <div className="products-page container">
      <div className="products-header">
        <h1>All Products</h1>
        <div className="search-bar">
          <input placeholder="Search..." value={filters.search} onChange={e => updateFilters({ ...filters, search: e.target.value, page: 1 })} />
        </div>
        <p className="products-count">{total} items</p>
      </div>
      <div className="products-layout">
        <ProductFilter filters={filters} onChange={updateFilters} />
        <div className="products-main">
          {loading ? (
            <div className="grid-4">{Array(8).fill(0).map((_, i) => <div key={i} className="skeleton-card" />)}</div>
          ) : products.length === 0 ? (
            <div className="empty-state"><p>No products found.</p></div>
          ) : (
            <>
              <div className="grid-4">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              {pages > 1 && (
                <div className="pagination">
                  {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                    <button key={p} className={`page-btn ${filters.page === p ? 'active' : ''}`} onClick={() => updateFilters({ ...filters, page: p })}>{p}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
