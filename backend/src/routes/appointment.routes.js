import { Router } from 'express';
import { body } from 'express-validator';
import {
  createAppointment,
  listAppointments,
  updateAppointmentStatus,
} from '../controllers/appointment.controller.js';
import { APPOINTMENT_STATUS, PAYMENT_METHODS, ROLES } from '../constants/appointment.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { TIME_PATTERN, isValidDate } from '../utils/schedule.js';
import { idParam } from '../validators/common.js';

const router = Router();

router.use(authenticate);

router.get('/', listAppointments);

router.post(
  '/',
  authorize(ROLES.PATIENT),
  [
    body('doctor_id').isInt({ min: 1 }).withMessage('Vui lòng chọn bác sĩ.').toInt(),
    body('appointment_date').custom(isValidDate).withMessage('Ngày khám không hợp lệ.'),
    body('start_time').matches(TIME_PATTERN).withMessage('Giờ khám không hợp lệ.'),
    body('reason')
      .isString()
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Vui lòng nhập lý do khám (tối đa 1000 ký tự).'),
    body('payment_method')
      .optional()
      .isIn(Object.values(PAYMENT_METHODS))
      .withMessage('Phương thức thanh toán không hợp lệ.'),
    body('payment_method').default(PAYMENT_METHODS.ON_SITE),
  ],
  validate,
  createAppointment,
);

router.patch(
  '/:id/status',
  idParam(),
  body('status').isIn(Object.values(APPOINTMENT_STATUS)).withMessage('Trạng thái không hợp lệ.'),
  validate,
  updateAppointmentStatus,
);

export default router;
