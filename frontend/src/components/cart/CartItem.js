import React from 'react';
import { useCart } from '../../context/CartContext';
import './CartItem.css';

export default function CartItem({ item }) {
  const { updateItem, removeItem } = useCart();

  return (
    <div className="cart-item">
      <img src={item.image || `https://picsum.photos/seed/${item.product_id}/200/250`} alt={item.name} className="cart-item-img" />
      <div className="cart-item-details">
        <p className="cart-item-name">{item.name}</p>
        {(item.size || item.color) && <p className="cart-item-variant">{[item.size, item.color].filter(Boolean).join(' · ')}</p>}
        <p className="cart-item-price">${(parseFloat(item.price) + parseFloat(item.price_modifier || 0)).toFixed(2)}</p>
        <div className="cart-item-qty">
          <button onClick={() => updateItem(item.id, item.quantity - 1)}>−</button>
          <span>{item.quantity}</span>
          <button onClick={() => updateItem(item.id, item.quantity + 1)}>+</button>
        </div>
      </div>
      <button className="cart-item-remove" onClick={() => removeItem(item.id)}>✕</button>
    </div>
  );
}
