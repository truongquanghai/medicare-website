import { pool } from '../config/db.js';
import { adminTables } from '../config/adminTables.js';
import { APPOINTMENT_STATUS, ROLES } from '../constants/appointment.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { hashPassword } from '../utils/user.js';

const STATS_MONTHS = 6;

export const getStats = asyncHandler(async (req, res) => {
  const [[patients]] = await pool.query('SELECT COUNT(*) AS total FROM users WHERE role = ?', [ROLES.PATIENT]);
  const [[doctors]] = await pool.query('SELECT COUNT(*) AS total FROM doctors');
  const [[appointments]] = await pool.query('SELECT COUNT(*) AS total FROM appointments');
  const [[revenue]] = await pool.query(
    'SELECT COALESCE(SUM(fee), 0) AS total FROM appointments WHERE status IN (?)',
    [[APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.COMPLETED]],
  );
  const [recentMonths] = await pool.query(
    `SELECT DATE_FORMAT(appointment_date, '%Y-%m') AS month, COUNT(*) AS total
     FROM appointments
     GROUP BY DATE_FORMAT(appointment_date, '%Y-%m')
     ORDER BY month DESC
     LIMIT ?`,
    [STATS_MONTHS],
  );

  res.json({
    patients: patients.total,
    doctors: doctors.total,
    appointments: appointments.total,
    revenue: Number(revenue.total),
    monthly: recentMonths.reverse(),
  });
});

const getTable = (req) => adminTables[req.params.table];

const pickFields = (table, body) =>
  Object.fromEntries(table.fields.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));

const assertDoctorAccount = async (userId) => {
  const [rows] = await pool.query('SELECT role FROM users WHERE id = ?', [userId]);
  if (!rows.length || rows[0].role !== ROLES.DOCTOR) {
    throw new HttpError(400, 'Tài khoản được chọn không tồn tại hoặc không có vai trò bác sĩ.');
  }
};

export const listRecords = asyncHandler(async (req, res) => {
  const table = getTable(req);
  const [rows] = await pool.query(`SELECT ${table.columns} FROM \`${req.params.table}\` ORDER BY id DESC`);
  res.json(rows);
});

export const createRecord = asyncHandler(async (req, res) => {
  const tableName = req.params.table;
  const data = pickFields(getTable(req), req.body);

  if (tableName === 'users') data.password_hash = await hashPassword(req.body.password);
  if (tableName === 'doctors') await assertDoctorAccount(data.user_id);

  const columns = Object.keys(data);
  const [result] = await pool.query(
    `INSERT INTO \`${tableName}\` (${columns.map((column) => `\`${column}\``).join(', ')})
     VALUES (${columns.map(() => '?').join(', ')})`,
    Object.values(data),
  );

  res.status(201).json({ id: result.insertId, message: 'Thêm dữ liệu thành công.' });
});

export const updateRecord = asyncHandler(async (req, res) => {
  const tableName = req.params.table;
  const data = pickFields(getTable(req), req.body);

  if (tableName === 'users') {
    if (req.params.id === req.user.id && data.role && data.role !== req.user.role) {
      throw new HttpError(400, 'Không thể tự thay đổi vai trò của chính mình.');
    }
    if (req.body.password) data.password_hash = await hashPassword(req.body.password);
  }
  if (tableName === 'doctors' && data.user_id !== undefined) await assertDoctorAccount(data.user_id);

  const columns = Object.keys(data);
  if (!columns.length) throw new HttpError(400, 'Thiếu dữ liệu cần cập nhật.');

  const [result] = await pool.query(
    `UPDATE \`${tableName}\` SET ${columns.map((column) => `\`${column}\` = ?`).join(', ')} WHERE id = ?`,
    [...Object.values(data), req.params.id],
  );
  if (!result.affectedRows) throw new HttpError(404, 'Không tìm thấy bản ghi.');

  res.json({ message: 'Cập nhật thành công.' });
});

export const deleteRecord = asyncHandler(async (req, res) => {
  const tableName = req.params.table;
  if (tableName === 'users' && req.params.id === req.user.id) {
    throw new HttpError(400, 'Không thể xóa tài khoản đang đăng nhập.');
  }

  const [result] = await pool.query(`DELETE FROM \`${tableName}\` WHERE id = ?`, [req.params.id]);
  if (!result.affectedRows) throw new HttpError(404, 'Không tìm thấy bản ghi.');

  res.json({ message: 'Xóa dữ liệu thành công.' });
});
