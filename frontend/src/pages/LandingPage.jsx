import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineAcademicCap,
  HiOutlineBanknotes,
  HiOutlineHome,
  HiOutlineWrenchScrewdriver,
  HiOutlineHeart,
  HiOutlineDocumentText,
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineUserGroup,
  HiStar,
  HiBars3,
  HiXMark
} from 'react-icons/hi2';
import Reveal from '../components/common/Reveal';
import FaqAccordion from '../components/common/FaqAccordion';
import ThemeToggle from '../components/common/ThemeToggle';

const categories = [
  { icon: HiOutlineDocumentText, label: 'Admissions', desc: 'Application status, decisions, and deadlines.' },
  { icon: HiOutlineBanknotes, label: 'Financial Aid', desc: 'FAFSA, scholarships, and disbursements.' },
  { icon: HiOutlineAcademicCap, label: 'Academics', desc: 'Registration, add/drop, and course policy.' },
  { icon: HiOutlineHome, label: 'Housing', desc: 'Applications, assignments, and move-in.' },
  { icon: HiOutlineWrenchScrewdriver, label: 'Technical', desc: 'Portal logins and IT support.' },
  { icon: HiOutlineHeart, label: 'Wellness', desc: 'Counseling and campus resources.' }
];

const steps = [
  {
    title: 'Start a conversation',
    desc: 'Sign in and ask PathGuider AI anything — no forms, no waiting for office hours.'
  },
  {
    title: 'Get a grounded answer',
    desc: 'Every response is pulled from your university\u2019s real policies and knowledge base.'
  },
  {
    title: 'Talk to a person if you need to',
    desc: 'For anything deeper, we connect you with a real counselor who can take it from there.'
  }
];

const counselors = [
  {
    name: 'Ruchika Gupta',
    role: 'Academic & Career Counselor',
    image: '/images/counselor-1.jpg',
    experience: '7+ years',
    availability: 'Mon\u2013Fri, 12pm\u20135pm',
    languages: 'English, Hindi'
  },
  {
    name: 'Vibhor Sharma',
    role: 'Personal Wellness Counselor',
    image: '/images/counselor-2.jpg',
    experience: '5+ years',
    availability: 'Mon\u2013Fri, 10am\u20133pm',
    languages: 'English, Hindi'
  },
  {
    name: 'Anju Verma',
    role: 'Mental Health Counselor',
    image: '/images/counselor-3.jpg',
    experience: '9+ years',
    availability: 'Tue\u2013Sat, 11am\u20134pm',
    languages: 'English, Hindi, Punjabi'
  }
];

const resources = [
  {
    image: '/images/blog-1.jpg',
    slug: 'types-of-abuse',
    title: '7 Types of Abuse and How to Recognize Them',
    desc: 'Learn to distinguish the different forms of abuse and their characteristics.'
  },
  {
    image: '/images/blog-2.jpg',
    slug: 'anxiety-disorders',
    title: 'Anxiety Disorders: Types, Symptoms, and Treatment',
    desc: 'We all feel anxious sometimes — here\u2019s how to tell when it\u2019s something more.'
  },
  {
    image: '/images/blog-3.jpg',
    slug: 'trauma-and-ptsd',
    title: 'Understanding Trauma and Supporting Someone with PTSD',
    desc: 'What trauma is, how it shows up, and how to help someone cope with it.'
  }
];

const testimonials = [
  {
    quote:
      'PathGuider AI was a game-changer during my struggles. Quick answers when I needed them, and real counselors when I needed more. It\u2019s more than a chatbot \u2014 it\u2019s a trusted support system.',
    name: 'Anshika Sharma'
  },
  {
    quote:
      'It helped me manage academic pressure and personal challenges at the same time. Fast answers on deadlines, and a warm handoff to a counselor for everything else.',
    name: 'Nitin Sharma'
  }
];

const faqs = [
  {
    question: 'How can I create an account on PathGuider AI?',
    answer:
      'Go to the login page and select Sign Up, fill in your details, choose a secure password, and your account is ready \u2014 you can start chatting immediately.'
  },
  {
    question: 'Who is PathGuider AI for?',
    answer:
      'Any student at your university, across every program, looking for quick answers on campus life or a safe space to talk through academic and personal challenges.'
  },
  {
    question: 'What can I ask, and is it free?',
    answer:
      'Anything from financial aid deadlines to academic stress and career planning. PathGuider AI is completely free for all students.'
  },
  {
    question: 'Is this a replacement for therapy?',
    answer:
      'No. PathGuider AI provides quick answers and short-term support, and can route you to a licensed counselor for anything that needs deeper care.'
  },
  {
    question: 'Are my conversations confidential?',
    answer:
      'Yes \u2014 every conversation is private, so you can ask freely without fear of judgment or a breach of privacy.'
  }
];

