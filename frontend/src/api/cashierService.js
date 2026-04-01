import { api } from './api';

export const cashierService = {
  getAll: () => api.get('/cashiers/'),
  getById: (id) => api.get(`/cashiers/${id}/`),
  create: (data) => api.post('/cashiers/', data),
  update: (id, data) => api.put(`/cashiers/${id}/`, data),
  delete: (id) => api.delete(`/cashiers/${id}/`),
  login: (id, pin) => api.post('/cashiers/login/', { id, pin }),
};
