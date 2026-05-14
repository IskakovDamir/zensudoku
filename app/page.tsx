import Link from 'next/link';
import { HeroVideo } from '@/components/HeroVideo';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_34FE3svcl12b2mgx7SoGywRHsRw/hf_20260422_073929_65bbacae-dad3-4257-b8cc-316a7b2e5415.mp4';

const DIFFICULTIES = [
  {
    key: 'easy',
    label: 'Easy',
    desc: 'A gentle warmup. Perfect for beginners.',
    time: '~5 min',
    badge: 'text-emerald-400',
    ring: 'hover:ring-1 hover:ring-emerald-500/30',
  },
  {
    key: 'medium',
    label: 'Medium',
    desc: 'Requires some strategy. Most popular.',
    time: '~15 min',
    badge: 'text-yellow-400',
    ring: 'hover:ring-1 hover:ring-yellow-500/30',
  },
  {
    key: 'hard',
    label: 'Hard',
    desc: 'Fewer givens. Logic chains required.',
    time: '~30 min',
    badge: 'text-orange-400',
    ring: 'hover:ring-1 hover:ring-orange-500/30',
  },
  {
    key: 'expert',
    label: 'Expert',
    desc: 'Near-minimal. For the patient mind.',
    time: '~60 min',
    badge: 'text-red-400',
    ring: 'hover:ring-1 hover:ring-red-500/30',
  },
] as const;

export default function HomePage() {
  return (
    <div className="pb-20 sm:pb-0">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ height: '100dvh' }}>
        {/* Video background */}
        <HeroVideo src={VIDEO_URL} />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(160deg, rgba(140,185,240,0.18) 0%, rgba(8,8,14,0.82) 100%)',
          }}
        />

        {/* ── Navbar ─────────────────────────────────────────────────────── */}
        <nav className="hero-nav">
          {/* Left: brand */}
          <div className="flex items-center gap-2">
            <span
              className="text-[17px] font-bold text-white leading-none"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              ZenSudoku
            </span>
            <span
              className="text-[11px] italic text-orange-400 leading-none font-light"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            >
              ✦ PRO
            </span>
          </div>

          {/* Right: links + upgrade */}
          <div className="flex items-center gap-1 sm:gap-5">
            <div className="hidden sm:flex items-center gap-5">
              {[
                { href: '/game/daily', label: 'Daily' },
                { href: '/leaderboard', label: 'Leaderboard' },
                { href: '/stats', label: 'Stats' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-[13px] text-white/70 hover:text-white transition-colors"
                  style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                  {label}
                </Link>
              ))}
            </div>

            <Link
              href="/pro"
              className="hero-ghost-btn px-4 py-1.5 text-[13px] text-white/90 hover:text-white transition-colors whitespace-nowrap"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            >
              Upgrade ✦
            </Link>
          </div>
        </nav>

        {/* ── Bottom content ──────────────────────────────────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-10 pb-24 sm:pb-16 lg:pb-12">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10 lg:gap-20">

            {/* LEFT: text */}
            <div className="flex flex-col gap-5 max-w-xl">
              {/* Badge */}
              <span
                className="hero-badge"
                style={{ fontFamily: 'var(--font-dm-sans)' }}
              >
                The sudoku experience, reimagined
              </span>

              {/* Headline */}
              <h1
                className="text-[46px] sm:text-[58px] text-white leading-[1.1] tracking-tight"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                Play with
                <br />
                <em>intention.</em>
              </h1>

              {/* Subtitle */}
              <p
                className="text-[15px] font-light text-white/55 leading-relaxed max-w-sm"
                style={{ fontFamily: 'var(--font-dm-sans)' }}
              >
                Clean, distraction-free, and backed by an AI coach that teaches
                technique — not just answers.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <Link
                  href="/game/easy"
                  className="px-6 py-2.5 rounded-full bg-white text-zinc-900 text-[14px] font-medium hover:bg-zinc-100 transition-colors"
                  style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                  Start playing
                </Link>
                <Link
                  href="/game/daily"
                  className="hero-ghost-btn px-6 py-2.5 text-[14px] text-white/90 hover:text-white transition-colors"
                  style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                  Today&apos;s challenge →
                </Link>
              </div>
            </div>

            {/* RIGHT: stats cards */}
            <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-[280px] overflow-x-auto pb-1 lg:overflow-visible">
              {/* Players today */}
              <div className="hero-card px-5 py-4 flex-shrink-0 w-[200px] lg:w-auto">
                <div
                  className="text-[32px] font-bold text-white leading-none mb-1"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  12k+
                </div>
                <div
                  className="text-[10px] uppercase tracking-[0.2em] text-white/45 font-light"
                  style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                  Players today
                </div>
              </div>

              {/* Daily puzzle */}
              <div className="hero-card px-5 py-4 flex-shrink-0 w-[200px] lg:w-auto">
                <div
                  className="text-[32px] font-bold text-white leading-none mb-1"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  #247
                </div>
                <div
                  className="text-[10px] uppercase tracking-[0.2em] text-white/45 font-light"
                  style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                  Daily puzzle
                </div>
              </div>

              {/* AI Coach */}
              <div className="hero-card px-5 py-4 flex-shrink-0 w-[200px] lg:w-auto">
                <div className="flex items-center gap-2 mb-2">
                  {/* Pulsing dot */}
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span
                    className="text-[11px] text-emerald-400 font-light"
                    style={{ fontFamily: 'var(--font-dm-sans)' }}
                  >
                    AI Coach active
                  </span>
                </div>
                <div
                  className="text-[22px] font-bold text-white leading-tight mb-0.5"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  Ask anything
                </div>
                <div
                  className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-light"
                  style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                  Powered by Claude
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Difficulty picker ─────────────────────────────────────────────── */}
      <section className="bg-zinc-950 px-5 py-20">
        <div className="max-w-2xl mx-auto">
          <p
            className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 text-center mb-8"
            style={{ fontFamily: 'var(--font-dm-sans)' }}
          >
            Choose your difficulty
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-16">
            {DIFFICULTIES.map((d) => (
              <Link
                key={d.key}
                href={`/game/${d.key}`}
                className={`
                  group flex items-center justify-between
                  p-5 rounded-xl border border-zinc-800
                  bg-zinc-900/50 transition-all duration-200
                  hover:bg-zinc-900 ${d.ring}
                `}
              >
                <div className="text-left">
                  <div className={`text-sm font-semibold mb-0.5 ${d.badge}`}>{d.label}</div>
                  <div className="text-sm text-zinc-500">{d.desc}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-zinc-600 tabular-nums">{d.time}</span>
                  <ChevronRightIcon className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>

          <p className="text-xs text-zinc-700 text-center">
            Built by Damir Iskakov · nFactorial 2026
          </p>
        </div>
      </section>
    </div>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 18l6-6-6-6" />
    </svg>
  );
}
