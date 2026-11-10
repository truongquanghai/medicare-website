import { useState } from 'react';
import { useAuth } from '../../../app/providers/authContext';
import { ROLES, STATUS } from '../../../shared/constants/appointment';
import AppointmentTable from '../../appointments/components/AppointmentTable';
import { useAppointments } from '../../appointments/hooks/useAppointments';
import AdminOverview from '../components/AdminOverview';
import StatCard from '../components/StatCard';
import Select from '../../../shared/components/Select';

const ALL_STATUSES = 'all';
const STATUS_FILTER_OPTIONS = [
  { value: ALL_STATUSES, label: 'Tất cả trạng thái' },
  ...Object.values(STATUS).map((status) => ({ value: status, label: status })),
];

const HEADINGS = {
  [ROLES.ADMIN]: { title: 'Quản trị MediCare', subtitle: 'Tổng quan nhanh về bệnh nhân, bác sĩ và lịch hẹn.' },
  [ROLES.DOCTOR]: { title: 'Bảng điều khiển bác sĩ', subtitle: 'Xác nhận và theo dõi các lịch hẹn của bạn.' },
};

const countByStatus = (appointments, status) => appointments.filter((item) => item.status === status).length;

export default function DashboardPage() {
  const { user } = useAuth();
  const { appointments, loading, error, pendingId, actionError, changeStatus } = useAppointments();
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES);

  const { title, subtitle } = HEADINGS[user.role];
  const visibleAppointments =
    statusFilter === ALL_STATUSES ? appointments : appointments.filter((item) => item.status === statusFilter);

  return (
    <main className="section wrap">
      <div className="dashboard-header">
        <h1>{title}</h1>
        <p className="dashboard-subtitle">{subtitle}</p>
      </div>

      {user.role === ROLES.ADMIN ? (
        <AdminOverview />
      ) : (
        <div className="stats-grid">
          <StatCard label="Tổng lịch hẹn" value={appointments.length} />
          <StatCard label="Chờ xác nhận" value={countByStatus(appointments, STATUS.PENDING)} />
          <StatCard label="Đã xác nhận" value={countByStatus(appointments, STATUS.CONFIRMED)} />
          <StatCard label="Đã hoàn thành" value={countByStatus(appointments, STATUS.COMPLETED)} />
        </div>
      )}

      <section className="dashboard-panel">
        <div className="panel-header">
          <h2>Lịch hẹn</h2>
          <Select
            className="filter-select"
            label="Lọc theo trạng thái"
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_FILTER_OPTIONS}
          />
        </div>

        {actionError && (
          <p className="form-error" role="alert">
            {actionError}
          </p>
        )}

        {loading && <p>Đang tải dữ liệu...</p>}
        {error && <p className="form-error">Không thể tải lịch hẹn. Vui lòng thử lại sau.</p>}
        {!loading && !error && !visibleAppointments.length && <p className="muted">Chưa có lịch hẹn nào.</p>}
        {visibleAppointments.length > 0 && (
          <AppointmentTable
            appointments={visibleAppointments}
            role={user.role}
            pendingId={pendingId}
            onStatusChange={changeStatus}
          />
        )}
      </section>
    </main>
  );
}
