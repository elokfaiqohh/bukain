import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // redirect to appropriate dashboard
    const redirectTo = user.role === 'customer' ? '/user' : user.role === 'restaurant' ? '/restaurant' : '/admin';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
