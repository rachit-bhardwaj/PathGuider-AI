import { useEffect } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlinePhone } from 'react-icons/hi2';
import ThemeToggle from '../components/common/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { getResource, resources, HELPLINES } from '../data/resources';

export default function ResourcePage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const post = getResource(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (post) document.title = `${post.title} · PathGuider AI`;
    return () => {
      document.title = 'PathGuider AI';
    };
  }, [post]);

  if (!post) return <Navigate to="/" replace />;

  const others = resources.filter((r) => r.slug !== post.slug);
  const ctaTo = user?.role === 'student' ? '/counselors' : user ? '/chat' : '/register';

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-600 font-display text-base font-bold text-white">P</div>
            <span className="font-display text-lg font-semibold text-navy-900">PathGuider AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <Link to="/chat" className="rounded-xl bg-navy-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-navy-700">Open app</Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-ink-soft hover:text-ink">Sign in</Link>
                <Link to="/register" className="rounded-xl bg-navy-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-navy-700">Get started</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-10">
        <button
          onClick={() => {
            navigate('/');
            setTimeout(() => document.getElementById('resources')?.scrollIntoView(), 60);
          }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
        >
          <HiOutlineArrowLeft className="h-4 w-4" /> Back to resources
        </button>

        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-navy-600">
          {post.category} · {post.readTime}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">{post.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">{post.intro}</p>

        <img src={post.image} alt="" className="mt-8 h-64 w-full rounded-2xl object-cover shadow-soft sm:h-80" />

        <div className="mt-10 space-y-8">
          {post.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-display text-xl font-semibold text-ink">{s.heading}</h2>
              {s.body?.map((p) => (
                <p key={p.slice(0, 40)} className="mt-3 leading-relaxed text-ink-soft">{p}</p>
              ))}
              {s.list && (
                <ul className="mt-3 space-y-2">
                  {s.list.map((item) => (
                    <li key={item} className="flex gap-3 leading-relaxed text-ink-soft">
                      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navy-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* Helplines */}
        <aside className="mt-12 rounded-2xl border border-border bg-surface p-6 shadow-soft">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <HiOutlinePhone className="h-5 w-5 text-navy-600" /> Need to talk to someone now?
          </h2>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {HELPLINES.map((h) => (
              <li key={h.name} className="rounded-xl bg-paper p-4">
                <p className="text-sm font-semibold text-ink">{h.name}</p>
                <p className="mt-0.5 font-mono text-sm text-navy-600">{h.number}</p>
                <p className="mt-1 text-xs text-ink-soft">{h.note}</p>
              </li>
            ))}
          </ul>
        </aside>

        {/* CTA */}
        <div className="mt-8 rounded-2xl bg-navy-950 p-6 text-white sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <h2 className="font-display text-lg font-semibold">Want to talk this through with a person?</h2>
            <p className="mt-1 text-sm text-navy-100/70">Message a counselor privately or book a free in-person slot.</p>
          </div>
          <Link
            to={ctaTo}
            className="mt-4 inline-flex shrink-0 items-center gap-2 rounded-xl bg-gold-400 px-5 py-3 text-sm font-semibold text-navy-950 transition hover:bg-gold-400/90 sm:mt-0"
          >
            {user?.role === 'student' ? 'Find a counselor' : user ? 'Open app' : 'Create free account'}
            <HiOutlineArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-ink-soft">
          This article is for general information and is not a substitute for professional diagnosis or treatment.
        </p>

        {/* More reading */}
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="font-display text-lg font-semibold text-ink">Keep reading</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {others.map((r) => (
              <Link key={r.slug} to={`/resources/${r.slug}`} className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-soft transition hover:-translate-y-1 hover:shadow-lifted">
                <img src={r.image} alt="" className="h-32 w-full object-cover" />
                <div className="p-4">
                  <h3 className="font-display text-sm font-semibold text-ink">{r.title}</h3>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-navy-600">
                    Read <HiOutlineArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
