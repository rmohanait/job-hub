# JobTracker – Job Application Tracker

A full-stack job application tracker built with React, TypeScript, and Lovable Cloud. Track your applications, visualize progress, and get AI-powered career advice — all in one place.

## ✨ Features

- **Dashboard** – Overview cards (Total, Interviews, Offers) with a bar chart showing applications by status
- **Add Applications** – Form with company, role, status, date, job link, notes, tags, and image upload
- **My Applications** – Searchable card grid with status filter, date sort, and inline edit/delete
- **AI Chat Assistant** – Floating chat widget powered by AI that can answer career questions and query your application data
- **Authentication** – Email/password sign-up and login with email verification
- **Mobile Responsive** – Fully responsive layout with mobile hamburger navigation

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Lovable Cloud (Supabase) |
| Database | PostgreSQL with Row-Level Security |
| AI | Lovable AI Gateway (Gemini) |
| Charts | Recharts |
| Routing | React Router v6 |

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/           # shadcn/ui primitives
│   ├── AppHeader.tsx  # Navigation header
│   ├── ChatWidget.tsx # AI chat floating widget
│   └── ProtectedRoute.tsx
├── contexts/         # Auth context provider
├── hooks/            # Custom React hooks
├── integrations/     # Supabase client & types
├── pages/            # Route pages
│   ├── Index.tsx      # Dashboard
│   ├── AddApplication.tsx
│   ├── MyApplications.tsx
│   ├── Login.tsx
│   ├── Signup.tsx
│   └── AuthCallback.tsx
└── main.tsx
supabase/
└── functions/
    └── chat/          # AI chat edge function
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or bun

### Installation

```bash
git clone <your-repo-url>
cd <repo-name>
npm install
npm run dev
```

### Environment Variables

The following environment variables are configured automatically via Lovable Cloud:

- `VITE_SUPABASE_URL` – Backend URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` – Public API key

## 📊 Database Schema

### `applications` table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner (auth user) |
| company | text | Company name |
| role | text | Job title |
| status | enum | Applied / Interviewing / Offer / Rejected |
| date_applied | date | Application date |
| job_link | text | URL to job posting |
| notes | text | Free-form notes |
| tags | text[] | Categorization tags |
| image_url | text | Uploaded image URL |

All data is protected by Row-Level Security — users can only access their own applications.

## 🤖 AI Chat Assistant

The floating chat widget (bottom-right corner) connects to Lovable AI and can:

- Answer career and interview questions
- Query your tracked applications ("How many applications do I have?")
- Provide resume and salary negotiation advice

## 📝 License

MIT
