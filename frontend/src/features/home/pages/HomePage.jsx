import {
  ArrowRight,
  Baby,
  Bone,
  Building2,
  CheckCircle2,
  Clock3,
  Ear,
  HeartPulse,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Link, createSearchParams, useNavigate } from 'react-router-dom';
import { ROUTES, SECTION_IDS } from '../../../shared/constants/routes';
import { useAsync } from '../../../shared/hooks/useAsync';
import { catalogApi } from '../../catalog/services/catalogApi';
import { doctorApi } from '../../doctors/services/doctorApi';

const SPECIALTY_ICONS = {
  'Tim mạch': HeartPulse,
  'Nhi khoa': Baby,
  'Da liễu': Sparkles,
  'Tai Mũi Họng': Ear,
  'Cơ xương khớp': Bone,
};

const STEPS = [
  { index: '01', title: 'Tìm bác sĩ', text: 'Lọc theo chuyên khoa, địa điểm và thời gian phù hợp.', icon: Search },
  { index: '02', title: 'Đặt lịch', text: 'Chọn khung giờ và xác nhận nhanh chóng trên hệ thống.', icon: Clock3 },
  { index: '03', title: 'Nhận tư vấn', text: 'Gặp bác sĩ, theo dõi lịch khám và chăm sóc sức khỏe.', icon: CheckCircle2 },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const { data: doctors } = useAsync(doctorApi.getAll);
  const { data: specialties } = useAsync(catalogApi.getSpecialties);
  const { data: facilities } = useAsync(catalogApi.getFacilities);

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmed = keyword.trim();
    navigate({ pathname: ROUTES.doctors, search: trimmed ? `?${createSearchParams({ q: trimmed })}` : '' });
  };

  const stats = [
    { value: doctors?.length, label: 'Bác sĩ chuyên khoa' },
    { value: specialties?.length, label: 'Chuyên khoa' },
    { value: facilities?.length, label: 'Cơ sở y tế' },
  ];

  return (
    <>
      <section className="hero">
        <div className="wrap hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="dot" />
              CHĂM SÓC SỨC KHỎE TOÀN DIỆN
            </span>
            <h1>
              Dịch vụ y tế <em>nhanh</em>, an toàn và đáng tin cậy.
            </h1>
            <p>Tìm bác sĩ phù hợp, đặt lịch khám trong vài phút và quản lý lịch hẹn mọi lúc mọi nơi.</p>

            <form className="hero-search" onSubmit={handleSearch} role="search">
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm kiếm bác sĩ hoặc chuyên khoa"
                aria-label="Tìm kiếm bác sĩ hoặc chuyên khoa"
              />
              <button type="submit">Tìm kiếm</button>
            </form>

            <div className="hero-trust">
              <span>
                <CheckCircle2 size={14} /> Đặt lịch trực tuyến 24/7
              </span>
              <span>
                <Clock3 size={14} /> Xác nhận nhanh chóng
              </span>
              <span>
                <ShieldCheck size={14} /> Bảo mật thông tin
              </span>
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="hero-circle">
              <div className="doctor-illustration">
                <span>+</span>
              </div>
            </div>

            <div className="float-card float-one">
              <div className="float-icon">
                <Clock3 size={16} />
              </div>
              <div>
                <b>Chỉ vài phút</b>
                <small>Để đặt một lịch khám</small>
              </div>
            </div>

            <div className="float-card float-two">
              <div className="avatar-stack">
                <Users size={18} />
              </div>
              <div>
                <b>Đội ngũ bác sĩ</b>
                <small>Giàu kinh nghiệm</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="stats-strip">
        <div className="wrap stats-row">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <b>{value ?? '—'}</b>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="section wrap" id={SECTION_IDS.specialties}>
        <div className="section-head">
          <span>CHUYÊN KHOA</span>
          <h2>Chăm sóc theo từng chuyên khoa</h2>
          <p>Các dịch vụ y tế được thiết kế phù hợp với từng nhu cầu khám chữa bệnh.</p>
        </div>

        <div className="specialty-grid">
          {(specialties ?? []).map((specialty) => {
            const Icon = SPECIALTY_ICONS[specialty.name] ?? Stethoscope;
            return (
              <Link
                className="specialty-card"
                key={specialty.id}
                to={{ pathname: ROUTES.doctors, search: `?${createSearchParams({ specialty: specialty.id })}` }}
              >
                <div className="spec-icon">
                  <Icon size={22} />
                </div>
                <b>{specialty.name}</b>
                <small>{specialty.doctor_count} bác sĩ</small>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section section-soft process">
        <div className="wrap">
          <div className="section-head">
            <span>QUY TRÌNH</span>
            <h2>Khám bệnh dễ dàng trong 3 bước</h2>
            <p>Trải nghiệm chăm sóc sức khỏe nhanh gọn, rõ ràng và thuận tiện.</p>
          </div>

          <div className="steps">
            {STEPS.map(({ index, title, text, icon: Icon }) => (
              <div key={index}>
                <span>{index}</span>
                <Icon size={28} />
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section wrap" id={SECTION_IDS.facilities}>
        <div className="section-head">
          <span>CƠ SỞ Y TẾ</span>
          <h2>Hệ thống cơ sở MediCare</h2>
          <p>Địa điểm khám thuận tiện, trang thiết bị hiện đại.</p>
        </div>

        <div className="facility-grid">
          {(facilities ?? []).map((facility) => (
            <article className="facility-card" key={facility.id}>
              <div className="facility-icon">
                <Building2 size={22} />
              </div>
              <div>
                <h3>{facility.name}</h3>
                <p>
                  <MapPin size={14} /> {facility.address}
                </p>
                {facility.phone && (
                  <p>
                    <Phone size={14} /> {facility.phone}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
