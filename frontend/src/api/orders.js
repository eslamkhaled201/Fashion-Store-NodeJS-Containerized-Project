import api from './client';
export const createOrder = (data) => api.post('/orders', data);
export const getMyOrders = () => api.get('/orders');
export const getOrder = (id) => api.get(`/orders/${id}`);
export const createPaymentIntent = (order_id) => api.post('/payments/create-intent', { order_id });
