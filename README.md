# ZenSudoku ✦

**The Sudoku experience, reimagined.**

> Built for nFactorial Incubator Selection 2026 — by Damir Iskakov

---

## What is this?

ZenSudoku is a production-grade Sudoku web app designed around clarity and focus. Every puzzle is algorithmically generated with a guaranteed unique solution. An on-board AI Coach, powered by Claude, teaches strategy without giving away answers — so you get better, not just luckier.

---

## Who is it for?

| Audience | Why it works |
|---|---|
| **Casual players** | Daily challenge, clean UI, no accounts required |
| **Competitive speedrunners** | Time tracking, mistake counter, per-difficulty best times |
| **Seniors** | Large tap targets, high-contrast dark mode, no clutter |

---

## Why is it valuable?

**Retention**: Daily challenge + streaks bring users back every day without push notifications.

**Monetization**: Free tier is fully playable. Pro ($4.99/mo) unlocks unlimited AI Coach queries, custom themes, and detailed statistics. The AI Coach is the stickiest feature — it creates genuine learning loops that keep users engaged longer.

**Defensibility**: The AI coaching layer (not just hints, but *explanations*) is hard to replicate without an LLM backend. Traditional Sudoku apps show you the answer; ZenSudoku teaches you why.

---

## Features

- 🧩 **4 difficulty levels** — Easy, Medium, Hard, Expert
- 📅 **Daily challenge** — one shared puzzle per day, seeded by date
- 🧠 **AI Coach** — streaming Claude-powered hints that explain techniques, not answers
- 📊 **Statistics** — win rate, best times, activity heatmap (GitHub-style)
- ✏️ **Notes mode** — pencil in candidates per cell
- ↩️ **Undo history** — full game undo stack
- 💡 **Smart hints** — highlights the cell and explains the technique (3 per game)
- ⏸️ **Auto-pause** — hides the board when you switch tabs
- 🌗 **Dark/light mode** — system preference + manual toggle
- 📱 **Mobile-first** — responsive grid, bottom navigation, iOS safe area support
- 🎉 **Win celebration** — confetti + star rating based on mistakes and hints used

---

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16 App Router | SSG for game routes, streaming API routes for AI |
| Styling | Tailwind CSS v4 | Zero-config, responsive, dark mode via class |
| Animation | Framer Motion v12 | Spring physics for grid cells, modal transitions |
| AI | Anthropic Claude (claude-haiku) | Fastest model, 200-token responses, streaming |
| Auth/DB | Supabase | PostgreSQL + RLS, realtime leaderboard ready |
| Fonts | Onest + Playfair Display | Clean body + editorial hero; no AI-generated look |
| Deploy | Vercel | Zero-config Next.js, edge CDN, env management |

The puzzle engine uses a genuine backtracking algorithm with a seeded PRNG (mulberry32) — no hardcoded puzzles. Uniqueness is verified by counting solutions and stopping at 2.

---

## Business Model

```
Free Tier          Pro ($4.99/mo)       B2B (future)
─────────────      ──────────────       ────────────
5 daily puzzles    Unlimited play       White-label SDK
5 AI queries/day   Unlimited AI Coach   Senior care apps
Basic stats        Advanced stats       Corporate wellness
                   Custom themes        API access
```

Target: 10,000 MAU within 6 months post-launch. 2% Pro conversion = $1,000 MRR.

---

## Setup

```bash
git clone https://github.com/IskakovDamir/zensudoku
cd zensudoku
npm install
cp .env.example .env.local
# Fill in your keys in .env.local
npm run dev
```

Required environment variables:

```env
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Add secrets (one-time setup)
vercel env add ANTHROPIC_API_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Deploy
vercel --prod
```

---

## Live Demo

**[zensudoku.vercel.app](https://zensudoku.vercel.app)**

---

*Built with care in Almaty, Kazakhstan — nFactorial Incubator 2026*
