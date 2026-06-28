import api from './client';
export const getDashboard = () => api.get('/admin/dashboard');
export const getAllOrders = (params) => api.get('/admin/orders', { params });
export const updateOrderStatus = (id, status) => api.put(`/admin/orders/${id}/status`, { status });
export const getAllUsers = () => api.get('/admin/users');
export const createUser = (data) => api.post('/admin/users', data);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
