import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { HiOutlineChartBar, HiOutlineArrowRightOnRectangle, HiChevronDown } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/common/ThemeToggle';
import RoleNav from '../components/layout/RoleNav';
import toast from 'react-hot-toast';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out. See you soon!');
    navigate('/login');
  };

  const isStaff = user && ['admin', 'agent'].includes(user.role);

  return (
    <div className="flex h-screen flex-col bg-paper text-ink">
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-3 sm:px-4">
        <Link to="/chat" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-600 font-display text-sm font-bold text-white">
            P
          </div>
          <span className="hidden font-display text-base font-semibold text-navy-900 sm:inline">PathGuider AI</span>
        </Link>

        <div className="flex items-center gap-2">
          <RoleNav />
          {isStaff && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-paper hover:text-ink"
            >
              <HiOutlineChartBar className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          <ThemeToggle />

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-paper"
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: user?.avatarColor || '#7091E6' }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <HiChevronDown className={`h-3.5 w-3.5 text-ink-soft transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className="animate-fade-in-up absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-lifted">
                <div className="border-b border-border px-4 py-3">
                  <p className="truncate text-sm font-medium text-ink">{user?.name}</p>
                  <p className="truncate text-xs capitalize text-ink-soft">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-ink-soft transition-colors hover:bg-paper hover:text-ink"
                >
                  <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
