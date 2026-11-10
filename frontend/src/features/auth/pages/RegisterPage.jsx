import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/authContext';
import { getHomePathForRole, ROUTES } from '../../../shared/constants/routes';
import { getErrorMessage } from '../../../shared/utils/errors';
import { authApi } from '../services/authApi';

const MIN_PASSWORD_LENGTH = 6;

export default function RegisterPage() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={getHomePathForRole(user.role)} replace />;

  const handleChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      login(await authApi.register(form));
    } catch (err) {
      setError(getErrorMessage(err, 'Đăng ký thất bại. Vui lòng thử lại.'));
      setSubmitting(false);
    }
  };

  return (
    <section className="section wrap">
      <div className="auth-card">
        <h1>Đăng ký</h1>

        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Họ và tên</span>
            <input name="full_name" value={form.full_name} onChange={handleChange} autoComplete="name" required />
          </label>

          <label className="field">
            <span>Email</span>
            <input type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" required />
          </label>

          <label className="field">
            <span>Số điện thoại</span>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} autoComplete="tel" />
          </label>

          <label className="field">
            <span>Mật khẩu (tối thiểu {MIN_PASSWORD_LENGTH} ký tự)</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              required
            />
          </label>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>

        <p className="auth-switch">
          Đã có tài khoản? <Link to={ROUTES.login}>Đăng nhập</Link>
        </p>
      </div>
    </section>
  );
}
