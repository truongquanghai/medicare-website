import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

const TOKEN_TTL = '12h';

export const signToken = (user) => jwt.sign({ id: user.id }, env.jwtSecret, { expiresIn: TOKEN_TTL });

const readBearerToken = (req) => (req.headers.authorization || '').replace(/^Bearer\s+/i, '');

/** Xác thực JWT và nạp vai trò hiện tại từ cơ sở dữ liệu (thay đổi vai trò/xóa tài khoản có hiệu lực ngay). */
export const authenticate = asyncHandler(async (req, res, next) => {
  const token = readBearerToken(req);
  if (!token) throw new HttpError(401, 'Vui lòng đăng nhập.');

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new HttpError(401, 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.');
  }

  const [rows] = await pool.query('SELECT id, role FROM users WHERE id = ?', [payload.id]);
  if (!rows.length) throw new HttpError(401, 'Tài khoản không còn tồn tại.');

  req.user = rows[0];
  next();
});

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return next(new HttpError(403, 'Bạn không có quyền thực hiện chức năng này.'));
  }
  return next();
};
