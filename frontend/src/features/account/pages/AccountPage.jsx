import { useAuth } from '../../../app/providers/authContext';
import { useLogout } from '../../../app/providers/useLogout';
import { ROLE_LABELS, ROLES } from '../../../shared/constants/appointment';
import PatientAppointments from '../components/PatientAppointments';
import ProfilePanel from '../components/ProfilePanel';

export default function AccountPage() {
  const { user } = useAuth();
  const logout = useLogout();

  return (
    <main className="section wrap">
      <div className="profile-header">
        <div>
          <span className="tag">{ROLE_LABELS[user.role]}</span>
          <h1>{user.full_name}</h1>
        </div>
        <button className="btn btn-light" type="button" onClick={logout}>
          Đăng xuất
        </button>
      </div>

      <ProfilePanel />

      {user.role === ROLES.PATIENT && <PatientAppointments />}
    </main>
  );
}