export default function LandingPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast.success(`Thanks ${contactForm.name.split(' ')[0] || 'there'} \u2014 we\u2019ll get back to you soon!`);
      setContactForm({ name: '', email: '', message: '' });
      setSending(false);
    }, 500);
  };

  return (
    <div className="min-h-screen  bg-paper text-ink">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-600 font-display text-base font-bold text-white">
              P
            </div>
            <span className="font-display text-lg font-semibold text-navy-900">PathGuider AI</span>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-medium text-ink-soft md:flex">
            <a href="#about" className="transition-colors hover:text-ink">
              About
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-ink">
              How it works
            </a>
            <a href="#counselors" className="transition-colors hover:text-ink">
              Counselors
            </a>
            <a href="#resources" className="transition-colors hover:text-ink">
              Resources
            </a>
            <a href="#faq" className="transition-colors hover:text-ink">
              FAQ
            </a>
            <a href="#contact" className="transition-colors hover:text-ink">
              Contact
            </a>
            <Link to="/counselor/register" className="font-semibold text-navy-600 transition-colors hover:text-navy-700">
              For counselors
            </Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <Link to="/login" className="text-sm font-medium text-ink-soft transition-colors hover:text-ink">
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-navy-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-navy-700 hover:shadow-lifted"
            >
              Get started
            </Link>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <button
              className="rounded-lg p-2 text-navy-900"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <HiXMark className="h-6 w-6" /> : <HiBars3 className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="animate-fade-in-up border-t border-border bg-surface px-6 py-4 md:hidden">
            <nav className="flex flex-col gap-3 text-sm font-medium text-ink-soft">
              <a href="#about" onClick={() => setMobileNavOpen(false)}>
                About
              </a>
              <a href="#how-it-works" onClick={() => setMobileNavOpen(false)}>
                How it works
              </a>
              <a href="#counselors" onClick={() => setMobileNavOpen(false)}>
                Counselors
              </a>
              <a href="#resources" onClick={() => setMobileNavOpen(false)}>
                Resources
              </a>
              <a href="#faq" onClick={() => setMobileNavOpen(false)}>
                FAQ
              </a>
              <a href="#contact" onClick={() => setMobileNavOpen(false)}>
                Contact
              </a>
              <Link to="/counselor/register" className="font-semibold text-navy-600">
                Register as a counselor
              </Link>
              <div className="mt-2 flex items-center gap-4 border-t border-border pt-4">
                <Link to="/login" className="text-ink">
                  Sign in
                </Link>
                <Link to="/register" className="font-semibold text-navy-600">
                  Get started
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="top" className="relative overflow-hidden bg-navy-950 text-white">
        <div
          className="animate-ambient-pulse pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 25%, #ADBBDA 0%, transparent 30%), radial-gradient(circle at 85% 75%, #7091E6 0%, transparent 35%)'
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-in-up">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gold-400">
                <HiOutlineSparkles className="h-3.5 w-3.5" />
                AI-powered student support
              </span>
              <h1 className="mt-5 font-display text-4xl font-medium leading-tight sm:text-5xl">
                Ask anything.
                <br />
                Talk to someone who listens.
              </h1>
              <p className="mt-5 max-w-md text-navy-100/70">
                PathGuider AI answers questions about admissions, aid, academics, housing, and more &mdash; grounded
                in your university's own knowledge base, and always ready to connect you with a real counselor when
                it matters.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/register"
                  className="flex items-center gap-2 rounded-xl bg-gold-400 px-5 py-3 text-sm font-semibold text-navy-950 shadow-soft transition hover:-translate-y-0.5 hover:bg-gold-400/90 hover:shadow-lifted"
                >
                  Start a conversation
                  <HiOutlineArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/login" className="text-sm font-medium text-navy-100/80 hover:text-white">
                  I already have an account
                </Link>
              </div>
            </div>

            <div className="animate-fade-in-up rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lifted backdrop-blur [animation-delay:150ms]">
              <div className="rounded-xl bg-black/30 p-4">
                <div className="mb-3 flex items-center gap-2 text-xs text-navy-100/60">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-gold-400" />
                  PathGuider AI &middot; typing…
                </div>
                <div className="space-y-3">
                  <div className="ml-auto max-w-[80%] rounded-xl rounded-tr-sm bg-navy-600 px-3 py-2 text-sm">
                    When is the FAFSA deadline this year?
                  </div>
                  <div className="max-w-[85%] rounded-xl rounded-tl-sm border-l-2 border-gold-400 bg-white/10 px-3 py-2 text-sm">
                    Priority deadline is typically early spring &mdash; I'll pull the exact date from the Financial
                    Aid Office's page and confirm before you submit.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-wider text-navy-600">About PathGuider AI</span>
            <h2 className="mt-3 font-display text-3xl font-semibold text-ink">
              A safe, confidential space &mdash; backed by AI and real people
            </h2>
            <p className="mt-4 text-ink-soft">
              Everyone faces moments of stress, self-doubt, and uncertainty. PathGuider AI gives you instant, grounded
              answers to the everyday questions that pile up, and a direct line to trained counselors &mdash;
              dedicated professors and mentors from your college &mdash; for everything that needs a human touch.
            </p>
            <p className="mt-4 text-ink-soft">
              Our mission is to help you reduce academic stress, get career guidance, and communicate freely, so you
              can find clarity and thrive in both your personal and professional journey.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div>
                <p className="font-display text-2xl font-semibold text-navy-900">24/7</p>
                <p className="text-xs text-ink-soft">Always available</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-navy-900">6</p>
                <p className="text-xs text-ink-soft">Support categories</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-navy-900">100%</p>
                <p className="text-xs text-ink-soft">Confidential</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={150} className="relative">
            <div className="animate-float rounded-3xl bg-navy-50 p-6 shadow-soft">
              <img
                src="/images/hero.png"
                alt="Illustration of a student receiving guidance"
                className="mx-auto w-full max-w-sm"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-surface py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-3xl font-semibold text-ink">3 simple steps</h2>
            <p className="mt-3 text-ink-soft">The most straightforward and accessible experience for students.</p>
          </Reveal>

          <div className="relative mt-14 grid grid-cols-1 gap-10 md:grid-cols-3">
            <div className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px bg-border-strong md:block" />
            {steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 120} className="relative text-center">
                <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy-600 font-display text-lg font-semibold text-white shadow-soft">
                  {i + 1}
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{step.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Assistant categories */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold text-ink">Six areas of campus life, one assistant</h2>
          <p className="mt-2 max-w-xl text-sm text-ink-soft">
            Every answer is grounded in your school's real policies, and every conversation can hand off to a real
            counselor whenever you need one.
          </p>
        </Reveal>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(({ icon: Icon, label, desc }, i) => (
            <Reveal key={label} delay={i * 80}>
              <div className="group h-full rounded-2xl border border-border bg-surface p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-lifted">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-600 transition-colors group-hover:bg-navy-600 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-3 font-medium text-ink">{label}</p>
                <p className="mt-1 text-sm text-ink-soft">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Counselors */}
      <section id="counselors" className="bg-navy-950 py-20 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gold-400">
              <HiOutlineUserGroup className="h-3.5 w-3.5" />
              When you want a human
            </span>
            <h2 className="mt-4 font-display text-3xl font-semibold">Meet a few of our counselors</h2>
            <p className="mt-3 text-navy-100/70">
              Real professors and mentors from your college, ready to listen whenever PathGuider AI hands things off.
            </p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {counselors.map((c, i) => (
              <Reveal key={c.name} delay={i * 100}>
                <div className="flip-card h-80 w-full">
                  <div className="flip-card-inner">
                    <div className="flip-card-front flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                      <img
                        src={c.image}
                        alt={c.name}
                        className="h-32 w-32 rounded-full border-2 border-gold-400/60 object-cover"
                      />
                      <h3 className="mt-4 font-display text-lg font-semibold">{c.name}</h3>
                      <p className="mt-1 text-sm text-navy-100/60">{c.role}</p>
                    </div>
                    <div className="flip-card-back flex flex-col justify-center rounded-2xl bg-white p-6 text-navy-950">
                      <h3 className="font-display text-lg font-semibold">{c.name}</h3>
                      <p className="mt-1 text-sm text-navy-600">{c.role}</p>
                      <dl className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-ink-soft">Experience</dt>
                          <dd className="font-medium">{c.experience}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-ink-soft">Availability</dt>
                          <dd className="text-right font-medium">{c.availability}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-ink-soft">Languages</dt>
                          <dd className="text-right font-medium">{c.languages}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={150} className="mt-12 text-center">
            <p className="text-sm text-navy-100/70">Are you a professor, mentor or trained counselor?</p>
            <Link
              to="/counselor/register"
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gold-400 px-5 py-3 text-sm font-semibold text-navy-950 shadow-soft transition hover:-translate-y-0.5 hover:bg-gold-400/90 hover:shadow-lifted"
            >
              Register as a counselor
              <HiOutlineArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Resources / Blog */}
      <section id="resources" className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold text-ink">Guidance &amp; resources</h2>
          <p className="mt-2 max-w-xl text-sm text-ink-soft">
            Short reads to help you understand what you're going through, and how to help others too.
          </p>
        </Reveal>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r, i) => (
            <Reveal key={r.title} delay={i * 100}>
              <Link to={`/resources/${r.slug}`} className="block h-full">
              <article className="group h-full overflow-hidden rounded-2xl border border-border bg-surface shadow-soft transition hover:-translate-y-1 hover:shadow-lifted">
                <div className="overflow-hidden">
                  <img
                    src={r.image}
                    alt={r.title}
                    className="h-44 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-base font-semibold text-ink">{r.title}</h3>
                  <p className="mt-2 text-sm text-ink-soft">{r.desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-navy-600">
                    Read post
                    <HiOutlineArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </article>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="text-center">
            <h2 className="font-display text-2xl font-semibold text-ink">What students say</h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 120}>
                <div className="h-full rounded-2xl border border-border bg-paper p-6 shadow-soft">
                  <div className="flex gap-0.5 text-gold-400">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <HiStar key={s} className="h-4 w-4" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-ink-soft">&ldquo;{t.quote}&rdquo;</p>
                  <p className="mt-4 text-sm font-semibold text-ink">&mdash; {t.name}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-6xl px-6 py-20">
        <Reveal className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl font-semibold text-ink">Frequently asked questions</h2>
        </Reveal>
        <div className="mt-10">
          <FaqAccordion items={faqs} />
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-navy-950 py-20 text-white">
        <div className="mx-auto max-w-xl px-6">
          <Reveal className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gold-400">
              <HiOutlineShieldCheck className="h-3.5 w-3.5" />
              We read every message
            </span>
            <h2 className="mt-4 font-display text-3xl font-semibold">Get in touch</h2>
            <p className="mt-3 text-navy-100/70">Have a question we didn't cover? Send us a note.</p>
          </Reveal>

          <Reveal delay={100}>
            <form onSubmit={handleContactSubmit} className="mt-8 flex flex-col gap-4">
              <input
                type="text"
                required
                placeholder="Your name"
                value={contactForm.name}
                onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-navy-100/50 outline-none transition focus:border-gold-400"
              />
              <input
                type="email"
                required
                placeholder="Your email"
                value={contactForm.email}
                onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-navy-100/50 outline-none transition focus:border-gold-400"
              />
              <textarea
                required
                rows={4}
                placeholder="Your message"
                value={contactForm.message}
                onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))}
                className="resize-none rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-navy-100/50 outline-none transition focus:border-gold-400"
              />
              <button
                type="submit"
                disabled={sending}
                className="rounded-xl bg-gold-400 px-5 py-3 text-sm font-semibold text-navy-950 shadow-soft transition hover:-translate-y-0.5 hover:bg-gold-400/90 hover:shadow-lifted disabled:opacity-60"
              >
                {sending ? 'Sending…' : 'Send message'}
              </button>
            </form>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-ink-soft">
        <p>&copy; {new Date().getFullYear()} PathGuider AI. All rights reserved.</p>
        <p className="mt-1">Built for university student support teams.</p>
        <p className="mt-2">
          <Link to="/counselor/register" className="font-medium text-navy-600 hover:text-navy-700">
            Counselor registration
          </Link>
        </p>
      </footer>
    </div>
  );
}
