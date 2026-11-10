import { pool } from '../config/db.js';
import { ROLES } from '../constants/appointment.js';
import { signToken } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { comparePassword, hashPassword, PUBLIC_USER_COLUMNS, toPublicUser } from '../utils/user.js';

const sessionResponse = (user) => ({ token: signToken(user), user: toPublicUser(user) });

export const register = asyncHandler(async (req, res) => {
  const { full_name: fullName, email, password, phone = '' } = req.body;

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length) throw new HttpError(409, 'Email đã được sử dụng.');

  const passwordHash = await hashPassword(password);
  const [result] = await pool.query(
    'INSERT INTO users (full_name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
    [fullName, email, passwordHash, phone, ROLES.PATIENT],
  );

  const user = { id: result.insertId, full_name: fullName, email, phone, role: ROLES.PATIENT };
  res.status(201).json(sessionResponse(user));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];
  const validCredentials = user && (await comparePassword(password, user.password_hash));
  if (!validCredentials) throw new HttpError(401, 'Email hoặc mật khẩu không chính xác.');

  res.json(sessionResponse(user));
});

export const getMe = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`SELECT ${PUBLIC_USER_COLUMNS} FROM users WHERE id = ?`, [req.user.id]);
  res.json(rows[0]);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { full_name: fullName, phone = '' } = req.body;

  await pool.query('UPDATE users SET full_name = ?, phone = ? WHERE id = ?', [fullName, phone, req.user.id]);

  const [rows] = await pool.query(`SELECT ${PUBLIC_USER_COLUMNS} FROM users WHERE id = ?`, [req.user.id]);
  res.json(rows[0]);
});
