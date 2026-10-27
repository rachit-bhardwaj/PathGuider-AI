import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      const redirectTo = location.state?.from?.pathname || '/chat';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Welcome back</h1>
      <p className="mt-1.5 text-sm text-ink-soft">Sign in to continue your conversation with PathGuider AI.</p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="you@university.edu"
            className="w-full rounded-xl border border-transparent bg-paper px-3.5 py-2.5 text-sm outline-none transition focus:border-navy-600 focus:bg-surface focus:ring-2 focus:ring-navy-100"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-xl border border-transparent bg-paper px-3.5 py-2.5 pr-10 text-sm outline-none transition focus:border-navy-600 focus:bg-surface focus:ring-2 focus:ring-navy-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <HiOutlineEyeSlash className="h-4.5 w-4.5" /> : <HiOutlineEye className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-navy-600 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-navy-700 hover:shadow-lifted disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        New here?{' '}
        <Link to="/register" className="font-semibold text-navy-600 hover:text-navy-700">
          Create an account
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-ink-soft">
        Are you a counselor?{' '}
        <Link to="/counselor/register" className="font-semibold text-navy-600 hover:text-navy-700">
          Register as a counselor
        </Link>
      </p>

      <div className="mt-6 rounded-xl bg-paper px-3.5 py-2.5 text-center text-xs text-ink-soft">
        Demo admin: <span className="font-mono">admin@campus.edu</span> /{' '}
        <span className="font-mono">Admin@12345</span>
      </div>
    </div>
  );
}
