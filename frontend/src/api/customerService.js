import { api } from './api';

export const customerService = {
  getAll: () => api.get('/customers/'),
  getById: (id) => api.get(`/customers/${id}/`),
  create: (data) => api.post('/customers/', data),
  update: (id, data) => api.put(`/customers/${id}/`, data),
  delete: (id) => api.delete(`/customers/${id}/`),
  getLoyalty: () => api.get('/customers/loyalty/'),
  getPurchaseHistory: (id) => api.get(`/customers/${id}/purchase_history/`),
  addPoints: (id, points, note = '') => api.post(`/customers/${id}/add_points/`, { points, note }),
  redeemPoints: (id, points, note = '') => api.post(`/customers/${id}/redeem_points/`, { points, note }),
};
