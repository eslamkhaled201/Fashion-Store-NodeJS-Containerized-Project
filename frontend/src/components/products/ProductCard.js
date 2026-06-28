import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const hasDiscount = product.compare_price && parseFloat(product.compare_price) > parseFloat(product.price);
  const discount = hasDiscount ? Math.round((1 - product.price / product.compare_price) * 100) : 0;

  return (
    <article className="product-card">
      <Link to={`/products/${product.slug}`} className="product-image-wrap">
        <img src={product.primary_image || `https://picsum.photos/seed/${product.id}/400/500`} alt={product.name} className="product-img" loading="lazy" />
        {hasDiscount && <span className="product-badge">-{discount}%</span>}
        {product.is_featured && !hasDiscount && <span className="product-badge featured">New</span>}
        <div className="product-overlay">
          <button className="btn btn-primary quick-add" onClick={(e) => { e.preventDefault(); addItem(product.id, null, 1); }}>
            Quick Add
          </button>
        </div>
      </Link>
      <div className="product-info">
        <Link to={`/products/${product.slug}`}>
          <p className="product-brand">{product.brand}</p>
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <div className="product-price-row">
          <span className="product-price">${parseFloat(product.price).toFixed(2)}</span>
          {hasDiscount && <span className="product-compare">${parseFloat(product.compare_price).toFixed(2)}</span>}
        </div>
        {product.avg_rating > 0 && (
          <div className="product-rating">
            {'★'.repeat(Math.round(product.avg_rating))}{'☆'.repeat(5 - Math.round(product.avg_rating))}
            <span>({product.review_count})</span>
          </div>
        )}
      </div>
    </article>
  );
}
