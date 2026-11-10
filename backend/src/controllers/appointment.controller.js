import { pool } from '../config/db.js';
import {
  APPOINTMENT_STATUS,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  ROLES,
  canRoleSetStatus,
  canTransition,
} from '../constants/appointment.js';
import { getDoctorSlots } from '../services/slotService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { findDoctorById } from './doctor.controller.js';

const APPOINTMENT_SELECT = `
  SELECT a.id, a.patient_id, a.doctor_id, a.appointment_date, a.start_time, a.reason, a.fee,
         a.payment_method, a.payment_status, a.status, a.created_at,
         p.full_name AS patient_name, p.phone AS patient_phone,
         du.full_name AS doctor_name, s.name AS specialty_name, f.name AS facility_name
  FROM appointments a
  JOIN users p ON p.id = a.patient_id
  JOIN doctors d ON d.id = a.doctor_id
  JOIN users du ON du.id = d.user_id
  JOIN specialties s ON s.id = d.specialty_id
  JOIN facilities f ON f.id = d.facility_id`;

/** Mỗi vai trò chỉ thấy lịch khám của mình; quản trị viên thấy tất cả. */
const SCOPE_BY_ROLE = {
  [ROLES.PATIENT]: ' WHERE a.patient_id = ?',
  [ROLES.DOCTOR]: ' WHERE d.user_id = ?',
  [ROLES.ADMIN]: '',
};

export const listAppointments = asyncHandler(async (req, res) => {
  const { role, id } = req.user;
  const params = role === ROLES.ADMIN ? [] : [id];

  const [rows] = await pool.query(
    `${APPOINTMENT_SELECT}${SCOPE_BY_ROLE[role]} ORDER BY a.appointment_date DESC, a.start_time DESC`,
    params,
  );
  res.json(rows);
});

export const createAppointment = asyncHandler(async (req, res) => {
  const { doctor_id: doctorId, appointment_date: date, start_time: time, reason, payment_method: paymentMethod } = req.body;

  const doctor = await findDoctorById(doctorId);
  if (!doctor) throw new HttpError(404, 'Bác sĩ không tồn tại.');

  const { isWorkingDay, slots } = await getDoctorSlots(doctor, date);
  if (!isWorkingDay) throw new HttpError(400, 'Bác sĩ không làm việc vào ngày đã chọn.');

  const slot = slots.find((item) => item.time === time);
  if (!slot) throw new HttpError(400, 'Khung giờ nằm ngoài giờ làm việc của bác sĩ.');
  if (!slot.available) throw new HttpError(409, 'Khung giờ này đã có người đặt hoặc đã qua. Vui lòng chọn giờ khác.');

  const paymentStatus = paymentMethod === PAYMENT_METHODS.SIMULATED ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.UNPAID;

  try {
    const [result] = await pool.query(
      `INSERT INTO appointments
         (patient_id, doctor_id, appointment_date, start_time, reason, fee, payment_method, payment_status, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, doctorId, date, time, reason, doctor.fee, paymentMethod, paymentStatus, APPOINTMENT_STATUS.PENDING],
    );
    res.status(201).json({ id: result.insertId, message: 'Đặt lịch thành công. Vui lòng chờ bác sĩ xác nhận.' });
  } catch (error) {
    // Ràng buộc UNIQUE là chốt chặn cuối khi hai người đặt cùng lúc.
    if (error.code === 'ER_DUP_ENTRY') {
      throw new HttpError(409, 'Khung giờ này vừa có người đặt. Vui lòng chọn giờ khác.');
    }
    throw error;
  }
});

const isAppointmentParticipant = (user, appointment) =>
  user.role === ROLES.ADMIN ||
  (user.role === ROLES.PATIENT && appointment.patient_id === user.id) ||
  (user.role === ROLES.DOCTOR && appointment.doctor_user_id === user.id);

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const [rows] = await pool.query(
    `SELECT a.id, a.patient_id, a.status, d.user_id AS doctor_user_id
     FROM appointments a JOIN doctors d ON d.id = a.doctor_id
     WHERE a.id = ?`,
    [req.params.id],
  );
  const appointment = rows[0];
  if (!appointment) throw new HttpError(404, 'Không tìm thấy lịch khám.');

  if (!isAppointmentParticipant(req.user, appointment)) {
    throw new HttpError(403, 'Không có quyền cập nhật lịch này.');
  }
  if (!canRoleSetStatus(req.user.role, status)) {
    throw new HttpError(403, 'Bạn không thể thực hiện thao tác này.');
  }
  if (!canTransition(appointment.status, status)) {
    throw new HttpError(409, `Không thể chuyển lịch từ "${appointment.status}" sang "${status}".`);
  }

  // Điều kiện status giúp tránh ghi đè khi lịch vừa bị người khác đổi trạng thái.
  const [result] = await pool.query('UPDATE appointments SET status = ? WHERE id = ? AND status = ?', [
    status,
    appointment.id,
    appointment.status,
  ]);
  if (!result.affectedRows) throw new HttpError(409, 'Lịch khám vừa được cập nhật. Vui lòng tải lại trang.');

  res.json({ message: 'Cập nhật trạng thái thành công.' });
});
