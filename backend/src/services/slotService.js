import { pool } from '../config/db.js';
import { INACTIVE_STATUSES } from '../constants/appointment.js';
import { buildSlots, isSlotInPast, isWorkingDay, trimSeconds } from '../utils/schedule.js';

/**
 * Các khung giờ khám của bác sĩ trong một ngày, kèm trạng thái còn trống.
 * Khung đã có lịch còn hiệu lực hoặc đã qua giờ hiện tại thì không còn trống.
 */
export async function getDoctorSlots(doctor, date) {
  if (!isWorkingDay(doctor.work_days, date)) {
    return { isWorkingDay: false, slots: [] };
  }

  const [booked] = await pool.query(
    'SELECT start_time FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND status NOT IN (?)',
    [doctor.id, date, INACTIVE_STATUSES],
  );
  const bookedTimes = new Set(booked.map((row) => trimSeconds(row.start_time)));

  const slots = buildSlots(trimSeconds(doctor.start_time), trimSeconds(doctor.end_time)).map((time) => ({
    time,
    available: !bookedTimes.has(time) && !isSlotInPast(date, time),
  }));

  return { isWorkingDay: true, slots };
}
