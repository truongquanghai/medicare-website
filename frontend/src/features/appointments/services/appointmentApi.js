import api from '../../../shared/api/client';

export const appointmentApi = {
  /** Danh sách lịch khám của người đăng nhập (backend tự lọc theo vai trò). */
  getAll: () => api.get('/appointments').then(({ data }) => data),
  create: (payload) => api.post('/appointments', payload).then(({ data }) => data),
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }).then(({ data }) => data),
};
