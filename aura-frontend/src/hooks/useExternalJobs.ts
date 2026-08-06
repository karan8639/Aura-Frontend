import { useState, useEffect, useCallback } from 'react';
import { fetchExternalJobs, type ExternalJob } from '../lib/external-jobs';

interface UseExternalJobsResult {
  externalJobs: ExternalJob[];
  isLoadingExternal: boolean;
  errorExternal: string | null;
  fetchJobs: (query?: string) => Promise<void>;
}

// Simple cache to avoid repeated API calls
const jobCache = new Map<string, { data: ExternalJob[]; timestamp: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export function useExternalJobs(initialQuery: string = 'software engineer'): UseExternalJobsResult {
  const [externalJobs, setExternalJobs] = useState<ExternalJob[]>([]);
  const [isLoadingExternal, setIsLoadingExternal] = useState(false);
  const [errorExternal, setErrorExternal] = useState<string | null>(null);

  const fetchJobs = useCallback(
    async (query: string = initialQuery) => {
      const cacheKey = `jobs-${query}`;
      const cached = jobCache.get(cacheKey);

      // Return cached results if still valid
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
        setExternalJobs(cached.data);
        return;
      }

      setIsLoadingExternal(true);
      setErrorExternal(null);

      try {
        const jobs = await fetchExternalJobs(query, 'us', 1);
        setExternalJobs(jobs);

        // Cache the results
        jobCache.set(cacheKey, {
          data: jobs,
          timestamp: Date.now(),
        });
      } catch (error: any) {
        const message = error?.message || 'Failed to fetch external jobs';
        setErrorExternal(message);
        console.error('Error fetching external jobs:', error);
      } finally {
        setIsLoadingExternal(false);
      }
    },
    [initialQuery]
  );

  // Fetch jobs on mount
  useEffect(() => {
    void fetchJobs(initialQuery);
  }, []);

  return {
    externalJobs,
    isLoadingExternal,
    errorExternal,
    fetchJobs,
  };
}
