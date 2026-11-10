import { ArrowRight, Building2, Clock, MapPin, Phone, User } from 'lucide-react';
import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageMessage from '../../../shared/components/PageMessage';
import { bookingPath } from '../../../shared/constants/routes';
import { useAsync } from '../../../shared/hooks/useAsync';
import { formatCurrency, formatTime, formatWorkDays } from '../../../shared/utils/format';
import { doctorApi } from '../services/doctorApi';

export default function DoctorDetailPage() {
  const { id } = useParams();
  const loadDoctor = useCallback(() => doctorApi.getById(id), [id]);
  const { data: doctor, loading, error } = useAsync(loadDoctor);

  if (loading) return <PageMessage>Đang tải thông tin bác sĩ...</PageMessage>;

  if (error) {
    const notFound = error.response?.status === 404 || error.response?.status === 400;
    return <PageMessage>{notFound ? 'Không tìm thấy bác sĩ.' : 'Không thể tải thông tin bác sĩ. Vui lòng thử lại sau.'}</PageMessage>;
  }

  const schedule = `${formatWorkDays(doctor.work_days)} • ${formatTime(doctor.start_time)} - ${formatTime(doctor.end_time)}`;

  return (
    <main className="section wrap">
      <div className="detail-header">
        <div className="doctor-photo detail-photo">
          <div className="doctor-avatar">
            <User />
          </div>
        </div>

        <div className="detail-copy">
          <span className="tag">{doctor.specialty_name}</span>
          <h1>{doctor.full_name}</h1>
          <p>{[doctor.degree, doctor.experience && `${doctor.experience} kinh nghiệm`].filter(Boolean).join(' • ')}</p>

          <div className="meta-list">
            <span>
              <Building2 size={15} /> {doctor.facility_name}
            </span>
            <span>
              <MapPin size={15} /> {doctor.facility_address}
            </span>
            <span>
              <Clock size={15} /> {schedule}
            </span>
          </div>

          <div className="detail-actions">
            <Link className="btn btn-primary" to={bookingPath(doctor.id)}>
              Đặt lịch khám
            </Link>
            {doctor.phone && (
              <a className="btn btn-outline" href={`tel:${doctor.phone.replace(/\s/g, '')}`}>
                <Phone size={15} /> Gọi tư vấn
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="detail-panel">
        <h2>Giới thiệu</h2>
        <p>{doctor.bio || 'Bác sĩ có kinh nghiệm trong khám và điều trị chuyên khoa.'}</p>
      </div>

      <div className="detail-grid">
        <div className="detail-panel">
          <h2>Học vấn & kinh nghiệm</h2>
          <ul>
            {doctor.degree && <li>{doctor.degree}</li>}
            {doctor.experience && <li>{doctor.experience} kinh nghiệm</li>}
            <li>Công tác tại {doctor.facility_name}</li>
          </ul>
        </div>

        <div className="detail-panel">
          <h2>Chuyên khoa</h2>
          <ul>
            <li>{doctor.specialty_name}</li>
            <li>Khám bệnh định kỳ</li>
            <li>Đánh giá và điều trị chuyên sâu</li>
          </ul>
        </div>
      </div>

      <div className="detail-bottom-row">
        <b>Phí khám: {formatCurrency(doctor.fee)}</b>
        <Link className="btn btn-primary" to={bookingPath(doctor.id)}>
          Đặt lịch <ArrowRight size={17} />
        </Link>
      </div>
    </main>
  );
}
