# Scripture Study Companion - Bible Study Web App

## What This Is

Full-stack Bible study application with AI-powered analysis tools, reading plans, verse memorization (SM-2 spaced repetition), study groups, and community discussion. Forked from pastoraid-genesis, retargeted for lay Bible study.

## Tech Stack

- **Framework**: Next.js 15.5.6 (App Router, Turbopack)
- **Language**: TypeScript 5
- **UI**: Tailwind CSS v4 + React Hook Form + Zod
- **Database**: Supabase PostgreSQL (`fntcasdassvplgcabdty`)
- **Auth**: Supabase Auth (email/password)
- **AI**: Anthropic Claude (primary) + Google Gemini (fallback)
- **Testing**: Playwright
- **Deploy**: Vercel (auto-deploy from main)
- **Port**: 3318

## Structure

```
app/
  api/                     # 23 API routes
    bible-search/          # AI verse search
    deep-dive/             # Passage analysis
    study-guide/           # Inductive guide generator (COAI format)
    study-topics/          # AI topic suggestions
    reading-plans/         # Plan CRUD + progress
    memory-verses/         # SM-2 spaced repetition
    groups/                # Group management
    community/             # Forum posts & comments
    notes/                 # Notes CRUD
    calendar/              # Calendar events
    sessions/              # Session tracking
    theology-research/     # Academic research
    settings/              # User settings
  auth/                    # Login, signup, callback, signout
  dashboard/               # 16 protected pages
    bible-search/          deep-dive/        study-guide/
    study-topics/          reading-plans/    memory/
    my-guides/             groups/           community/
    notes/                 calendar/         theology-research/
    hymn-finder/           settings/

lib/
  ai/provider.ts           # Unified AI provider (Claude + Gemini)
  supabase/                # Client, server (+ admin), middleware
```

## Database Tables

profiles, user_settings, study_guides, study_topics, reading_plans, memory_verses, notes, calendar_events, hymns, groups, group_members, group_discussions, community_posts, community_comments, sessions.

All with RLS enabled. Service role bypasses in dev mode.

## Auth

- Supabase Auth with email/password
- Dev bypass: `NODE_ENV=development` uses mock user `00000000-0000-0000-0000-000000000001`
- Test creds: klatt42@gmail.com / Scripture2025!

## Dev Commands

```bash
PORT=3318 npm run dev
npm run build
npm run lint
```

## Environment (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=https://fntcasdassvplgcabdty.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ANTHROPIC_API_KEY=...
GOOGLE_API_KEY=...          # optional
```

## Conventions

- Server Components by default, `'use client'` for interactivity
- API routes check auth first, fallback to mock data on AI failure
- `maxDuration=300` on long-running AI endpoints
- Liturgical color scheme (purple primary)
- Schema file: `supabase-schema-bible-study.sql`
