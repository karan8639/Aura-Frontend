import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { Briefcase, DollarSign, Inbox, Loader2, MapPin, Search, UploadCloud, X } from 'lucide-react';

interface Job {
  id?: number | string;
  title?: string;
  location?: string;
  salary?: string;
  company_name?: string;
  company?: {
    name?: string;
  };
}

export default function JobsFeed() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get('/api/jobs/');
      const payload = response?.data;
      const jobsArray = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
          ? payload.results
          : [];

      setJobs(Array.isArray(jobsArray) ? jobsArray : []);
    } catch (err: any) {
      console.error('Failed to fetch jobs:', err);
      setError('We couldn’t load jobs right now. Please try again.');
      toast.error(err?.response?.data?.detail || 'Unable to load jobs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!applyingJob || !resumeFile) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('job', String(applyingJob.id ?? ''));
    formData.append('resume', resumeFile);

    try {
      await api.post('/api/applications/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Application submitted successfully!');
      setApplyingJob(null);
      setResumeFile(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err?.message || 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCompanyName = (job: Job) => {
    const fromCompany = typeof job?.company?.name === 'string' ? job.company.name.trim() : '';
    const fromCompanyName = typeof job?.company_name === 'string' ? job.company_name.trim() : '';
    return fromCompany || fromCompanyName || 'Unknown Company';
  };

  const getTitle = (job: Job) => {
    const title = typeof job?.title === 'string' ? job.title.trim() : '';
    return title || 'Untitled role';
  };

  const getLocation = (job: Job) => {
    const location = typeof job?.location === 'string' ? job.location.trim() : '';
    return location || 'Remote / Hybrid';
  };

  const getSalary = (job: Job) => {
    const salary = typeof job?.salary === 'string' ? job.salary.trim() : '';
    return salary || 'Compensation available upon request';
  };

  const applyJobFilter = (sourceJobs: Job[], query: string) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return sourceJobs;
    }

    return sourceJobs.filter((job) => {
      const title = getTitle(job).toLowerCase();
      const location = getLocation(job).toLowerCase();
      return title.includes(normalizedQuery) || location.includes(normalizedQuery);
    });
  };

  useEffect(() => {
    setFilteredJobs(applyJobFilter(jobs, searchQuery));
  }, [jobs, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-950">
      <div className="mx-auto max-w-6xl">
        <section className="mb-8 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Aura Talent</p>
          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Discover roles built for your next big move.</h1>
          <p className="mx-auto max-w-2xl text-base text-slate-500 sm:text-lg">Browse premium opportunities, review salary details, and submit applications with a polished modern flow.</p>
        </section>

        <div className="mb-8 rounded-[28px] border border-slate-200/70 bg-white/80 p-3 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur">
          <div className="flex items-center gap-3 rounded-[22px] bg-slate-50 px-4 py-3">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by title or location"
              className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center rounded-3xl border border-slate-200 bg-white/80 px-10 py-12 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <Loader2 className="mb-4 h-10 w-10 animate-spin text-emerald-600" />
              <p className="text-lg font-medium text-slate-700">Loading opportunities...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <Briefcase className="mx-auto mb-5 h-12 w-12 text-rose-400" />
              <h2 className="mb-2 text-2xl font-semibold text-slate-950">Unable to load jobs</h2>
              <p className="mb-6 text-slate-500">{error}</p>
              <button
                type="button"
                onClick={fetchJobs}
                className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Retry
              </button>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <Inbox className="mx-auto mb-5 h-12 w-12 text-emerald-500" />
              <h2 className="mb-2 text-2xl font-semibold text-slate-950">No jobs posted yet</h2>
              <p className="text-slate-500">No jobs posted yet. Check back later!</p>
            </div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <Search className="mx-auto mb-5 h-12 w-12 text-emerald-500" />
              <h2 className="mb-2 text-2xl font-semibold text-slate-950">No roles match that search</h2>
              <p className="text-slate-500">Try a different title or location to explore more opportunities.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {filteredJobs.map((job, index) => (
              <article
                key={job?.id ?? `job-${index}`}
                className="group transform rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-5 flex items-center gap-3 text-slate-500">
                  <Briefcase className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">Opportunity</span>
                </div>
                <h2 className="mb-2 text-xl font-semibold text-slate-950">{getTitle(job)}</h2>
                <p className="mb-5 text-sm text-slate-500">{getCompanyName(job)}</p>

                <div className="mb-6 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {getLocation(job)}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                    {getSalary(job)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setApplyingJob(job)}
                  className="inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Apply Now
                </button>
              </article>
            ))}
          </div>
        )}

        {applyingJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-[0_25px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Apply</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-950">{getTitle(applyingJob)}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setApplyingJob(null);
                    setResumeFile(null);
                  }}
                  className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleApply} className="space-y-6 px-6 py-6">
                <div>
                  <label htmlFor="resume" className="mb-2 block text-sm font-medium text-slate-700">
                    Resume (PDF only)
                  </label>
                  <div className="relative rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center transition hover:border-emerald-300 hover:bg-emerald-50/40">
                    <UploadCloud className="mx-auto h-10 w-10 text-slate-400" />
                    <div className="mt-4 text-sm text-slate-600">
                      {resumeFile ? (
                        <span className="font-medium text-slate-950">{resumeFile.name}</span>
                      ) : (
                        <span className="font-medium text-emerald-600">Click to upload your resume</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Accepted file type: PDF.</p>
                    <input
                      id="resume"
                      name="resume"
                      type="file"
                      accept=".pdf"
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      onChange={(event) => setResumeFile(event.target.files?.[0] || null)}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setApplyingJob(null);
                      setResumeFile(null);
                    }}
                    className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !resumeFile}
                    className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
