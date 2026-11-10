import { pool } from '../config/db.js';
import { getDoctorSlots } from '../services/slotService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

const DOCTOR_SELECT = `
  SELECT d.id, d.user_id, d.degree, d.experience, d.bio, d.fee, d.work_days, d.start_time, d.end_time,
         u.full_name, u.phone,
         s.id AS specialty_id, s.name AS specialty_name,
         f.id AS facility_id, f.name AS facility_name, f.address AS facility_address
  FROM doctors d
  JOIN users u ON u.id = d.user_id
  JOIN specialties s ON s.id = d.specialty_id
  JOIN facilities f ON f.id = d.facility_id`;

const escapeLike = (value) => value.replace(/[\\%_]/g, '\\$&');

export const findDoctorById = async (id) => {
  const [rows] = await pool.query(`${DOCTOR_SELECT} WHERE d.id = ?`, [id]);
  return rows[0];
};

export const listDoctors = asyncHandler(async (req, res) => {
  const { q, specialty } = req.query;
  const conditions = [];
  const params = [];

  if (q) {
    conditions.push('u.full_name LIKE ?');
    params.push(`%${escapeLike(q)}%`);
  }
  if (specialty) {
    conditions.push('s.id = ?');
    params.push(specialty);
  }

  const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.query(`${DOCTOR_SELECT}${where} ORDER BY u.full_name`, params);
  res.json(rows);
});

export const getDoctor = asyncHandler(async (req, res) => {
  const doctor = await findDoctorById(req.params.id);
  if (!doctor) throw new HttpError(404, 'Không tìm thấy bác sĩ.');
  res.json(doctor);
});

export const getDoctorAvailability = asyncHandler(async (req, res) => {
  const doctor = await findDoctorById(req.params.id);
  if (!doctor) throw new HttpError(404, 'Không tìm thấy bác sĩ.');

  const { date } = req.query;
  const { isWorkingDay, slots } = await getDoctorSlots(doctor, date);
  res.json({ date, is_working_day: isWorkingDay, slots });
});
