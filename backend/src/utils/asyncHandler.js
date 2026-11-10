/** Chuyển lỗi của handler async sang middleware xử lý lỗi của Express 4. */
export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};
