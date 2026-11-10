import { HttpError } from '../utils/httpError.js';

export const notFoundHandler = (req, res) => {
  res.status(404).json({ message: 'Không tìm thấy đường dẫn yêu cầu.' });
};

const BODY_PARSER_ERRORS = {
  'entity.parse.failed': [400, 'Dữ liệu gửi lên không phải JSON hợp lệ.'],
  'entity.too.large': [413, 'Dữ liệu gửi lên quá lớn.'],
};

const DATABASE_ERRORS = {
  ER_DUP_ENTRY: [409, 'Dữ liệu đã tồn tại.'],
  ER_ROW_IS_REFERENCED_2: [409, 'Không thể xóa dữ liệu đang được sử dụng.'],
  ER_NO_REFERENCED_ROW_2: [400, 'Dữ liệu liên kết không tồn tại.'],
};

// Express nhận diện middleware lỗi qua đủ 4 tham số.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }

  const [status, message] = BODY_PARSER_ERRORS[err.type] ?? DATABASE_ERRORS[err.code] ?? [];
  if (status) return res.status(status).json({ message });

  console.error(err);
  return res.status(500).json({ message: 'Lỗi máy chủ. Vui lòng thử lại.' });
};
