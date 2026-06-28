import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import CartItem from '../../components/cart/CartItem';
import { createOrder } from '../../api/orders';
import { toast } from 'react-toastify';
import './CartPage.css';

const EMPTY_ADDRESS = { full_name: '', phone: '', line1: '', city: '', state: '', zip: '', country: 'US' };

export default function CartPage() {
  const { cart, clearAllItems } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState('cart');
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [placing, setPlacing] = useState(false);

  const shipping = parseFloat(cart.total) >= 150 ? 0 : 9.99;
  const tax = parseFloat(cart.total) * 0.08;
  const total = parseFloat(cart.total) + shipping + tax;

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const res = await createOrder({ shipping_address: address });
      toast.success(`Order ${res.data.orderNumber} placed!`);
      navigate(`/orders/${res.data.orderId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setPlacing(false); }
  };

  if (cart.items.length === 0) return (
    <div className="cart-empty container">
      <p>Your cart is empty.</p>
      <Link to="/products" className="btn btn-primary">Continue Shopping</Link>
    </div>
  );

  return (
    <div className="cart-page container">
      <h1>Shopping Cart</h1>
      <div className="cart-layout">
        <div className="cart-items-section">
          {step === 'cart' && (
            <>
              {cart.items.map(item => <CartItem key={item.id} item={item} />)}
              <button className="btn btn-primary checkout-btn" onClick={() => setStep('checkout')}>Proceed to Checkout</button>
            </>
          )}
          {step === 'checkout' && (
            <div className="checkout-form">
              <h2>Shipping Address</h2>
              {Object.entries({ full_name: 'Full Name', phone: 'Phone', line1: 'Address Line 1', city: 'City', state: 'State', zip: 'ZIP Code', country: 'Country' }).map(([key, label]) => (
                <div key={key} className="form-group">
                  <label>{label}</label>
                  <input value={address[key]} onChange={e => setAddress({ ...address, [key]: e.target.value })} />
                </div>
              ))}
              <div className="checkout-actions">
                <button className="btn btn-outline" onClick={() => setStep('cart')}>Back to Cart</button>
                <button className="btn btn-primary" onClick={handlePlaceOrder} disabled={placing}>{placing ? 'Placing...' : 'Place Order'}</button>
              </div>
            </div>
          )}
        </div>
        <aside className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row"><span>Subtotal</span><span>${parseFloat(cart.total).toFixed(2)}</span></div>
          <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
          <div className="summary-row"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
          <div className="summary-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
          {parseFloat(cart.total) < 150 && <p className="free-shipping-note">Add ${(150 - parseFloat(cart.total)).toFixed(2)} more for free shipping!</p>}
        </aside>
      </div>
    </div>
  );
}
