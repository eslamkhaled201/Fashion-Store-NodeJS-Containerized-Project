import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeatured, getCategories } from '../../api/products';
import ProductCard from '../../components/products/ProductCard';
import './HomePage.css';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getFeatured().then(r => setFeatured(r.data));
    getCategories().then(r => setCategories(r.data.slice(0, 4)));
  }, []);

  return (
    <main className="home">
      <section className="hero">
        <div className="hero-content">
          <p className="hero-eyebrow">New Season Collection</p>
          <h1 className="hero-title">Dress with<br /><em>intention</em></h1>
          <p className="hero-sub">Thoughtfully crafted pieces for every moment.</p>
          <div className="hero-ctas">
            <Link to="/products?category=women" className="btn btn-primary">Shop Women</Link>
            <Link to="/products?category=men" className="btn btn-outline">Shop Men</Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="https://picsum.photos/seed/hero/800/1000" alt="Fashion campaign" />
        </div>
      </section>

      <section className="categories-strip container">
        <h2 className="section-title">Shop by Category</h2>
        <div className="categories-grid">
          {categories.map(cat => (
            <Link key={cat.id} to={`/products?category=${cat.slug}`} className="cat-card">
              <img src={`https://picsum.photos/seed/${cat.slug}/400/500`} alt={cat.name} />
              <div className="cat-label">{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="featured-section container">
          <div className="section-header">
            <h2 className="section-title">Featured Pieces</h2>
            <Link to="/products?featured=true" className="view-all">View All →</Link>
          </div>
          <div className="grid-4">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <section className="banner container">
        <div className="banner-inner">
          <p className="banner-eyebrow">Free shipping</p>
          <h3>On orders over $150</h3>
          <Link to="/products" className="btn btn-accent">Explore Collection</Link>
        </div>
      </section>
    </main>
  );
}
