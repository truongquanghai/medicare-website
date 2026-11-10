import { ArrowRight, Search } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../../../shared/constants/routes';
import { useAsync } from '../../../shared/hooks/useAsync';
import { normalizeText } from '../../../shared/utils/text';
import { catalogApi } from '../../catalog/services/catalogApi';
import DoctorCard from '../components/DoctorCard';
import { doctorApi } from '../services/doctorApi';
import Select from '../../../shared/components/Select';

export default function DoctorListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const specialtyId = searchParams.get('specialty') ?? '';

  const { data: doctors, loading, error } = useAsync(doctorApi.getAll);
  const { data: specialties } = useAsync(catalogApi.getSpecialties);

  const updateParam = (key, value) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );

  const specialtyOptions = useMemo(
    () => [
      { value: '', label: 'Tất cả chuyên khoa' },
      ...(specialties ?? []).map((specialty) => ({ value: String(specialty.id), label: specialty.name })),
    ],
    [specialties],
  );
  const filteredDoctors = useMemo(() => {
    const keyword = normalizeText(query.trim());

    return (doctors ?? []).filter((doctor) => {
      if (specialtyId && String(doctor.specialty_id) !== specialtyId) return false;
      if (!keyword) return true;
      return normalizeText(`${doctor.full_name} ${doctor.specialty_name} ${doctor.degree ?? ''}`).includes(keyword);
    });
  }, [doctors, query, specialtyId]);

  return (
    <main className="section wrap">
      <div className="section-head">
        <span>BÁC SĨ</span>
        <h2>Tìm bác sĩ phù hợp</h2>
        <p>Khám phá chuyên khoa và lịch làm việc của đội ngũ bác sĩ.</p>
      </div>

      <div className="filter-bar">
        <label className="search-box">
          <Search aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => updateParam('q', event.target.value)}
            placeholder="Tìm bác sĩ, chuyên khoa..."
            aria-label="Tìm bác sĩ"
          />
        </label>
        <Select
          className="filter-select"
          label="Lọc theo chuyên khoa"
          value={specialtyId}
          onChange={(value) => updateParam('specialty', value)}
          options={specialtyOptions}
        />
      </div>

      {loading && <div className="empty-state">Đang tải danh sách bác sĩ...</div>}
      {error && <div className="empty-state">Không thể tải danh sách bác sĩ. Vui lòng thử lại sau.</div>}

      {doctors && (
        <>
          <p className="result-line">
            Tìm thấy <b>{filteredDoctors.length}</b> bác sĩ
          </p>
          {filteredDoctors.length ? (
            <div className="doctor-grid">
              {filteredDoctors.map((doctor) => (
                <DoctorCard doctor={doctor} key={doctor.id} />
              ))}
            </div>
          ) : (
            <div className="empty-state">Không tìm thấy bác sĩ phù hợp.</div>
          )}
        </>
      )}

      <div className="center">
        <Link className="btn btn-outline" to={ROUTES.home}>
          Về trang chủ <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  );
}
