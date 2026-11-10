import axios from 'axios';
import { getToken } from '../auth/session';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  timeout: 15000,
});

let unauthorizedHandler = null;

/** Đăng ký hàm được gọi khi máy chủ báo phiên đăng nhập hết hạn (HTTP 401 khi đang có token). */
export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && getToken()) unauthorizedHandler?.();
    return Promise.reject(error);
  },
);

export default api;
