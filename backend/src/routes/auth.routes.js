import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { getMe, login, register, updateProfile } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const credentialsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Bạn thử quá nhiều lần. Vui lòng quay lại sau ít phút.' },
});

const emailRule = body('email').isString().trim().toLowerCase().isEmail().withMessage('Email không hợp lệ.');
const fullNameRule = body('full_name')
  .isString()
  .trim()
  .isLength({ min: 1, max: 120 })
  .withMessage('Vui lòng nhập họ tên (tối đa 120 ký tự).');
const phoneRule = body('phone')
  .optional({ values: 'falsy' })
  .isString()
  .trim()
  .matches(/^[0-9+()\s.-]{6,30}$/)
  .withMessage('Số điện thoại không hợp lệ.');

router.post(
  '/register',
  credentialsLimiter,
  [
    fullNameRule,
    emailRule,
    phoneRule,
    body('password').isString().isLength({ min: 6, max: 72 }).withMessage('Mật khẩu phải từ 6 đến 72 ký tự.'),
  ],
  validate,
  register,
);

router.post(
  '/login',
  credentialsLimiter,
  [emailRule, body('password').isString().notEmpty().withMessage('Vui lòng nhập mật khẩu.')],
  validate,
  login,
);

router.get('/me', authenticate, getMe);
router.patch('/profile', authenticate, [fullNameRule, phoneRule], validate, updateProfile);

export default router;
