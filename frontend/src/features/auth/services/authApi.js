import api from '../../../shared/api/client';

export const authApi = {
  login: (payload) => api.post('/auth/login', payload).then(({ data }) => data),
  register: (payload) => api.post('/auth/register', payload).then(({ data }) => data),
  getMe: () => api.get('/auth/me').then(({ data }) => data),
  updateProfile: (payload) => api.patch('/auth/profile', payload).then(({ data }) => data),
};
