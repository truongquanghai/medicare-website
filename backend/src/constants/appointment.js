export const ROLES = Object.freeze({
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  PATIENT: 'patient',
});

export const APPOINTMENT_STATUS = Object.freeze({
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Đã hoàn thành',
  CANCELLED: 'Đã hủy',
  REJECTED: 'Bị từ chối',
});

/** Trạng thái đã giải phóng khung giờ (người khác có thể đặt lại). */
export const INACTIVE_STATUSES = Object.freeze([APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.REJECTED]);

/** Trạng thái được phép chuyển tiếp từ một trạng thái hiện tại. */
const TRANSITIONS = Object.freeze({
  [APPOINTMENT_STATUS.PENDING]: [
    APPOINTMENT_STATUS.CONFIRMED,
    APPOINTMENT_STATUS.REJECTED,
    APPOINTMENT_STATUS.CANCELLED,
  ],
  [APPOINTMENT_STATUS.CONFIRMED]: [APPOINTMENT_STATUS.COMPLETED, APPOINTMENT_STATUS.CANCELLED],
});

/** Trạng thái đích mà mỗi vai trò được phép đặt. */
const ROLE_TARGETS = Object.freeze({
  [ROLES.PATIENT]: [APPOINTMENT_STATUS.CANCELLED],
  [ROLES.DOCTOR]: [APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.REJECTED, APPOINTMENT_STATUS.COMPLETED],
  [ROLES.ADMIN]: Object.values(APPOINTMENT_STATUS).filter((status) => status !== APPOINTMENT_STATUS.PENDING),
});

export const canTransition = (from, to) => (TRANSITIONS[from] ?? []).includes(to);

export const canRoleSetStatus = (role, status) => (ROLE_TARGETS[role] ?? []).includes(status);

export const PAYMENT_METHODS = Object.freeze({
  SIMULATED: 'Thanh toán mô phỏng',
  ON_SITE: 'Thanh toán tại cơ sở',
});

export const PAYMENT_STATUS = Object.freeze({
  PAID: 'Đã thanh toán',
  UNPAID: 'Chưa thanh toán',
});
