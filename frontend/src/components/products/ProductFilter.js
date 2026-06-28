import React, { useState, useEffect } from 'react';
import { getCategories } from '../../api/products';
import './ProductFilter.css';

export default function ProductFilter({ filters, onChange }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => { getCategories().then(r => setCategories(r.data)); }, []);

  const update = (key, val) => onChange({ ...filters, [key]: val, page: 1 });

  return (
    <aside className="product-filter">
      <div className="filter-section">
        <h4>Categories</h4>
        <label className={!filters.category ? 'active' : ''} onClick={() => update('category', '')}>All</label>
        {categories.map(c => (
          <label key={c.id} className={filters.category === c.slug ? 'active' : ''} onClick={() => update('category', c.slug)}>{c.name}</label>
        ))}
      </div>
      <div className="filter-section">
        <h4>Price Range</h4>
        <div className="price-inputs">
          <input type="number" placeholder="Min" value={filters.minPrice || ''} onChange={e => update('minPrice', e.target.value)} />
          <span>–</span>
          <input type="number" placeholder="Max" value={filters.maxPrice || ''} onChange={e => update('maxPrice', e.target.value)} />
        </div>
      </div>
      <div className="filter-section">
        <h4>Sort By</h4>
        {[['newest','Newest'],['price_asc','Price: Low–High'],['price_desc','Price: High–Low'],['name','Name A–Z']].map(([val, label]) => (
          <label key={val} className={filters.sort === val ? 'active' : ''} onClick={() => update('sort', val)}>{label}</label>
        ))}
      </div>
      <button className="btn btn-outline filter-reset" onClick={() => onChange({ page: 1, sort: 'newest' })}>Reset Filters</button>
    </aside>
  );
}
