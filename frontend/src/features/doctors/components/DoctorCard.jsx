import { User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { bookingPath, doctorPath } from '../../../shared/constants/routes';
import { formatCurrency, formatWorkDays } from '../../../shared/utils/format';

export default function DoctorCard({ doctor }) {
  return (
    <article className="doctor-card">
      <div className="doctor-photo">
        <div className="doctor-avatar">
          <User />
        </div>
      </div>

      <div className="doctor-info">
        <span className="tag">{doctor.specialty_name}</span>
        <h3>{doctor.full_name}</h3>
        <p>
          {[doctor.degree, doctor.experience && `${doctor.experience} kinh nghiệm`].filter(Boolean).join(' • ')}
        </p>
        <p>{doctor.facility_name}</p>

        <div className="card-meta">
          <span>{formatWorkDays(doctor.work_days)}</span>
          <b>{formatCurrency(doctor.fee)}</b>
        </div>

        <div className="card-actions">
          <Link className="btn btn-outline" to={doctorPath(doctor.id)}>
            Xem chi tiết
          </Link>
          <Link className="btn btn-primary" to={bookingPath(doctor.id)}>
            Đặt lịch
          </Link>
        </div>
      </div>
    </article>
  );
}
