import { CheckCircle, User } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageMessage from '../../../shared/components/PageMessage';
import { PAYMENT_METHODS } from '../../../shared/constants/appointment';
import { ROUTES } from '../../../shared/constants/routes';
import { useAsync } from '../../../shared/hooks/useAsync';
import { getErrorMessage } from '../../../shared/utils/errors';
import { formatCurrency, formatTime, formatWorkDays, todayIso } from '../../../shared/utils/format';
import { doctorApi } from '../../doctors/services/doctorApi';
import { appointmentApi } from '../services/appointmentApi';
import Select from '../../../shared/components/Select';

const INITIAL_FORM = { date: '', time: '', reason: '', paymentMethod: PAYMENT_METHODS.SIMULATED };
const PAYMENT_OPTIONS = Object.values(PAYMENT_METHODS).map((method) => ({ value: method, label: method }));

function SlotPicker({ date, availability, loading, error, value, onChange }) {
  if (!date) return <p className="field-hint">Chọn ngày khám để xem các khung giờ còn trống.</p>;
  if (loading) return <p className="field-hint">Đang tải khung giờ...</p>;
  if (error) return <p className="field-hint field-hint--error">Không thể tải khung giờ. Vui lòng thử lại.</p>;
  if (!availability?.is_working_day) {
    return <p className="field-hint field-hint--error">Bác sĩ không làm việc vào ngày này. Vui lòng chọn ngày khác.</p>;
  }

  const freeSlots = availability.slots.filter((slot) => slot.available);
  if (!freeSlots.length) {
    return <p className="field-hint field-hint--error">Ngày này đã hết chỗ. Vui lòng chọn ngày khác.</p>;
  }

  return (
    <div className="slot-grid" role="radiogroup" aria-label="Khung giờ khám">
      {availability.slots.map(({ time, available }) => (
        <button
          key={time}
          type="button"
          role="radio"
          aria-checked={value === time}
          className={`slot${value === time ? ' slot--selected' : ''}`}
          disabled={!available}
          onClick={() => onChange(time)}
        >
          {time}
        </button>
      ))}
    </div>
  );
}

export default function BookingPage() {
  const { id } = useParams();
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);

  const loadDoctor = useCallback(() => doctorApi.getById(id), [id]);
  const { data: doctor, loading, error } = useAsync(loadDoctor);

  const loadSlots = useCallback(() => (form.date ? doctorApi.getSlots(id, form.date) : Promise.resolve(null)), [id, form.date]);
  const { data: availability, loading: slotsLoading, error: slotsError, reload: reloadSlots } = useAsync(loadSlots);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');
    setSubmitting(true);

    try {
      await appointmentApi.create({
        doctor_id: Number(id),
        appointment_date: form.date,
        start_time: form.time,
        reason: form.reason.trim(),
        payment_method: form.paymentMethod,
      });
      setBooked(true);
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Đặt lịch thất bại. Vui lòng thử lại.'));
      if (err.response?.status === 409) {
        // Khung giờ vừa bị người khác đặt: làm mới danh sách và bắt chọn lại.
        setField('time', '');
        reloadSlots();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageMessage>Đang tải thông tin lịch khám...</PageMessage>;
  if (error) return <PageMessage>Không tìm thấy bác sĩ để đặt lịch.</PageMessage>;

  if (booked) {
    return (
      <main className="section wrap">
        <div className="success-card">
          <CheckCircle size={56} />
          <h1>Đặt lịch thành công!</h1>
          <p>Lịch khám của bạn đã được ghi nhận và đang chờ bác sĩ xác nhận.</p>
          <Link className="btn btn-primary" to={ROUTES.account}>
            Xem lịch khám
          </Link>
        </div>
      </main>
    );
  }

  const fee = formatCurrency(doctor.fee);

  return (
    <main className="section wrap">
      <div className="page-title">
        <span className="eyebrow">ĐẶT LỊCH TRỰC TUYẾN</span>
        <h1>Thông tin lịch khám</h1>
        <p>Điền thông tin để hoàn tất yêu cầu đặt lịch.</p>
      </div>

      <div className="booking-layout">
        <form className="panel form" onSubmit={handleSubmit}>
          <h2>Thông tin khám bệnh</h2>

          <div className="field">
            <span>Bác sĩ</span>
            <div className="readonly">
              {doctor.full_name} – {doctor.specialty_name}
              <br />
              Làm việc: {formatWorkDays(doctor.work_days)}, {formatTime(doctor.start_time)} - {formatTime(doctor.end_time)}
            </div>
          </div>

          <label className="field">
            <span>Ngày khám</span>
            <input
              type="date"
              value={form.date}
              min={todayIso()}
              onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value, time: '' }))}
              required
            />
          </label>

          <div className="field">
            <span>Khung giờ</span>
            <SlotPicker
              date={form.date}
              availability={availability}
              loading={slotsLoading}
              error={slotsError}
              value={form.time}
              onChange={(time) => setField('time', time)}
            />
          </div>

          <label className="field">
            <span>Lý do khám</span>
            <textarea
              rows="4"
              maxLength={1000}
              value={form.reason}
              onChange={(event) => setField('reason', event.target.value)}
              placeholder="Mô tả triệu chứng hoặc nhu cầu khám..."
              required
            />
          </label>

          <div className="field">
            <span>Phương thức thanh toán</span>
            <Select
              label="Phương thức thanh toán"
              value={form.paymentMethod}
              onChange={(value) => setField('paymentMethod', value)}
              options={PAYMENT_OPTIONS}
            />
          </div>

          {submitError && (
            <p className="form-error" role="alert">
              {submitError}
            </p>
          )}

          <button className="btn btn-primary btn-block" type="submit" disabled={submitting || !form.time}>
            {submitting ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
          </button>
        </form>

        <aside className="panel booking-summary">
          <h2>Thông tin chi phí</h2>

          <div className="summary-doctor">
            <div className="mini-avatar">
              <User />
            </div>
            <div>
              <b>{doctor.full_name}</b>
              <small>{doctor.specialty_name}</small>
            </div>
          </div>

          <div className="summary-line">
            <span>Phí khám</span>
            <b>{fee}</b>
          </div>
          <div className="summary-line">
            <span>Thanh toán</span>
            <b>{form.paymentMethod}</b>
          </div>
          <div className="summary-total">
            <span>Tổng cộng</span>
            <b>{fee}</b>
          </div>
        </aside>
      </div>
    </main>
  );
}
