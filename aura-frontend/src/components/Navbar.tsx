import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Sparkles, User } from 'lucide-react';
import { normalizeRole, useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const role = normalizeRole(user?.role);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="bg-slate-900 text-white p-1.5 rounded-lg flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">Aura</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {role === 'EMPLOYER' && (
            <Link to="/employer/dashboard" className="transition hover:text-emerald-600">
              Dashboard
            </Link>
          )}

          {role === 'JOB_SEEKER' && (
            <>
              <Link to="/jobs" className="transition hover:text-emerald-600">
                Jobs Feed
              </Link>
              <Link to="/seeker/applications" className="transition hover:text-emerald-600">
                My Applications
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-700 sm:flex">
                <User className="h-4 w-4 text-emerald-600" />
                <span>Hi, {user?.username || 'there'}</span>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-slate-900 text-white px-5 py-2 rounded-full font-medium hover:bg-slate-800 transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
