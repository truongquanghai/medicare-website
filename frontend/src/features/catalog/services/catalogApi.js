import api from '../../../shared/api/client';

export const catalogApi = {
  getSpecialties: () => api.get('/specialties').then(({ data }) => data),
  getFacilities: () => api.get('/facilities').then(({ data }) => data),
};
