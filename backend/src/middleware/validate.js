import { validationResult } from 'express-validator';

/** Trả về lỗi 400 với thông báo đầu tiên nếu các rule express-validator phía trước không đạt. */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({ message: errors.array()[0].msg });
};
