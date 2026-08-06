import { Navigate, Link } from 'react-router-dom';
import { Building, LayoutDashboard, Zap, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const features = [
  {
    title: 'Seamless Applications',
    description: 'Apply in seconds with a polished, low-friction experience built for modern candidates.',
    icon: Zap,
  },
  {
    title: 'Verified Companies',
    description: 'Discover trusted employers with clear roles, premium brand pages, and better intent.',
    icon: Building,
  },
  {
    title: 'Smart Dashboards',
    description: 'Stay organized with intuitive views for recruiters and job seekers alike.',
    icon: LayoutDashboard,
  },
] as const;

export default function LandingPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600">Loading...</div>;
  }

  if (user) {
    const destination = user.role === 'EMPLOYER' ? '/employer/dashboard' : '/jobs';
    return <Navigate to={destination} replace />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className="pointer-events-none absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-slate-200/70 blur-3xl" />
      <header className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="bg-slate-900 text-white p-1.5 rounded-lg flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">Aura</span>
        </Link>

        <Link
          to="/login"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700"
        >
          Sign In
        </Link>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pb-24 lg:pt-10">
        <section className="overflow-hidden rounded-[36px] border border-slate-200/70 bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.06)] sm:p-12 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="space-y-8">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Aura Talent</p>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Where <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent inline-block">Top Talent</span> Meets Exceptional Companies.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-500">
                Aura is the modern job board designed for seamless hiring and effortless applications.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Find a Job
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-100"
                >
                  Post a Job
                </Link>
              </div>
              <div className="mt-6 text-center text-xs uppercase tracking-[0.32em] text-slate-400 sm:text-left">
                Trusted by forward-thinking teams worldwide
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xl font-bold text-slate-300 sm:justify-start">
                {['Acme Corp', 'GlobalTech', 'Quantum', 'Nexus'].map((name) => (
                  <span key={name} className="rounded-full bg-slate-100/80 px-3 py-2 text-base text-slate-400 shadow-sm">
                    {name}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative mt-4 rounded-[36px] border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-md sm:mt-0 hover:-translate-y-2 transition-transform duration-500">
              <div className="absolute inset-0 rounded-[36px] bg-gradient-to-br from-slate-100/80 via-white/40 to-white opacity-80" />
              <div className="relative space-y-5">
                <div className="flex items-center justify-between gap-4 rounded-3xl bg-white/85 px-5 py-4 shadow-sm">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Today’s Pipeline</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-950">+184</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">Live</span>
                </div>

                <div className="space-y-4">
                  {['Senior Product Designer', 'Operations Lead', 'Frontend Engineer'].map((role) => (
                    <div key={role} className="flex items-center justify-between rounded-3xl border border-slate-200/70 bg-slate-50 px-4 py-3 shadow-sm">
                      <span className="text-sm font-semibold text-slate-700">{role}</span>
                      <span className="text-sm text-slate-500">Ready to review</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article key={feature.title} className="rounded-[28px] border border-slate-200/70 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold text-slate-950">{feature.title}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-500">{feature.description}</p>
              </article>
            );
          })}
        </section>
      </main>

      <footer className="border-t border-slate-200/70 bg-white/70 py-6 text-center text-sm text-slate-500">
        © 2026 Aura. All rights reserved.
      </footer>
    </div>
  );
}
