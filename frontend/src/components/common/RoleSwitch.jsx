import { Link } from 'react-router-dom';

// Student / Counselor choice shown at the top of both registration forms.
export default function RoleSwitch({ active }) {
  const tab = (to, key, label) => (
    <Link
      to={to}
      className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-semibold transition ${
        active === key ? 'bg-navy-600 text-white shadow-soft' : 'text-ink-soft hover:text-ink'
      }`}
    >
      {label}
    </Link>
  );
  return (
    <div className="mb-6 flex rounded-xl bg-paper p-1">
      {tab('/register', 'student', 'I’m a student')}
      {tab('/counselor/register', 'counselor', 'I’m a counselor')}
    </div>
  );
}
