import api from './client';
export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (slug) => api.get(`/products/${slug}`);
export const getFeatured = () => api.get('/products/featured');
export const getCategories = () => api.get('/categories');
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const uploadImage = (file) => {
  const form = new FormData();
  form.append('image', file);
  return api.post('/upload', form);
};
