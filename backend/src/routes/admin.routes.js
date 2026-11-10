import { Router } from 'express';
import { param } from 'express-validator';
import { adminTables } from '../config/adminTables.js';
import {
  createRecord,
  deleteRecord,
  getStats,
  listRecords,
  updateRecord,
} from '../controllers/admin.controller.js';
import { ROLES } from '../constants/appointment.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParam } from '../validators/common.js';

const router = Router();

router.use(authenticate, authorize(ROLES.ADMIN));

const tableParam = param('table')
  .isIn(Object.keys(adminTables))
  .withMessage('Bảng không hợp lệ.');

/** Chạy các rule dữ liệu riêng của bảng đang thao tác. */
const validateTableBody = (isCreate) => async (req, res, next) => {
  const rules = adminTables[req.params.table].rules(isCreate);
  await Promise.all(rules.map((rule) => rule.run(req)));
  next();
};

router.get('/stats', getStats);

router.get('/:table', tableParam, validate, listRecords);
router.post('/:table', tableParam, validate, validateTableBody(true), validate, createRecord);
router.put('/:table/:id', tableParam, idParam(), validate, validateTableBody(false), validate, updateRecord);
router.delete('/:table/:id', tableParam, idParam(), validate, deleteRecord);

export default router;
