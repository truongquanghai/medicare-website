import { getStatusActions, ROLES } from '../../../shared/constants/appointment';
import StatusBadge from '../../../shared/components/StatusBadge';
import { formatDate, formatTime } from '../../../shared/utils/format';

/**
 * Bảng lịch khám dùng chung cho bệnh nhân, bác sĩ và quản trị viên.
 * Cột và nút thao tác thay đổi theo `role` của người đang xem.
 */
export default function AppointmentTable({ appointments, role, pendingId, onStatusChange }) {
  const showPatient = role !== ROLES.PATIENT;
  const showDoctor = role !== ROLES.DOCTOR;

  const handleAction = (appointment, action) => {
    if (action.confirmMessage && !window.confirm(action.confirmMessage)) return;
    onStatusChange(appointment.id, action.status);
  };

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            {showPatient && <th>Bệnh nhân</th>}
            {showDoctor && <th>Bác sĩ</th>}
            <th>Ngày</th>
            <th>Giờ</th>
            <th>Lý do khám</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => {
            const actions = getStatusActions(role, appointment.status);
            const busy = pendingId === appointment.id;

            return (
              <tr key={appointment.id}>
                {showPatient && (
                  <td>
                    {appointment.patient_name}
                    {appointment.patient_phone && <small className="cell-note">{appointment.patient_phone}</small>}
                  </td>
                )}
                {showDoctor && (
                  <td>
                    {appointment.doctor_name}
                    <small className="cell-note">{appointment.specialty_name}</small>
                  </td>
                )}
                <td>{formatDate(appointment.appointment_date)}</td>
                <td>{formatTime(appointment.start_time)}</td>
                <td className="cell-reason">{appointment.reason}</td>
                <td>
                  <StatusBadge status={appointment.status} />
                </td>
                <td>
                  {actions.length ? (
                    <div className="row-actions">
                      {actions.map((action) => (
                        <button
                          key={action.status}
                          type="button"
                          className={`btn btn-sm ${action.variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                          disabled={busy}
                          onClick={() => handleAction(appointment, action)}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
