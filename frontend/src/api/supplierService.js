import { api } from './api';

export const supplierService = {
  getAll: () => api.get('/suppliers/'),
  getById: (id) => api.get(`/suppliers/${id}/`),
  create: (data) => api.post('/suppliers/', data),
  update: (id, data) => api.put(`/suppliers/${id}/`, data),
  delete: (id) => api.delete(`/suppliers/${id}/`),
  createPurchaseOrder: (id, amount, note = '') => api.post(`/suppliers/${id}/create_purchase_order/`, { amount, note }),
  recordPayment: (id, amount, note = '') => api.post(`/suppliers/${id}/record_payment/`, { amount, note }),
};
