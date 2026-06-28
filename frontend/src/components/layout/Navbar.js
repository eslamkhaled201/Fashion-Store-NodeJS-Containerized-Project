import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="navbar">
      <div className="nav-inner container">
        <Link to="/" className="nav-logo">MAISON</Link>
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/products" onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link to="/products?category=women" onClick={() => setMenuOpen(false)}>Women</Link>
          <Link to="/products?category=men" onClick={() => setMenuOpen(false)}>Men</Link>
          <Link to="/products?category=new-arrivals" onClick={() => setMenuOpen(false)}>New In</Link>
        </div>
        <div className="nav-actions">
          {user ? (
            <>
              {isAdmin && <Link to="/admin" className="nav-action-btn" title="Admin">Admin</Link>}
              <Link to="/orders" className="nav-action-btn" title="Orders">Orders</Link>
              <button onClick={handleLogout} className="nav-action-btn logout-btn" title="Logout">Logout</button>
            </>
          ) : (
            <Link to="/login" className="nav-action-btn login-btn" title="Login">Login</Link>
          )}
          <Link to="/cart" className="nav-icon-btn cart-btn" title="Cart">
            <span className="cart-icon" aria-hidden="true">🛒</span>
            {cart.count > 0 && <span className="cart-badge">{cart.count}</span>}
          </Link>
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
}
