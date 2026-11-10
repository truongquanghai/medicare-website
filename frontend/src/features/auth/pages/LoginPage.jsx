import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../app/providers/authContext';
import { getHomePathForRole, ROUTES } from '../../../shared/constants/routes';
import { getErrorMessage } from '../../../shared/utils/errors';
import { authApi } from '../services/authApi';

export default function LoginPage() {
  const { user, login } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Đăng nhập thành công (hoặc đã đăng nhập sẵn) thì chuyển về trang đang định vào, nếu không thì về trang của vai trò.
  if (user) return <Navigate to={location.state?.from ?? getHomePathForRole(user.role)} replace />;

  const handleChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      login(await authApi.login(form));
    } catch (err) {
      setError(getErrorMessage(err, 'Đăng nhập thất bại. Vui lòng thử lại.'));
      setSubmitting(false);
    }
  };

  return (
    <section className="section wrap">
      <div className="auth-card">
        <h1>Đăng nhập</h1>

        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </label>

          <label className="field">
            <span>Mật khẩu</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="auth-switch">
          Chưa có tài khoản? <Link to={ROUTES.register}>Đăng ký ngay</Link>
        </p>
      </div>
    </section>
  );
}
