/**
 * External Job Aggregation Service
 * Fetches real job data from Adzuna API
 * 
 * SETUP:
 * 1. Go to https://developer.adzuna.com
 * 2. Sign up (free) and get your App ID and API Key
 * 3. Add to your .env file:
 *    VITE_ADZUNA_APP_ID=your_app_id
 *    VITE_ADZUNA_API_KEY=your_api_key
 */

export interface ExternalJob {
  id: string;
  title: string;
  company_name: string;
  location: string;
  salary?: string;
  description?: string;
  is_external: true;
  apply_url: string;
}

const ADZUNA_API_BASE = 'https://api.adzuna.com/v1/api/jobs';
const APP_ID = import.meta.env.VITE_ADZUNA_APP_ID;
const API_KEY = import.meta.env.VITE_ADZUNA_API_KEY;

// Fallback: Mock external jobs for demo (if API key not available)
const MOCK_EXTERNAL_JOBS: ExternalJob[] = [
  {
    id: 'ext-001',
    title: 'Full-Stack Engineer',
    company_name: 'OpenAI',
    location: 'San Francisco, CA',
    salary: '$200,000 - $300,000',
    description:
      'Build the next generation of AI-powered products. Work on our API platform, infrastructure, and developer experience. Strong Python/TypeScript required.',
    is_external: true,
    apply_url: 'https://openai.com/careers',
  },
  {
    id: 'ext-002',
    title: 'Senior React Developer',
    company_name: 'Vercel',
    location: 'Remote',
    salary: '$160,000 - $200,000',
    description:
      'Lead frontend architecture for Vercel platform. Work with cutting-edge React, Next.js, and web technologies. Drive UX innovation.',
    is_external: true,
    apply_url: 'https://vercel.com/careers',
  },
  {
    id: 'ext-003',
    title: 'Machine Learning Engineer',
    company_name: 'Anthropic',
    location: 'San Francisco, CA',
    salary: '$180,000 - $250,000',
    description:
      'Research and implement advanced ML models. Work on safety, interpretability, and scaling. PhD or equivalent experience preferred.',
    is_external: true,
    apply_url: 'https://www.anthropic.com/careers',
  },
  {
    id: 'ext-004',
    title: 'DevOps Engineer',
    company_name: 'HashiCorp',
    location: 'Remote',
    salary: '$170,000 - $210,000',
    description:
      'Build and maintain infrastructure as code solutions. Design cloud-native architectures. Lead infrastructure initiatives.',
    is_external: true,
    apply_url: 'https://www.hashicorp.com/careers',
  },
];

/**
 * Parse Adzuna salary field into readable format
 */
function parseSalary(minSalary?: number, maxSalary?: number): string | undefined {
  if (!minSalary || !maxSalary) return undefined;

  const formatSalary = (salary: number) => {
    return (salary / 1000).toFixed(0) + 'k';
  };

  return `$${formatSalary(minSalary)} - $${formatSalary(maxSalary)}`;
}

/**
 * Parse job description from Adzuna HTML to plain text
 */
function parseDescription(html?: string): string {
  if (!html) return '';
  // Strip HTML tags
  return (
    html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .slice(0, 500) + '...'
  );
}

/**
 * Fetch jobs from Adzuna API
 * Supports multiple countries and job categories
 */
export async function fetchExternalJobs(
  query: string = 'software engineer',
  country: string = 'us',
  pages: number = 1
): Promise<ExternalJob[]> {
  // If API key not configured, return mock data
  if (!APP_ID || !API_KEY) {
    console.warn(
      'Adzuna API key not configured. Using mock external jobs. Set VITE_ADZUNA_APP_ID and VITE_ADZUNA_API_KEY in .env to use real data.'
    );
    return MOCK_EXTERNAL_JOBS;
  }

  try {
    const externalJobs: ExternalJob[] = [];

    for (let page = 1; page <= pages; page++) {
      const url = `${ADZUNA_API_BASE}/${country}/search/${page}?app_id=${APP_ID}&app_key=${API_KEY}&results_per_page=20&what=${encodeURIComponent(query)}`;

      const response = await fetch(url);

      if (!response.ok) {
        console.error(`Adzuna API error: ${response.status} ${response.statusText}`);
        // Fall back to mock data on API error
        return MOCK_EXTERNAL_JOBS;
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        break;
      }

      data.results.forEach((job: any) => {
        externalJobs.push({
          id: `adzuna-${job.id}`,
          title: job.title,
          company_name: job.company.display_name,
          location: job.location.display_name,
          salary: parseSalary(job.salary_min, job.salary_max),
          description: parseDescription(job.description),
          is_external: true,
          apply_url: job.redirect_url,
        });
      });
    }

    return externalJobs;
  } catch (error) {
    console.error('Failed to fetch external jobs:', error);
    // Fall back to mock data on network error
    return MOCK_EXTERNAL_JOBS;
  }
}

/**
 * Get search suggestions based on user query
 * Maps user input to Adzuna job categories
 */
export function getSearchTerms(userQuery: string): string[] {
  const terms: Record<string, string[]> = {
    engineer: ['software engineer', 'frontend engineer', 'backend engineer', 'full stack engineer'],
    designer: ['ui designer', 'ux designer', 'product designer'],
    product: ['product manager', 'product lead'],
    data: ['data engineer', 'data scientist'],
    devops: ['devops engineer', 'cloud engineer'],
    security: ['security engineer', 'security architect'],
  };

  const lowercaseQuery = userQuery.toLowerCase();

  for (const [key, suggestions] of Object.entries(terms)) {
    if (lowercaseQuery.includes(key)) {
      return suggestions;
    }
  }

  // Return default suggestions if no match
  return ['software engineer', 'product manager', 'designer'];
}
