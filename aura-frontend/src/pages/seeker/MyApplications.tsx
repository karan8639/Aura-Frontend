import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Briefcase, Inbox, Loader2 } from 'lucide-react';

interface ApplicationItem {
  id?: number | string;
  status?: string;
  created_at?: string;
  resume?: string;
  applicant?: unknown;
  user?: unknown;
  user_id?: number | string | null;
  applicant_id?: number | string | null;
  job?: {
    id?: number | string;
    title?: string;
    company_name?: string;
    company?: {
      name?: string;
    };
  };
  job_title?: string;
  company_name?: string;
}

export default function MyApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get('/api/applications/');
      const payload = response?.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
          ? payload.results
          : [];

      setApplications(Array.isArray(list) ? list : []);
    } catch (err: any) {
      console.error('Failed to fetch applications:', err);
      setError('We couldn’t load your applications right now.');
      toast.error(err?.response?.data?.detail || 'Unable to load applications.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentUserId = user?.id != null ? String(user.id) : null;

  const getApplicantId = (application: ApplicationItem) => {
    const candidate = application.applicant ?? application.user ?? application.user_id ?? application.applicant_id;

    if (typeof candidate === 'object' && candidate !== null) {
      const record = candidate as Record<string, unknown>;
      const nestedId = record.id ?? record.user_id ?? record.pk;
      return nestedId != null ? String(nestedId) : null;
    }

    return candidate != null ? String(candidate) : null;
  };

  const visibleApplications = useMemo(() => {
    if (!currentUserId) {
      return [];
    }

    return [...applications].filter((application) => {
      const applicantId = getApplicantId(application);

      if (applicantId == null) {
        return true;
      }

      return applicantId === currentUserId;
    }).sort((a, b) => {
      const aDate = new Date(a.created_at || 0).getTime();
      const bDate = new Date(b.created_at || 0).getTime();
      return bDate - aDate;
    });
  }, [applications, currentUserId]);

  const getJobTitle = (application: ApplicationItem) => {
    const title = typeof application?.job?.title === 'string' ? application.job.title.trim() : '';
    return title || application.job_title || 'Untitled role';
  };

  const getCompanyName = (application: ApplicationItem) => {
    const name = typeof application?.job?.company?.name === 'string'
      ? application.job.company.name.trim()
      : '';
    return name || application.company_name || 'Unknown company';
  };

  const formatAppliedDate = (value?: string) => {
    if (!value) {
      return 'Recently Applied';
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return 'Recently Applied';
    }

    return parsedDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Applications</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Your submitted applications</h1>
          <p className="mt-2 max-w-2xl text-slate-500">Track every opportunity you’ve applied to and keep your pipeline in motion.</p>
        </header>

        {isLoading ? (
          <div className="flex min-h-[50vh] items-center justify-center rounded-[32px] border border-slate-200/70 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col items-center">
              <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
              <p className="text-slate-600">Loading your applications...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-[32px] border border-rose-200/80 bg-rose-50 p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
            <Briefcase className="mx-auto mb-3 h-10 w-10 text-rose-500" />
            <h2 className="text-xl font-semibold text-slate-900">We hit a snag</h2>
            <p className="mt-2 text-slate-600">{error}</p>
          </div>
        ) : visibleApplications.length === 0 ? (
          <div className="rounded-[32px] border border-slate-200/70 bg-white p-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
            <Inbox className="mx-auto mb-4 h-10 w-10 text-emerald-500" />
            <h2 className="text-xl font-semibold text-slate-900">No applications yet</h2>
            <p className="mt-2 text-slate-500">Apply to a role and your submissions will appear here.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.05)] backdrop-blur">
            <div className="hidden border-b border-slate-100 bg-slate-50/70 px-6 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 md:grid md:grid-cols-[2.2fr_1fr_1fr]">
              <span>Job Title</span>
              <span>Applied Date</span>
              <span>Status</span>
            </div>

            <div className="divide-y divide-slate-100">
              {visibleApplications.map((application) => (
                <div key={application.id} className="grid gap-4 px-6 py-5 md:grid-cols-[2.2fr_1fr_1fr] md:items-center">
                  <div>
                    <h2 className="text-base font-semibold text-slate-950">{getJobTitle(application)}</h2>
                    <p className="mt-1 text-sm text-slate-500">{getCompanyName(application)}</p>
                  </div>

                  <div className="text-sm text-slate-600">
                    {formatAppliedDate(application.created_at)}
                  </div>

                  <div className="flex items-center md:justify-end">
                    <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                      {application.status || 'Submitted'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
