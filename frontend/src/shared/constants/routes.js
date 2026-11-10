import { ROLES } from './appointment';

export const ROUTES = {
  home: '/',
  doctors: '/bac-si',
  doctorDetail: '/bac-si/:id',
  booking: '/dat-lich/:id',
  login: '/dang-nhap',
  register: '/dang-ky',
  account: '/tai-khoan',
  doctorDashboard: '/bac-si-dashboard',
  admin: '/quan-tri',
};

export const SECTION_IDS = {
  specialties: 'chuyen-khoa',
  facilities: 'co-so',
};

export const doctorPath = (id) => `/bac-si/${id}`;
export const bookingPath = (id) => `/dat-lich/${id}`;
export const sectionPath = (sectionId) => `/#${sectionId}`;

const HOME_BY_ROLE = {
  [ROLES.ADMIN]: ROUTES.admin,
  [ROLES.DOCTOR]: ROUTES.doctorDashboard,
  [ROLES.PATIENT]: ROUTES.account,
};

/** Trang làm việc mặc định của từng vai trò sau khi đăng nhập. */
export const getHomePathForRole = (role) => HOME_BY_ROLE[role] ?? ROUTES.home;
