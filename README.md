# LOOP — AI Customer-Feedback Intelligence Platform

LOOP turns scattered customer feedback into a ranked, evidence-backed list of what to build, fix, or improve next. It ingests feedback from multiple channels, uses AI to classify and cluster it into themes, surfaces trends, answers plain-English questions grounded in real feedback, and generates shareable Voice-of-Customer reports.

Built as a corporate-grade, multi-tenant web application — every workspace's data is fully isolated from every other workspace's.

## Live Demo

- **App:** https://project-loop-sigma-ebon.vercel.app
- **Repo:** https://github.com/falekartik418/project-loop

### Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@loop.com` | `password123` |
| Analyst | `analyst@loop.com` | `password123` |
| Viewer | `viewer@loop.com` | `password123` |

## Features

### Core
- Multi-tenant workspaces with three roles: **Admin**, **Analyst**, **Viewer**
- Role-based access control enforced server-side on every API route
- Feedback ingestion: single-entry form and CSV bulk upload
- Feedback inbox with search, filters (channel, sentiment, status), and inline status workflow (NEW → REVIEWED → ACTIONED)
- Analytics dashboard: feedback volume over time, sentiment breakdown, top themes, trending themes
- Workspace, Members, Profile, and Settings management (rename workspace, invite/remove members, change roles, update profile, change password, notification preferences, delete workspace)
- Dark mode, global search (⌘K), and in-app notifications

### AI (powered by Google Gemini)
- **Auto-classification** — every feedback item is automatically tagged with sentiment, sentiment score, theme(s), and a feature area on ingestion (both single-entry and CSV import)
- **Theme clustering & trends** — feedback is grouped into named themes with mention counts and period-over-period trend detection
- **Ask LOOP** — a retrieval-grounded Q&A interface; questions are answered only from the workspace's actual feedback (semantic search via embeddings), never invented
- **Voice-of-Customer reports** — one-click AI-generated reports summarizing top themes, sentiment shifts, and representative quotes for a chosen period, saved and exportable as PDF

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Custom CSS + Ant Design components |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | NextAuth (Auth.js) — credentials provider, hashed passwords (bcryptjs) |
| AI | Google Gemini API (classification, embeddings, Q&A, report generation) |
| Charts | Recharts |
| Validation | Zod |
| Deployment | Vercel |

## Architecture

Three-tier: the browser talks only to this app's own API route handlers; the API layer is the only thing that talks to the database and to the Gemini API.

Client (Next.js App Router pages)
        ↓
API route handlers (app/api/**)
  — auth check → role check → workspace-scoped query → Zod validation
        ↓
Prisma ORM → PostgreSQL (Neon)
        ↓ (AI features)
lib/ai.ts → Gemini API (server-side only, key never exposed to browser)


Every database query touching feedback, themes, reports, or users is filtered by the authenticated user's `workspaceId`. A user from one workspace can never read another workspace's data — this is enforced in every route via `requireSession()` / `requireRole()` (see `lib/guard.ts`).

### Data model (Prisma)

`Workspace` → has many `User`, `Feedback`, `Theme`, `Report`, `Notification`
`Feedback` → belongs to `Workspace`, has many `FeedbackTheme` (join to `Theme`), has one `Embedding`
`User` → belongs to `Workspace`, role is `ADMIN | ANALYST | VIEWER`

See `prisma/schema.prisma` for the full schema.

## Local Setup

### Prerequisites
- Node.js 18+ and npm
- A PostgreSQL database (this project uses [Neon](https://neon.tech), free tier)
- A [Google Gemini API key](https://ai.google.dev)

### 1. Clone and install
```bash
git clone https://github.com/falekartik418/project-loop.git
cd project-loop
npm install
```

### 2. Environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"
GEMINI_API_KEY="your-gemini-api-key"
NEXTAUTH_SECRET="a-random-secret-string"
NEXTAUTH_URL="http://localhost:3000"
```

> Never commit `.env` — it's already in `.gitignore`.

### 3. Set up the database
```bash
npx prisma migrate dev
```

### 4. Seed demo data
```bash
npx tsx prisma/seed.ts
```
This creates the demo workspace, three users (Admin, Analyst, Viewer), and 150+ sample feedback items across multiple channels.

### 5. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`.

### 6. Classify existing feedback (if needed)
New feedback is classified automatically on ingestion. To (re)classify a backlog of unclassified items:
```bash
npx tsx scripts/classify-all.ts
```

## Deployment

Deployed on Vercel, connected to the `main` branch of this repository. Environment variables (`DATABASE_URL`, `GEMINI_API_KEY`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`) are configured in the Vercel project settings, not committed to the repo.

## Project Structure

app/
  (pages): dashboard, feedback, trends, ask, reports, workspace, members, profile, settings, login, signup
  api/: auth, feedback, insights, trends, ask, reports, workspace, members, profile, settings, search, notifications
components/
  Topbar.tsx — shared search, notifications, dark mode toggle
lib/
  ai.ts — Gemini calls: classify, embed, answer, generate report
  search.ts — semantic search / retrieval for Ask LOOP
  db.ts — Prisma client singleton
  guard.ts — session + role guards
prisma/
  schema.prisma
  seed.ts — creates demo workspace, 3 users (one per role), and sample feedback
  migrations/
scripts/
  classify-all.ts — batch classify unclassified feedback

## Known Limitations

- Gemini's free tier has a daily request quota; heavy use of Ask LOOP, classification, or report generation in a short period may hit rate limits.
- CSV import uses a simple comma split (does not handle commas inside quoted fields).

---

Built as part of the Zidio Development Internship — Project LOOP, Web Development Track.