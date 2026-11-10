import { Router } from 'express';
import { query } from 'express-validator';
import { listFacilities, listSpecialties } from '../controllers/catalog.controller.js';
import { getDoctor, getDoctorAvailability, listDoctors } from '../controllers/doctor.controller.js';
import { validate } from '../middleware/validate.js';
import { isValidDate } from '../utils/schedule.js';
import { idParam } from '../validators/common.js';

const router = Router();

router.get('/specialties', listSpecialties);
router.get('/facilities', listFacilities);

router.get(
  '/doctors',
  [
    query('q').optional().isString().trim().isLength({ max: 120 }).withMessage('Từ khóa tìm kiếm quá dài.'),
    query('specialty').optional().isInt({ min: 1 }).withMessage('Chuyên khoa không hợp lệ.').toInt(),
  ],
  validate,
  listDoctors,
);
router.get('/doctors/:id', idParam(), validate, getDoctor);
router.get(
  '/doctors/:id/slots',
  idParam(),
  query('date').custom(isValidDate).withMessage('Ngày khám phải có dạng YYYY-MM-DD.'),
  validate,
  getDoctorAvailability,
);

export default router;
