# External Job API Integration Setup

## Adzuna API Integration

Aura now supports fetching real job data from **Adzuna**, a leading job aggregation platform. This allows your platform to display thousands of real job listings alongside your internal postings.

### Step 1: Register for Adzuna API (Free)

1. Visit: **https://developer.adzuna.com/**
2. Click "Sign up" (completely free)
3. Fill in your details and create an account
4. You'll receive an **App ID** and **API Key** via email

### Step 2: Add to Your Environment

Create a `.env.local` file in `aura-frontend/` with:

```bash
VITE_ADZUNA_APP_ID=your_app_id_here
VITE_ADZUNA_API_KEY=your_api_key_here
```

**Example:**
```bash
VITE_ADZUNA_APP_ID=abc123def456
VITE_ADZUNA_API_KEY=xyz789uvw123
```

### Step 3: Restart Your Dev Server

```bash
npm run dev
```

### Step 4: Test It Out

1. Go to [http://localhost:5173/jobs](http://localhost:5173/jobs)
2. Click the **"External +X"** button to toggle external jobs on/off
3. You'll see real jobs from Adzuna mixed with your internal jobs
4. Search works across both internal and external jobs

---

## How It Works

### Without API Key (Demo Mode)
If you haven't added your API key, Aura will automatically show **mock external jobs** from companies like:
- OpenAI
- Vercel
- Anthropic
- HashiCorp

These are high-quality demo jobs that showcase what real integration looks like.

### With API Key (Live Data)
Once you add your credentials, the platform fetches **real job listings** in real-time from:
- ✅ All countries supported by Adzuna
- ✅ Multiple job categories (software, design, product, etc.)
- ✅ Real salary ranges (when available)
- ✅ Direct apply links to the original job boards

### Caching & Performance
- Results are cached for **5 minutes** to avoid excessive API calls
- Searches are optimized to return the most relevant jobs
- External jobs are clearly marked with a badge in the UI

---

## Features

### Job Badges
External jobs show:
- 🌍 **Location badge** (blue) — where the job is based
- 💰 **Salary badge** (if available) — compensation range
- 📤 **External badge** (green) — indicates it's from an external source

### Apply Flow
- **Internal jobs**: Upload resume through Aura modal
- **External jobs**: Click "Apply Externally" → opens in new tab to company's career page

### Search Integration
Search works across **both** job sources:
- Search for "Senior Frontend Engineer" → gets results from Aura + Adzuna
- Filter by location like "Remote" or "San Francisco"
- Results automatically deduplicated

---

## API Limits (Adzuna Free Tier)

- **100 API calls per day** (typically 50+ jobs per call)
- No rate limiting for reasonable usage
- Perfect for a growing job board

For higher volumes, upgrade to a paid plan.

---

## Troubleshooting

### "Using mock external jobs"
**Fix**: Add your Adzuna API key to `.env.local`

### Jobs not updating
**Fix**: Clear browser cache or hard refresh (Ctrl+Shift+R)

### Missing job results
**Fix**: Try a different search query or check Adzuna API status

### Build error: `import.meta.env`
**Fix**: Make sure you're using Vite (which you are!) and the `.env.local` file exists

---

## Next Steps

1. ✅ Add your Adzuna API credentials
2. ✅ Test the external jobs feature
3. ✅ Customize mock jobs in `src/lib/external-jobs.ts`
4. ✅ Integrate with your backend to store external job data (optional)

---

## Additional Resources

- **Adzuna API Docs**: https://developer.adzuna.com/
- **Supported Countries**: https://api.adzuna.com/v1/api/jobs/countries
- **Job Categories**: Customizable in `getSearchTerms()` in `src/lib/external-jobs.ts`
