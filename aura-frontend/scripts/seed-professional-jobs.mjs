#!/usr/bin/env node

/**
 * Professional Dummy Data Seeder for Aura Platform
 * 
 * This script populates your local Aura backend with professional,
 * realistic job postings from tech industry leaders.
 * 
 * HOW TO RUN:
 * -----------
 * 1. Ensure your backend is running (Django server should be accessible)
 * 2. From the aura-frontend directory, run:
 *    npm run seed
 *    OR
 *    node scripts/seed-professional-jobs.mjs
 * 
 * 3. Check your Jobs Feed to see the new professional jobs!
 * 
 * What it does:
 * - Creates 2 dummy employer accounts (if they don't exist)
 * - Creates company profiles for Stripe and Figma
 * - Posts 5 professional, high-paying tech jobs
 * - Adds realistic salaries, locations, and descriptions
 */

import axios from 'axios';

const API_BASE_URL = 'https://aura-backend-production-2834.up.railway.app';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  section: (msg) => console.log(`\n${colors.bright}${colors.cyan}➜ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
};

// Dummy employer credentials
const employers = [
  {
    username: 'stripe-hr',
    email: 'hr@stripe.com',
    password: 'StripeHR123!',
    company_name: 'Stripe',
    company_description: 'Payment infrastructure for the internet',
  },
  {
    username: 'figma-talent',
    email: 'talent@figma.com',
    password: 'FigmaTalent123!',
    company_name: 'Figma',
    company_description: 'The collaborative design platform',
  },
];

// Professional job listings
const jobListings = [
  {
    title: 'Senior Full-Stack Engineer',
    company_name: 'Stripe',
    location: 'San Francisco, CA',
    salary: '$180,000 - $220,000',
    description:
      'Join Stripe\'s platform team to build payment infrastructure used by millions. We\'re looking for senior engineers passionate about building scalable systems. You\'ll work on payment processing, API design, and distributed systems. Extensive experience with Python, Go, or JavaScript required.',
  },
  {
    title: 'Product Manager, Developer Experience',
    company_name: 'Stripe',
    location: 'Remote',
    salary: '$165,000 - $200,000',
    description:
      'Lead product strategy for Stripe\'s API platform. Collaborate with engineering, design, and customer teams. Define roadmap, prioritize features, and drive adoption among thousands of developers worldwide. 5+ years PM experience with developer-focused products required.',
  },
  {
    title: 'Design Systems Lead',
    company_name: 'Figma',
    location: 'New York, NY',
    salary: '$170,000 - $210,000',
    description:
      'Own the evolution of Figma\'s design system infrastructure. Build tools that scale to serve thousands of design teams. Partner with product and eng to create the next generation of design tooling. Expertise in React, TypeScript, and design systems required.',
  },
  {
    title: 'Staff Engineer, Infrastructure',
    company_name: 'Figma',
    location: 'Remote (US)',
    salary: '$200,000 - $250,000',
    description:
      'Architect and build infrastructure that powers real-time collaboration for millions of users. Work on backend systems, database optimization, and cloud infrastructure. 8+ years engineering experience with focus on distributed systems required.',
  },
  {
    title: 'VP of Engineering',
    company_name: 'Stripe',
    location: 'San Francisco, CA',
    salary: '$250,000 - $350,000',
    description:
      'Lead and scale Stripe\'s engineering organization. Build and mentor world-class engineering teams. Set technical vision and strategy for platform growth. 10+ years experience leading high-impact engineering teams required.',
  },
];

async function registerOrLogin(employer) {
  try {
    log.info(`Attempting login as ${employer.username}...`);
    const loginResponse = await api.post('/api/auth/login/', {
      username: employer.username,
      password: employer.password,
    });

    if (loginResponse.data.access) {
      log.success(`Logged in as ${employer.username}`);
      return {
        token: loginResponse.data.access,
        user_id: loginResponse.data.user_id,
      };
    }
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 400) {
      log.info(`User ${employer.username} not found. Registering new account...`);

      try {
        const registerResponse = await api.post('/api/auth/register/', {
          username: employer.username,
          email: employer.email,
          password: employer.password,
          role: 'EMPLOYER',
        });

        if (registerResponse.data.access) {
          log.success(`Registered and logged in as ${employer.username}`);
          return {
            token: registerResponse.data.access,
            user_id: registerResponse.data.user_id,
          };
        }
      } catch (regErr) {
        if (regErr.response?.status === 400 && regErr.response?.data?.username?.[0]?.includes('already exists')) {
          log.error(
            `Username ${employer.username} already exists. Please use a different username or delete the account first.`
          );
          throw new Error(`Username conflict: ${employer.username}`);
        }
        throw regErr;
      }
    }
    throw err;
  }
}

async function createOrGetCompany(token, companyData) {
  try {
    // Try to get existing companies
    const response = await api.get('/api/companies/', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const existing = response.data.results?.find((c) => c.name === companyData.company_name);
    if (existing) {
      log.success(`Company ${companyData.company_name} already exists`);
      return existing.id;
    }
  } catch (err) {
    log.info('Could not fetch existing companies, will create new one');
  }

  try {
    const createResponse = await api.post(
      '/api/companies/',
      {
        name: companyData.company_name,
        description: companyData.company_description,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    log.success(`Created company: ${companyData.company_name}`);
    return createResponse.data.id;
  } catch (err) {
    log.error(`Failed to create company: ${err.response?.data?.detail || err.message}`);
    throw err;
  }
}

async function postJob(token, job, companyId) {
  try {
    const jobData = {
      title: job.title,
      description: job.description,
      location: job.location,
      salary: job.salary,
      company: companyId,
    };

    const response = await api.post('/api/jobs/', jobData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    log.success(`Posted job: "${job.title}" at ${job.company_name}`);
    return response.data.id;
  } catch (err) {
    log.error(`Failed to post job "${job.title}": ${err.response?.data?.detail || err.message}`);
    throw err;
  }
}

async function main() {
  log.section('🌟 Aura Professional Jobs Seeder');
  log.info(`API Base URL: ${API_BASE_URL}`);

  try {
    const results = {
      employers_created: 0,
      companies_created: 0,
      jobs_created: 0,
    };

    for (const employer of employers) {
      log.section(`Processing employer: ${employer.username}`);

      try {
        const auth = await registerOrLogin(employer);
        api.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;

        const companyId = await createOrGetCompany(auth.token, employer);

        // Post all jobs for this company
        const companyJobs = jobListings.filter((j) => j.company_name === employer.company_name);
        for (const job of companyJobs) {
          await postJob(auth.token, job, companyId);
          results.jobs_created++;
        }

        results.employers_created++;
        results.companies_created++;
      } catch (err) {
        log.error(`Failed to process employer ${employer.username}: ${err.message}`);
      }
    }

    log.section('✨ Seeding Complete');
    console.log(`
${colors.green}Summary:${colors.reset}
  • Employers Created/Logged In: ${results.employers_created}
  • Companies Created: ${results.companies_created}
  • Jobs Posted: ${results.jobs_created}

${colors.bright}Next Steps:${colors.reset}
  1. Visit http://localhost:5173/jobs in your browser
  2. You should now see premium job listings with realistic salaries
  3. Try searching by title (e.g., "Senior", "Product", "Design") or location
  4. Click "Apply Now" to test the application flow

${colors.cyan}These jobs are now live on your Jobs Feed! 🚀${colors.reset}
    `);
  } catch (err) {
    log.section('❌ Seeding Failed');
    console.error(err);
    process.exit(1);
  }
}

main();
