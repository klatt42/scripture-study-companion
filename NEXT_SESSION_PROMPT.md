# Scripture Study Companion - Next Session Prompt

Copy and paste this prompt to start your next Claude Code session:

---

## Prompt

```
I'm continuing work on Scripture Study Companion, a Bible study app forked from Pastor's Copilot.

Please read the progress file first:
cat ~/projects/scripture-study-companion/claude-progress.txt

Then start the dev server:
cd ~/projects/scripture-study-companion && PORT=3318 npm run dev

The app is mostly set up but needs significant feature buildout. Key areas:

**Immediate Priorities:**
1. Fix Bible Search AI error (line 169 in /api/bible-search/route.ts)
2. Transform Deep Dive page from sermon-writer to passage analysis tool
3. Create Reading Plans [id] dynamic route for individual plan pages
4. Build Verse Memory feature with SM-2 spaced repetition

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, Supabase, Claude AI

**Login:** klatt42@gmail.com / Scripture2025!

Let's continue building out these features. Start by reading claude-progress.txt for full context.
```

---

## Alternative: Quick Start Prompt

```
Continue Scripture Study Companion buildout.

1. Read: cat ~/projects/scripture-study-companion/claude-progress.txt
2. Start: cd ~/projects/scripture-study-companion && PORT=3318 npm run dev
3. Login: http://localhost:3318 (klatt42@gmail.com / Scripture2025!)

Focus on: Deep Dive transformation, Reading Plans [id] route, Verse Memory feature
```

---

## Session Context Summary

**What's Done:**
- Project setup, Supabase, credentials configured
- Branding updated throughout
- Auth working (auto-confirm, password reset)
- Dashboard with 13 feature cards
- Study Guide Generator fully transformed
- Study Topics page working

**What Needs Work:**
- Deep Dive (still sermon-writer code)
- Reading Plans (needs [id] route)
- Verse Memory (needs implementation)
- My Guides (references sermons)
- Bible Search (AI error to fix)
- Groups (basic shell only)

**Key Files:**
- `claude-progress.txt` - Full session history
- `supabase-schema-bible-study.sql` - Database schema
- `.env.local` - All credentials
- `scripts/reset-user.ts` - Password reset utility

---
