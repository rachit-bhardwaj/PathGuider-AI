import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  HiOutlineUserGroup,
  HiOutlineInboxStack,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineUserCircle,
  HiOutlineSparkles,
  HiOutlineShieldCheck
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { getCounselorTickets } from '../../services/counselorService';

const studentLinks = [
  { to: '/chat', label: 'AI Chat', icon: HiOutlineSparkles },
  { to: '/counselors', label: 'Counselors', icon: HiOutlineUserGroup },
  { to: '/tickets', label: 'My tickets', icon: HiOutlineInboxStack, badge: true },
  { to: '/appointments', label: 'Appointments', icon: HiOutlineCalendarDays }
];

const counselorLinks = [
  { to: '/counselor/inbox', label: 'Inbox', icon: HiOutlineInboxStack, badge: true },
  { to: '/counselor/slots', label: 'My slots', icon: HiOutlineClock },
  { to: '/counselor/appointments', label: 'Appointments', icon: HiOutlineCalendarDays },
  { to: '/counselor/profile', label: 'Profile', icon: HiOutlineUserCircle }
];

const adminLinks = [{ to: '/admin/counselors', label: 'Counselors', icon: HiOutlineShieldCheck }];

// Unread-message count, refreshed every 30s while the tab is visible.
function useUnread(enabled) {
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    let id;
    const load = async () => {
      if (document.hidden) return;
      try {
        const { unreadTotal } = await getCounselorTickets();
        if (!cancelled) setUnread(unreadTotal);
      } catch (err) {
        // 401/403 = this account can't use tickets (e.g. role changed): stop asking.
        if (err.status === 401 || err.status === 403) clearInterval(id);
      }
    };
    load();
    id = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [enabled]);
  return unread;
}

export default function RoleNav() {
  const { user } = useAuth();
  const role = user?.role;
  const unread = useUnread(role === 'student' || role === 'counselor');

  const links = role === 'student' ? studentLinks : role === 'counselor' ? counselorLinks : role === 'admin' ? adminLinks : [];
  if (!links.length) return null;

  return (
    <nav className="flex items-center gap-0.5 sm:gap-1">
      {links.map(({ to, label, icon: Icon, badge }) => (
        <NavLink
          key={to}
          to={to}
          title={label}
          className={({ isActive }) =>
            `relative flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors sm:px-3 ${
              isActive ? 'bg-navy-50 text-navy-600' : 'text-ink-soft hover:bg-paper hover:text-ink'
            }`
          }
        >
          <Icon className="h-4 w-4" />
          <span className="hidden lg:inline">{label}</span>
          {badge && unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
