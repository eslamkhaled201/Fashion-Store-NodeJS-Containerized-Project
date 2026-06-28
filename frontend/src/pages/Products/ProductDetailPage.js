import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct } from '../../api/products';
import { useCart } from '../../context/CartContext';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProduct(slug).then(r => { setProduct(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>Loading...</div>;
  if (!product) return <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>Product not found. <Link to="/products">Back to shop</Link></div>;

  const sizes = [...new Set((product.variants || []).map(v => v.size).filter(Boolean))];
  const handleAddToCart = () => addItem(product.id, selectedVariant?.id || null, quantity);
  const hasDiscount = product.compare_price && parseFloat(product.compare_price) > parseFloat(product.price);

  return (
    <div className="product-detail container">
      <div className="pd-grid">
        <div className="pd-images">
          <div className="pd-main-image">
            <img src={(product.images?.[selectedImage]?.url) || `https://picsum.photos/seed/${product.id}/700/900`} alt={product.name} />
          </div>
          {product.images?.length > 1 && (
            <div className="pd-thumbs">
              {product.images.map((img, i) => (
                <img key={i} src={img.url} alt="" className={selectedImage === i ? 'active' : ''} onClick={() => setSelectedImage(i)} />
              ))}
            </div>
          )}
        </div>
        <div className="pd-info">
          <p className="pd-brand">{product.brand}</p>
          <h1 className="pd-name">{product.name}</h1>
          <div className="pd-price-row">
            <span className="pd-price">${parseFloat(product.price).toFixed(2)}</span>
            {hasDiscount && <span className="pd-compare">${parseFloat(product.compare_price).toFixed(2)}</span>}
          </div>
          <p className="pd-desc">{product.description}</p>
          {sizes.length > 0 && (
            <div className="pd-section">
              <p className="pd-label">Size</p>
              <div className="size-grid">
                {sizes.map(s => {
                  const variant = (product.variants || []).find(v => v.size === s);
                  return (
                    <button key={s} className={`size-btn ${selectedSize === s ? 'active' : ''} ${variant?.stock === 0 ? 'out' : ''}`}
                      onClick={() => { setSelectedSize(s); setSelectedVariant(variant); }} disabled={variant?.stock === 0}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="pd-section">
            <p className="pd-label">Quantity</p>
            <div className="qty-control">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>
          <button className="btn btn-primary add-to-cart-btn" onClick={handleAddToCart}>Add to Cart</button>
          <div className="pd-meta">
            <p>✓ Free shipping on orders over $150</p>
            <p>✓ Easy returns within 30 days</p>
            <p>✓ In stock: {product.stock} left</p>
          </div>
        </div>
      </div>
    </div>
  );
}
