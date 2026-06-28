import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">MAISON</div>
          <p>Thoughtful fashion for considered living.</p>
        </div>
        <div className="footer-links">
          <div>
            <h4>Shop</h4>
            <Link to="/products?category=women">Women</Link>
            <Link to="/products?category=men">Men</Link>
            <Link to="/products?category=new-arrivals">New In</Link>
            <Link to="/products?category=accessories">Accessories</Link>
          </div>
          <div>
            <h4>Help</h4>
            <Link to="/shipping">Shipping</Link>
            <Link to="/returns">Returns</Link>
            <Link to="/size-guide">Size Guide</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom container">
        <p>© {new Date().getFullYear()} Maison. All rights reserved.</p>
      </div>
    </footer>
  );
}
