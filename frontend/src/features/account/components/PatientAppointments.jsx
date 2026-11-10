import { Link } from 'react-router-dom';
import { ROLES, STATUS } from '../../../shared/constants/appointment';
import { ROUTES } from '../../../shared/constants/routes';
import AppointmentTable from '../../appointments/components/AppointmentTable';
import { useAppointments } from '../../appointments/hooks/useAppointments';
import StatCard from '../../dashboard/components/StatCard';

const countByStatus = (appointments, status) => appointments.filter((item) => item.status === status).length;

export default function PatientAppointments() {
  const { appointments, loading, error, pendingId, actionError, changeStatus } = useAppointments();

  return (
    <>
      <div className="stats-grid">
        <StatCard label="Tổng lịch hẹn" value={appointments.length} />
        <StatCard label="Chờ xác nhận" value={countByStatus(appointments, STATUS.PENDING)} />
        <StatCard label="Đã xác nhận" value={countByStatus(appointments, STATUS.CONFIRMED)} />
      </div>

      <section className="dashboard-panel">
        <div className="panel-header">
          <h2>Lịch khám của bạn</h2>
          <Link className="btn btn-outline btn-sm" to={ROUTES.doctors}>
            Đặt lịch mới
          </Link>
        </div>

        {actionError && (
          <p className="form-error" role="alert">
            {actionError}
          </p>
        )}

        {loading && <p>Đang tải lịch khám...</p>}
        {error && <p className="form-error">Không thể tải lịch khám. Vui lòng thử lại sau.</p>}
        {!loading && !error && !appointments.length && <p className="muted">Bạn chưa có lịch khám nào.</p>}
        {appointments.length > 0 && (
          <AppointmentTable
            appointments={appointments}
            role={ROLES.PATIENT}
            pendingId={pendingId}
            onStatusChange={changeStatus}
          />
        )}
      </section>
    </>
  );
}
