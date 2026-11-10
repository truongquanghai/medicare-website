import api from '../../../shared/api/client';

export const doctorApi = {
  getAll: () => api.get('/doctors').then(({ data }) => data),
  getById: (id) => api.get(`/doctors/${id}`).then(({ data }) => data),
  getSlots: (id, date) => api.get(`/doctors/${id}/slots`, { params: { date } }).then(({ data }) => data),
};
