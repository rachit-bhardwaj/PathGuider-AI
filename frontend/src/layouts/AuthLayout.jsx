import { Outlet, Link, useLocation } from 'react-router-dom';
import ThemeToggle from '../components/common/ThemeToggle';

const artwork = {
  '/login': {
    src: '/images/login.jpg',
    heading: 'Welcome back to PathGuider AI',
    sub: 'Pick up right where you left off — your conversations and answers are waiting.'
  },
  '/register': {
    src: '/images/signup.jpg',
    heading: 'Join PathGuider AI',
    sub: 'Instant answers on campus life, and a direct line to real counselors whenever you need one.'
  }
};

export default function AuthLayout() {
  const { pathname } = useLocation();
  const art = artwork[pathname] || (pathname === '/counselor/register' ? artwork['/register'] : artwork['/login']);

  return (
    <div className="flex min-h-screen bg-paper">
      {/* Illustration panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-navy-950 lg:block">
        <img src={art.src} alt="" className="h-full w-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/20 to-navy-950/40" />
        <Link to="/" className="absolute left-8 top-8 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-400 font-display text-base font-bold text-navy-950">
            P
          </div>
          <span className="font-display text-lg font-semibold text-white">PathGuider AI</span>
        </Link>
        <div className="absolute inset-x-0 bottom-0 p-10">
          <h2 className="font-display text-2xl font-medium text-white">{art.heading}</h2>
          <p className="mt-2 max-w-sm text-sm text-navy-100/70">{art.sub}</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="absolute right-6 top-6">
          <ThemeToggle />
        </div>

        <div className="animate-fade-in-up w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-600 font-display text-base font-bold text-white">
              P
            </div>
            <span className="font-display text-lg font-semibold text-navy-900">PathGuider AI</span>
          </Link>

          <div className="rounded-2xl border border-border bg-surface p-8 shadow-soft">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
