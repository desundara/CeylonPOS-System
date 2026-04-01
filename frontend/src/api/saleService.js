import { api } from './api';

export const saleService = {
  getAll: () => api.get('/sales/'),
  getById: (id) => api.get(`/sales/${id}/`),
  create: (saleData) => api.post('/sales/create_sale/', saleData),
  getDailyMetrics: () => api.get('/sales/daily-metrics/'),
  getMonthlyMetrics: () => api.get('/sales/monthly-metrics/'),
  getTopProducts: () => api.get('/sales/top-products/'),
  getPaymentSummary: () => api.get('/sales/payment-summary/'),
};
