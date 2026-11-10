import { Navigate, useLocation } from 'react-router-dom';
import PageMessage from '../../shared/components/PageMessage';
import { getHomePathForRole, ROUTES } from '../../shared/constants/routes';
import { useAuth } from '../providers/authContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageMessage>Đang xác thực...</PageMessage>;

  if (!user) {
    return <Navigate to={ROUTES.login} replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getHomePathForRole(user.role)} replace />;
  }

  return children;
}
