import { useState } from 'react';
import { useAuth } from '../../../app/providers/authContext';
import { ROLE_LABELS } from '../../../shared/constants/appointment';
import { getErrorMessage } from '../../../shared/utils/errors';
import { authApi } from '../../auth/services/authApi';

export default function ProfilePanel() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ full_name: user.full_name, phone: user.phone ?? '' });
  const [feedback, setFeedback] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    setFeedback(null);
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const saved = await authApi.updateProfile({ full_name: form.full_name.trim(), phone: form.phone.trim() });
      updateUser(saved);
      setFeedback({ type: 'success', message: 'Đã lưu thông tin cá nhân.' });
    } catch (err) {
      setFeedback({ type: 'error', message: getErrorMessage(err, 'Không thể lưu thông tin. Vui lòng thử lại.') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="panel form" onSubmit={handleSubmit}>
      <h2>Thông tin cá nhân</h2>

      <div className="field">
        <span>Email</span>
        <div className="readonly">{user.email}</div>
      </div>

      <div className="field">
        <span>Vai trò</span>
        <div className="readonly">{ROLE_LABELS[user.role]}</div>
      </div>

      <label className="field">
        <span>Họ và tên</span>
        <input name="full_name" value={form.full_name} onChange={handleChange} maxLength={120} required />
      </label>

      <label className="field">
        <span>Số điện thoại</span>
        <input type="tel" name="phone" value={form.phone} onChange={handleChange} />
      </label>

      {feedback && (
        <p className={feedback.type === 'error' ? 'form-error' : 'form-success'} role="status">
          {feedback.message}
        </p>
      )}

      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
      </button>
    </form>
  );
}
