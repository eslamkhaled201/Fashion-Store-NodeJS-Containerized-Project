import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCart, addToCart as apiAdd, updateCartItem as apiUpdate, removeFromCart as apiRemove, clearCart as apiClear } from '../api/cart';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) return setCart({ items: [], total: 0, count: 0 });
    try {
      const res = await getCart();
      setCart(res.data);
    } catch {}
  };

  useEffect(() => { fetchCart(); }, [user]);

  const addItem = async (product_id, variant_id, quantity = 1) => {
    if (!user) { toast.info('Please log in to add to cart'); return; }
    setLoading(true);
    try {
      await apiAdd({ product_id, variant_id, quantity });
      await fetchCart();
      toast.success('Added to cart');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const updateItem = async (id, quantity) => {
    setLoading(true);
    try { await apiUpdate(id, quantity); await fetchCart(); }
    catch (err) { toast.error('Error updating cart'); }
    finally { setLoading(false); }
  };

  const removeItem = async (id) => {
    try { await apiRemove(id); await fetchCart(); toast.success('Removed from cart'); }
    catch { toast.error('Error removing item'); }
  };

  const clearAllItems = async () => {
    try { await apiClear(); setCart({ items: [], total: 0, count: 0 }); }
    catch {}
  };

  return (
    <CartContext.Provider value={{ cart, loading, addItem, updateItem, removeItem, clearAllItems, refetch: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
