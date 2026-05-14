import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

const DIFFICULTIES = [
  {
    key: 'easy',
    label: 'Easy',
    desc: 'A gentle warmup. Perfect for beginners.',
    time: '~5 min',
    badge: 'text-emerald-500 dark:text-emerald-400',
    hover: 'hover:border-emerald-500/40',
  },
  {
    key: 'medium',
    label: 'Medium',
    desc: 'Requires some strategy. Most popular.',
    time: '~15 min',
    badge: 'text-yellow-500 dark:text-yellow-400',
    hover: 'hover:border-yellow-500/40',
  },
  {
    key: 'hard',
    label: 'Hard',
    desc: 'Fewer givens. Logic chains required.',
    time: '~30 min',
    badge: 'text-orange-500 dark:text-orange-400',
    hover: 'hover:border-orange-500/40',
  },
  {
    key: 'expert',
    label: 'Expert',
    desc: 'Near-minimal. For the patient mind.',
    time: '~60 min',
    badge: 'text-red-500 dark:text-red-400',
    hover: 'hover:border-red-500/40',
  },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col pb-20 sm:pb-0">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-1.5">
          <span className="text-base font-semibold tracking-tight">ZenSudoku</span>
          <span className="text-orange-500 text-sm">✦</span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/auth/signin"
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors px-3 py-1.5"
          >
            Sign in
          </Link>
          <Link
            href="/pro"
            className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Pro <span className="text-orange-500">✦</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 mb-4">
          nFactorial Incubator 2026
        </p>

        <h1 className="font-playfair italic text-5xl sm:text-6xl md:text-7xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight mb-4">
          The Sudoku experience,<br className="hidden sm:block" /> reimagined.
        </h1>

        <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-md mb-12 leading-relaxed">
          Clean. Distraction-free. Elegant. A puzzle game built for focus.
        </p>

        {/* Daily challenge CTA */}
        <DailyButton />

        <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-4 mb-14">
          New puzzle every day at midnight
        </p>

        {/* Difficulty cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mb-16">
          {DIFFICULTIES.map((d) => (
            <Link
              key={d.key}
              href={`/game/${d.key}`}
              className={`
                group flex items-center justify-between
                p-5 rounded-xl border
                border-zinc-200 dark:border-zinc-800
                bg-white dark:bg-zinc-900/50
                ${d.hover}
                transition-all duration-200
                hover:shadow-sm
              `}
            >
              <div className="text-left">
                <div className={`text-sm font-semibold mb-0.5 ${d.badge}`}>{d.label}</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">{d.desc}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">{d.time}</span>
                <ArrowIcon className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <p className="text-xs text-zinc-300 dark:text-zinc-700">
          Built by Damir Iskakov · nFactorial 2026
        </p>
      </main>
    </div>
  );
}

function DailyButton() {
  return (
    <Link
      href="/game/daily"
      className="
        relative inline-flex items-center gap-2
        px-7 py-3.5 rounded-xl
        bg-zinc-900 dark:bg-zinc-100
        text-zinc-100 dark:text-zinc-900
        text-sm font-semibold
        transition-all duration-200
        hover:bg-zinc-800 dark:hover:bg-zinc-200
        before:absolute before:inset-0 before:rounded-xl
        before:ring-2 before:ring-orange-500/40
        before:animate-pulse
      "
    >
      <CalendarIcon className="w-4 h-4 text-orange-500" />
      Daily Challenge
    </Link>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 18l6-6-6-6" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}
