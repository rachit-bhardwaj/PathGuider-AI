import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <p className="font-display text-6xl font-semibold text-navy-600">404</p>
      <p className="mt-3 text-lg font-medium text-ink">This page took a wrong turn on campus.</p>
      <p className="mt-1 text-sm text-ink-soft">The page you're looking for doesn't exist or was moved.</p>
      <Link
        to="/"
        className="mt-6 rounded-xl bg-navy-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-navy-700"
      >
        Back to home
      </Link>
    </div>
  );
}
