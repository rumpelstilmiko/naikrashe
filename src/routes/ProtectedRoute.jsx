import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import Forbidden from '../pages/Forbidden';

export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Forbidden />;
  return children ?? <Outlet />;
}
