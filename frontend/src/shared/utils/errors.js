/** Thông điệp lỗi thân thiện từ phản hồi của API; dùng `fallback` nếu không có thông tin cụ thể. */
export function getErrorMessage(error, fallback) {
  const apiMessage = error?.response?.data?.message;
  if (apiMessage) return apiMessage;
  if (error?.code === 'ERR_NETWORK' || error?.code === 'ECONNABORTED') {
    return 'Không kết nối được tới máy chủ. Vui lòng thử lại sau.';
  }
  return fallback;
}
