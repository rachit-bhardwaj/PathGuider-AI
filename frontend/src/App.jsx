import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';
import { ProtectedRoute, StaffRoute } from './components/RouteGuards';
import {
  StudentOnlyRoute,
  CounselorOnlyRoute,
  StudentOrCounselorRoute,
  AdminOnlyRoute
} from './components/RoleRoutes';
import { useAuth } from './context/AuthContext';
import ResourcePage from './pages/ResourcePage';
import CounselorRegisterPage from './pages/CounselorRegisterPage';
import CounselorsPage from './pages/CounselorsPage';
import CounselorDetailPage from './pages/CounselorDetailPage';
import TicketsPage from './pages/TicketsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import CounselorSlotsPage from './pages/CounselorSlotsPage';
import CounselorProfilePage from './pages/CounselorProfilePage';
import AdminCounselorsPage from './pages/AdminCounselorsPage';

// Counselors have their own inbox instead of the student AI chat.
function ChatRoute() {
  const { user } = useAuth();
  if (user?.role === 'counselor') return <Navigate to="/counselor/inbox" replace />;
  return <ChatPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/resources/:slug" element={<ResourcePage />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/counselor/register" element={<CounselorRegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/chat" element={<ChatRoute />} />

          {/* Student: browse counselors, book slots */}
          <Route element={<StudentOnlyRoute />}>
            <Route path="/counselors" element={<CounselorsPage />} />
            <Route path="/counselors/:id" element={<CounselorDetailPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
          </Route>

          {/* Ticket chat is shared; the same component adapts to the role */}
          <Route element={<StudentOrCounselorRoute />}>
            <Route path="/tickets" element={<TicketsPage />} />
          </Route>

          {/* Counselor workspace */}
          <Route element={<CounselorOnlyRoute />}>
            <Route path="/counselor/inbox" element={<TicketsPage />} />
            <Route path="/counselor/slots" element={<CounselorSlotsPage />} />
            <Route path="/counselor/appointments" element={<AppointmentsPage />} />
            <Route path="/counselor/profile" element={<CounselorProfilePage />} />
          </Route>

          <Route element={<AdminOnlyRoute />}>
            <Route path="/admin/counselors" element={<AdminCounselorsPage />} />
          </Route>

          <Route element={<StaffRoute />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/dashboard" element={<Navigate to="/chat" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
