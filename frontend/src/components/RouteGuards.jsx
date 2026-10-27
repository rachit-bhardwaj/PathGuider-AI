import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-paper">
        <div className="flex items-center gap-3 text-ink-soft">
          <span className="h-2 w-2 rounded-full bg-navy-600 thread-dot" />
          <span className="h-2 w-2 rounded-full bg-navy-600 thread-dot" />
          <span className="h-2 w-2 rounded-full bg-navy-600 thread-dot" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export function StaffRoute() {
  const { user } = useAuth();
  if (!user || !['admin', 'agent'].includes(user.role)) {
    return <Navigate to="/chat" replace />;
  }
  return <Outlet />;
}

export function AdminRoute() {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') {
    return <Navigate to="/chat" replace />;
  }
  return <Outlet />;
}
