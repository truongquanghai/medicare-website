import { Route, Routes } from 'react-router-dom';
import AccountPage from '../features/account/pages/AccountPage';
import BookingPage from '../features/appointments/pages/BookingPage';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import DoctorDetailPage from '../features/doctors/pages/DoctorDetailPage';
import DoctorListPage from '../features/doctors/pages/DoctorListPage';
import HomePage from '../features/home/pages/HomePage';
import { ROLES } from '../shared/constants/appointment';
import { ROUTES } from '../shared/constants/routes';
import NotFoundPage from './NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollManager from './components/ScrollManager';
import MainLayout from './layouts/MainLayout';

const protect = (element, allowedRoles) => <ProtectedRoute allowedRoles={allowedRoles}>{element}</ProtectedRoute>;

export default function App() {
  return (
    <MainLayout>
      <ScrollManager />
      <Routes>
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route path={ROUTES.doctors} element={<DoctorListPage />} />
        <Route path={ROUTES.doctorDetail} element={<DoctorDetailPage />} />
        <Route path={ROUTES.booking} element={protect(<BookingPage />, [ROLES.PATIENT])} />
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.register} element={<RegisterPage />} />
        <Route path={ROUTES.account} element={protect(<AccountPage />)} />
        <Route path={ROUTES.doctorDashboard} element={protect(<DashboardPage />, [ROLES.DOCTOR])} />
        <Route path={ROUTES.admin} element={protect(<DashboardPage />, [ROLES.ADMIN])} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MainLayout>
  );
}
