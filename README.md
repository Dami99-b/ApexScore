# ApexScore

Risk assessment tool for loan applicants. Search by email, get instant risk scores.

## What it does

- Email/password auth with user profiles
- Search applicants by email → get risk scores, BSI metrics, loan history
- Search history saved per user
- PDF export

## Stack

- React 18 + Vite + TypeScript
- Tailwind + shadcn/ui
- Backend on Cloud (auth, database, edge functions)

## Running locally

```bash
npm install
npm run dev
```

## Routes

- `/` – landing page
- `/auth` – login/signup
- `/home` – logged-in home
- `/dashboard` – search + history
- `/profile` – user settings
- `/admin` – risk rules config

## Notes

- Applicant data comes from external API (`src/lib/api.ts`)
- Search history stored in database, scoped per user
- Google OAuth available if configured
