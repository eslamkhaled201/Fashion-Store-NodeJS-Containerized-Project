import api from './client';
export const getCart = () => api.get('/cart');
export const addToCart = (data) => api.post('/cart', data);
export const updateCartItem = (id, quantity) => api.put(`/cart/${id}`, { quantity });
export const removeFromCart = (id) => api.delete(`/cart/${id}`);
export const clearCart = () => api.delete('/cart');
