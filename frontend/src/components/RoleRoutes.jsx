import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Where each role lands when it tries to open a page that is not theirs.
const homeFor = (role) => {
  if (role === 'counselor') return '/counselor/inbox';
  if (role === 'admin' || role === 'agent') return '/admin';
  return '/chat';
};

export function StudentOnlyRoute() {
  const { user } = useAuth();
  if (!user || user.role !== 'student') return <Navigate to={user ? homeFor(user.role) : '/login'} replace />;
  return <Outlet />;
}

export function CounselorOnlyRoute() {
  const { user } = useAuth();
  if (!user || user.role !== 'counselor') return <Navigate to={user ? homeFor(user.role) : '/login'} replace />;
  return <Outlet />;
}

// Used for pages both students and counselors share (tickets, appointments).
export function StudentOrCounselorRoute() {
  const { user } = useAuth();
  if (!user || !['student', 'counselor'].includes(user.role)) {
    return <Navigate to={user ? homeFor(user.role) : '/login'} replace />;
  }
  return <Outlet />;
}

export function AdminOnlyRoute() {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') return <Navigate to={user ? homeFor(user.role) : '/login'} replace />;
  return <Outlet />;
}
