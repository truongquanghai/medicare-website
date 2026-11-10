export const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  PATIENT: 'patient',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Quản trị viên',
  [ROLES.DOCTOR]: 'Bác sĩ',
  [ROLES.PATIENT]: 'Bệnh nhân',
};

export const STATUS = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Đã hoàn thành',
  CANCELLED: 'Đã hủy',
  REJECTED: 'Bị từ chối',
};

/** Tên biến thể màu của huy hiệu trạng thái (khớp class `.status--*` trong CSS). */
export const STATUS_TONE = {
  [STATUS.PENDING]: 'pending',
  [STATUS.CONFIRMED]: 'confirmed',
  [STATUS.COMPLETED]: 'completed',
  [STATUS.CANCELLED]: 'cancelled',
  [STATUS.REJECTED]: 'cancelled',
};

export const PAYMENT_METHODS = {
  SIMULATED: 'Thanh toán mô phỏng',
  ON_SITE: 'Thanh toán tại cơ sở',
};

const ACTIONS = {
  confirm: { status: STATUS.CONFIRMED, label: 'Xác nhận', variant: 'primary' },
  reject: { status: STATUS.REJECTED, label: 'Từ chối', variant: 'danger', confirmMessage: 'Từ chối lịch khám này?' },
  complete: { status: STATUS.COMPLETED, label: 'Hoàn thành', variant: 'primary' },
  cancel: { status: STATUS.CANCELLED, label: 'Hủy lịch', variant: 'danger', confirmMessage: 'Bạn chắc chắn muốn hủy lịch khám này?' },
};

// Phản chiếu quy tắc chuyển trạng thái ở backend (constants/appointment.js); backend vẫn là nơi quyết định cuối cùng.
const ACTIONS_BY_ROLE = {
  [ROLES.PATIENT]: {
    [STATUS.PENDING]: [ACTIONS.cancel],
    [STATUS.CONFIRMED]: [ACTIONS.cancel],
  },
  [ROLES.DOCTOR]: {
    [STATUS.PENDING]: [ACTIONS.confirm, ACTIONS.reject],
    [STATUS.CONFIRMED]: [ACTIONS.complete],
  },
  [ROLES.ADMIN]: {
    [STATUS.PENDING]: [ACTIONS.confirm, ACTIONS.reject, ACTIONS.cancel],
    [STATUS.CONFIRMED]: [ACTIONS.complete, ACTIONS.cancel],
  },
};

export const getStatusActions = (role, status) => ACTIONS_BY_ROLE[role]?.[status] ?? [];
