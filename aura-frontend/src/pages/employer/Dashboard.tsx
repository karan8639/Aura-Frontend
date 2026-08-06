import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { Building2, Plus, Briefcase, MapPin, DollarSign, Loader2, X, FileText } from 'lucide-react';

interface Company {
  id: number;
  name: string;
  description: string;
  location: string;
}

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  salary: string;
  company: number | { id: number; name: string };
}

interface Category {
  id: number;
  name: string;
}

interface Application {
  id: number;
  resume?: string | null;
  applicant?: {
    username?: string;
    email?: string;
  } | null;
  user?: {
    username?: string;
    email?: string;
  } | null;
  job?: number | { id?: number; title?: string } | null;
  job_title?: string;
  applicant_name?: string;
}

export default function EmployerDashboard() {
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplicationsLoading, setIsApplicationsLoading] = useState(true);

  // Company Form State
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');

  // Job Form State
  const [showJobModal, setShowJobModal] = useState(false);
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobSalary, setJobSalary] = useState('');
  const [jobCategory, setJobCategory] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Unified fetch: company, its jobs, and categories
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setIsApplicationsLoading(true);

    try {
      const [companiesRes, categoriesRes] = await Promise.all([
        api.get('/api/companies/'),
        api.get('/api/categories/').catch(() => ({ data: [] })),
      ]);

      const companiesData = Array.isArray(companiesRes.data)
        ? companiesRes.data
        : companiesRes.data?.results ?? [];

      setCategories(
        Array.isArray(categoriesRes.data)
          ? categoriesRes.data
          : categoriesRes.data?.results ?? []
      );

      if (companiesData.length > 0) {
        const myCompany = companiesData[0];
        setCompany(myCompany);

        try {
          const [jobsRes, applicationsRes] = await Promise.all([
            api.get('/api/jobs/'),
            api.get('/api/applications/').catch(() => ({ data: [] })),
          ]);

          const allJobs: Job[] = Array.isArray(jobsRes.data)
            ? jobsRes.data
            : jobsRes.data?.results ?? [];

          const myCompanyJobs = allJobs.filter((job) => {
            const jobCompanyId =
              typeof job.company === 'object' ? job.company?.id : job.company;
            return String(jobCompanyId) === String(myCompany.id);
          });

          setJobs(myCompanyJobs);

          const allApplications: Application[] = Array.isArray(applicationsRes.data)
            ? applicationsRes.data
            : applicationsRes.data?.results ?? [];

          const companyJobIds = new Set(myCompanyJobs.map((job) => String(job.id)));

          const filteredApplications = allApplications
            .filter((application) => {
              const appJobId =
                typeof application.job === 'object' ? application.job?.id : application.job;
              return appJobId !== undefined && appJobId !== null && companyJobIds.has(String(appJobId));
            })
            .map((application) => {
              const appJobId =
                typeof application.job === 'object' ? application.job?.id : application.job;
              const matchedJob = myCompanyJobs.find((job) => String(job.id) === String(appJobId));
              const candidateName =
                application.applicant?.username ||
                application.user?.username ||
                application.applicant?.email ||
                application.user?.email ||
                'Applicant';

              return {
                ...application,
                applicant_name: candidateName,
                job_title: application.job_title || matchedJob?.title || 'Untitled role',
              };
            });

          setApplications(filteredApplications);
        } catch {
          setJobs([]);
          setApplications([]);
        }
      } else {
        setCompany(null);
        setJobs([]);
        setApplications([]);
      }
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
      setJobs([]);
      setApplications([]);
    } finally {
      setIsLoading(false);
      setIsApplicationsLoading(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingCompany(true);
    try {
      const res = await api.post('/api/companies/', {
        name: companyName,
        description: companyDescription,
        location: companyLocation,
      });
      setCompany(res.data);
      toast.success('Company created successfully!');
      // Re-fetch to get a clean state
      fetchDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create company');
    } finally {
      setIsCreatingCompany(false);
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    setIsPostingJob(true);
    try {
      await api.post('/api/jobs/', {
        title: jobTitle,
        description: jobDescription,
        location: jobLocation,
        salary: jobSalary,
        category: jobCategory || undefined,
        company: company.id,
      });
      toast.success('Job posted successfully!');
      handleJobCreated();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to post job');
    } finally {
      setIsPostingJob(false);
    }
  };

  // Callback: close modal, reset form, re-fetch jobs list
  const handleJobCreated = () => {
    setShowJobModal(false);
    setJobTitle('');
    setJobDescription('');
    setJobLocation('');
    setJobSalary('');
    setJobCategory('');
    fetchDashboardData();
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // --- No Company State ---
  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
        <div className="max-w-2xl mx-auto mt-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-6 shadow-sm">
              <Building2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Setup your Company
            </h1>
            <p className="mt-3 text-slate-500">
              Before posting jobs, we need some details about your organization.
            </p>
          </div>

          <div className="bg-white p-8 shadow-lg rounded-3xl border border-slate-100">
            <form onSubmit={handleCreateCompany} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 ml-1 mb-2">
                  Company Name
                </label>
                <input
                  required
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all duration-200"
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 ml-1 mb-2">
                  Location
                </label>
                <input
                  required
                  type="text"
                  value={companyLocation}
                  onChange={(e) => setCompanyLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all duration-200"
                  placeholder="City, Country or Remote"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 ml-1 mb-2">
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all duration-200 resize-none"
                  placeholder="Tell us about what you do..."
                />
              </div>
              <button
                type="submit"
                disabled={isCreatingCompany}
                className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreatingCompany && <Loader2 className="w-5 h-5 animate-spin" />}
                Create Company
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- Dashboard State ---
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="mt-2 text-slate-500">
              Managing{' '}
              <span className="font-medium text-slate-700">{company.name}</span>
            </p>
          </div>
          <button
            onClick={() => setShowJobModal(true)}
            className="flex items-center justify-center px-6 py-3 rounded-xl text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all duration-200 active:scale-95 gap-2"
          >
            <Plus className="w-4 h-4" />
            Post a Job
          </button>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 shadow-lg rounded-3xl border border-slate-100 flex items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mr-4">
              <Briefcase className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Active Jobs</p>
              <p className="text-2xl font-semibold text-slate-900">{jobs.length}</p>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {jobs.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Job Listings</h2>
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <h3 className="font-semibold text-lg text-slate-900">{job.title}</h3>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.location}
                    </span>
                  )}
                  {job.salary && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      {job.salary}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Recent Applications</h2>
              <p className="text-sm text-slate-500">Candidates who applied through your company’s jobs.</p>
            </div>
            <span className="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              {applications.length} total
            </span>
          </div>

          {isApplicationsLoading ? (
            <div className="flex items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 px-6 py-8 text-sm text-slate-600">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-emerald-600" />
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
              <FileText className="mb-3 h-10 w-10 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900">No applications yet</h3>
              <p className="mt-1 text-sm text-slate-500">Applications for your company’s jobs will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((application) => {
                const resumeHref = typeof application.resume === 'string' && application.resume.trim()
                  ? application.resume
                  : '#';

                return (
                  <div
                    key={application.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {application.applicant_name || 'Applicant'}
                      </p>
                      <p className="text-sm text-slate-500">{application.job_title || 'Untitled role'}</p>
                    </div>
                    <a
                      href={resumeHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                    >
                      <FileText className="h-4 w-4" />
                      Download Resume
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Job Posting Modal */}
        {showJobModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-lg border border-slate-100 flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <h2 className="text-xl font-semibold text-slate-900">
                  Post a new Job
                </h2>
                <button
                  onClick={() => setShowJobModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto">
                <form id="job-form" onSubmit={handlePostJob} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 ml-1 mb-2">
                      Job Title
                    </label>
                    <input
                      required
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all duration-200"
                      placeholder="e.g. Senior Frontend Developer"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 ml-1 mb-2">
                        Location
                      </label>
                      <input
                        required
                        type="text"
                        value={jobLocation}
                        onChange={(e) => setJobLocation(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all duration-200"
                        placeholder="e.g. Remote, NY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 ml-1 mb-2">
                        Salary Range
                      </label>
                      <input
                        type="text"
                        value={jobSalary}
                        onChange={(e) => setJobSalary(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all duration-200"
                        placeholder="e.g. $100k - $120k"
                      />
                    </div>
                  </div>
                  {categories.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 ml-1 mb-2">
                        Category
                      </label>
                      <div className="relative">
                        <select
                          value={jobCategory}
                          onChange={(e) => setJobCategory(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all duration-200 appearance-none"
                        >
                          <option value="">Select a category (Optional)</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                          <svg
                            className="fill-current h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 ml-1 mb-2">
                      Description
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all duration-200 resize-none"
                      placeholder="Describe the role, responsibilities, and requirements..."
                    />
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="job-form"
                  disabled={isPostingJob}
                  className="flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed gap-2"
                >
                  {isPostingJob && <Loader2 className="w-5 h-5 animate-spin" />}
                  Post Job
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
