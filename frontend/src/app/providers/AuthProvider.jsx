import { useCallback, useEffect, useMemo, useState } from 'react';
import { authApi } from '../../features/auth/services/authApi';
import { setUnauthorizedHandler } from '../../shared/api/client';
import { clearSession, getStoredUser, getToken, saveSession, saveUser } from '../../shared/auth/session';
import { AuthContext } from './authContext';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  // Còn token nghĩa là cần xác minh lại với máy chủ trước khi tin vào người dùng đã lưu.
  const [loading, setLoading] = useState(() => Boolean(getToken()));

  const login = useCallback((session) => {
    saveSession(session);
    setUser(session.user);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const updateUser = useCallback((nextUser) => {
    saveUser(nextUser);
    setUser(nextUser);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    if (!getToken()) return undefined;

    let ignore = false;
    authApi
      .getMe()
      .then((freshUser) => {
        if (!ignore) updateUser(freshUser);
      })
      .catch((error) => {
        // Chỉ hủy phiên khi token bị từ chối; lỗi mạng tạm thời không nên đăng xuất người dùng.
        if (!ignore && error.response?.status === 401) logout();
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [logout, updateUser]);

  const value = useMemo(() => ({ user, loading, login, logout, updateUser }), [user, loading, login, logout, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
