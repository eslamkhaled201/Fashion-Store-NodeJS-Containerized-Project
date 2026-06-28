import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const requestUrl = err.config?.url || '';
      if (!requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/register') && !requestUrl.includes('/auth/me')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
