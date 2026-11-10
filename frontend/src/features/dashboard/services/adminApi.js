import api from '../../../shared/api/client';

export const adminApi = {
  getStats: () => api.get('/admin/stats').then(({ data }) => data),
};
