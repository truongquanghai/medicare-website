import { param } from 'express-validator';

export const idParam = (name = 'id') =>
  param(name).isInt({ min: 1 }).withMessage('Mã định danh không hợp lệ.').bail().toInt();
