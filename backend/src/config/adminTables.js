import { body } from 'express-validator';
import { ROLES } from '../constants/appointment.js';
import { TIME_PATTERN, WORK_DAYS_PATTERN, toMinutes } from '../utils/schedule.js';

/**
 * Cấu hình CRUD quản trị. Khóa là tên bảng cho phép thao tác; `fields` là các cột được ghi;
 * `rules(isCreate)` trả về các rule kiểm tra dữ liệu (khi cập nhật, mọi trường đều tùy chọn).
 */

const field = (name, isCreate) => {
  const chain = body(name);
  return isCreate ? chain.exists({ values: 'falsy' }).withMessage(`Thiếu trường ${name}.`).bail() : chain.optional();
};

const text = (name, isCreate, { max, required = true, label }) => {
  const chain = required ? field(name, isCreate) : body(name).optional({ values: 'null' });
  return chain
    .isString()
    .withMessage(`${label} không hợp lệ.`)
    .bail()
    .trim()
    .isLength({ min: required ? 1 : 0, max })
    .withMessage(`${label} phải từ ${required ? 1 : 0} đến ${max} ký tự.`);
};

const positiveInt = (name, isCreate, label) =>
  field(name, isCreate).isInt({ min: 1 }).withMessage(`${label} không hợp lệ.`).toInt();

const optionalTime = (name, label) =>
  body(name).optional().matches(TIME_PATTERN).withMessage(`${label} phải có dạng HH:MM.`);

const endAfterStart = body('end_time')
  .custom((end, { req }) => !end || !req.body.start_time || toMinutes(end) > toMinutes(req.body.start_time))
  .withMessage('Giờ kết thúc phải sau giờ bắt đầu.');

export const adminTables = Object.freeze({
  users: {
    columns: 'id, full_name, email, phone, role, created_at',
    fields: ['full_name', 'email', 'phone', 'role'],
    rules: (isCreate) => [
      text('full_name', isCreate, { max: 120, label: 'Họ tên' }),
      field('email', isCreate).trim().toLowerCase().isEmail().withMessage('Email không hợp lệ.'),
      text('phone', isCreate, { max: 30, required: false, label: 'Số điện thoại' }),
      field('role', isCreate).isIn(Object.values(ROLES)).withMessage('Vai trò không hợp lệ.'),
      isCreate
        ? body('password').isLength({ min: 6, max: 72 }).withMessage('Mật khẩu phải từ 6 đến 72 ký tự.')
        : body('password').optional().isLength({ min: 6, max: 72 }).withMessage('Mật khẩu phải từ 6 đến 72 ký tự.'),
    ],
  },
  specialties: {
    columns: 'id, name, description',
    fields: ['name', 'description'],
    rules: (isCreate) => [
      text('name', isCreate, { max: 100, label: 'Tên chuyên khoa' }),
      text('description', isCreate, { max: 2000, required: false, label: 'Mô tả' }),
    ],
  },
  facilities: {
    columns: 'id, name, address, phone',
    fields: ['name', 'address', 'phone'],
    rules: (isCreate) => [
      text('name', isCreate, { max: 160, label: 'Tên cơ sở' }),
      text('address', isCreate, { max: 255, label: 'Địa chỉ' }),
      text('phone', isCreate, { max: 30, required: false, label: 'Số điện thoại' }),
    ],
  },
  doctors: {
    columns: '*',
    fields: [
      'user_id',
      'specialty_id',
      'facility_id',
      'degree',
      'experience',
      'bio',
      'fee',
      'work_days',
      'start_time',
      'end_time',
    ],
    rules: (isCreate) => [
      positiveInt('user_id', isCreate, 'Tài khoản bác sĩ'),
      positiveInt('specialty_id', isCreate, 'Chuyên khoa'),
      positiveInt('facility_id', isCreate, 'Cơ sở'),
      text('degree', isCreate, { max: 120, required: false, label: 'Học vị' }),
      text('experience', isCreate, { max: 80, required: false, label: 'Kinh nghiệm' }),
      text('bio', isCreate, { max: 5000, required: false, label: 'Giới thiệu' }),
      body('fee').optional().isFloat({ min: 0 }).withMessage('Phí khám không hợp lệ.').toFloat(),
      body('work_days').optional().matches(WORK_DAYS_PATTERN).withMessage('Ngày làm việc phải có dạng T2,T3,...,CN.'),
      optionalTime('start_time', 'Giờ bắt đầu'),
      optionalTime('end_time', 'Giờ kết thúc'),
      endAfterStart,
    ],
  },
});
