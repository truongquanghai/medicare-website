import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../shared/constants/routes';
import { useAuth } from './authContext';

/** Đăng xuất và đưa người dùng về trang chủ (tránh để lại trang yêu cầu đăng nhập). */
export function useLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return useCallback(() => {
    navigate(ROUTES.home);
    logout();
  }, [navigate, logout]);
}
