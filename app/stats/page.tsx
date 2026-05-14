'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getResults, type GameResult } from '@/lib/stats';
import { Skeleton } from '@/components/Skeleton';
import { formatTime } from '@/components/GameControls';

// ─── helpers ──────────────────────────────────────────────────────────────────

function computeStats(results: GameResult[]) {
  const wins = results.filter((r) => r.won);
  const total = results.length;
  const winRate = total > 0 ? Math.round((wins.length / total) * 100) : 0;

  const diffs = ['easy', 'medium', 'hard', 'expert'] as const;
  const bestTimes: Record<string, number | null> = {};
  const avgTimes: Record<string, number | null> = {};

  for (const d of diffs) {
    const dWins = wins.filter((r) => r.difficulty === d);
    bestTimes[d] = dWins.length ? Math.min(...dWins.map((r) => r.time)) : null;
    avgTimes[d] = dWins.length
      ? Math.round(dWins.reduce((s, r) => s + r.time, 0) / dWins.length)
      : null;
  }

  // Streaks (based on days with at least one win)
  const wonDays = new Set(wins.map((r) => r.date));
  let current = 0;
  const d = new Date();
  while (wonDays.has(d.toISOString().split('T')[0])) {
    current++;
    d.setDate(d.getDate() - 1);
  }

  const sorted = [...wonDays].sort();
  let longest = 0;
  let streak = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) { streak = 1; continue; }
    const diff =
      (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000;
    streak = diff === 1 ? streak + 1 : 1;
    if (streak > longest) longest = streak;
  }
  if (streak > longest) longest = streak;

  return { total, wins: wins.length, winRate, bestTimes, avgTimes, currentStreak: current, longestStreak: longest };
}

// ─── heatmap ──────────────────────────────────────────────────────────────────

interface HeatCell {
  date: string;
  count: number;
  future: boolean;
}

function buildWeeks(results: GameResult[]): HeatCell[][] {
  const countMap = new Map<string, number>();
  for (const r of results) {
    countMap.set(r.date, (countMap.get(r.date) ?? 0) + 1);
  }

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const dayOfWeek = today.getDay(); // 0=Sun

  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + (6 - dayOfWeek));

  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 52 * 7 + 1);

  const weeks: HeatCell[][] = [];
  const cur = new Date(startDate);

  while (cur <= endDate) {
    const week: HeatCell[] = [];
    for (let i = 0; i < 7; i++) {
      const dateStr = cur.toISOString().split('T')[0];
      week.push({
        date: dateStr,
        count: countMap.get(dateStr) ?? 0,
        future: dateStr > todayStr,
      });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
}

function cellBg(count: number, future: boolean): string {
  if (future) return 'bg-transparent';
  if (count === 0) return 'bg-zinc-800';
  if (count === 1) return 'bg-orange-500/30';
  if (count === 2) return 'bg-orange-500/55';
  if (count === 3) return 'bg-orange-500/75';
  return 'bg-orange-500';
}

function getMonthLabel(weeks: HeatCell[][], wi: number): string {
  if (wi === 0) return new Date(weeks[0][0].date).toLocaleString('en', { month: 'short' });
  const cur = new Date(weeks[wi][0].date).getMonth();
  const prev = new Date(weeks[wi - 1][0].date).getMonth();
  if (cur !== prev) return new Date(weeks[wi][0].date).toLocaleString('en', { month: 'short' });
  return '';
}

// ─── display data ─────────────────────────────────────────────────────────────

const DIFF_LABEL: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
};

const DIFF_COLOR: Record<string, string> = {
  easy: 'text-emerald-400',
  medium: 'text-yellow-400',
  hard: 'text-orange-400',
  expert: 'text-red-400',
};

// ─── page ─────────────────────────────────────────────────────────────────────

export default function StatsPage() {
  const [results, setResults] = useState<GameResult[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setResults(getResults());
    setReady(true);
  }, []);

  if (!ready) return <LoadingSkeleton />;

  const stats = computeStats(results);
  const weeks = buildWeeks(results);
  const empty = results.length === 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 sm:pb-10">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Back
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="text-base font-semibold">Statistics</span>
          <span className="text-orange-500 text-sm">✦</span>
        </div>
        <div className="w-12" />
      </header>

      <div className="max-w-2xl mx-auto px-5 py-7 space-y-10">
        {empty ? (
          <EmptyState />
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Games', value: String(stats.total) },
                { label: 'Win Rate', value: `${stats.winRate}%` },
                { label: 'Streak', value: `${stats.currentStreak}d`, sub: `best ${stats.longestStreak}d` },
              ].map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-4 text-center"
                >
                  <div className="text-2xl font-bold tabular-nums">{card.value}</div>
                  {card.sub && (
                    <div className="text-[10px] text-zinc-600 mt-0.5">{card.sub}</div>
                  )}
                  <div className="text-[11px] uppercase tracking-wider text-zinc-500 mt-1.5">
                    {card.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Best & average times */}
            {stats.wins > 0 && (
              <section>
                <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-4">
                  Times by Difficulty
                </h2>
                <div className="space-y-[1px] rounded-xl overflow-hidden border border-zinc-800">
                  {(['easy', 'medium', 'hard', 'expert'] as const).map((d) => (
                    <div
                      key={d}
                      className="flex items-center justify-between bg-zinc-900 px-4 py-3 first:rounded-t-xl last:rounded-b-xl"
                    >
                      <span className={`text-sm font-medium ${DIFF_COLOR[d]}`}>
                        {DIFF_LABEL[d]}
                      </span>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-[10px] text-zinc-600 uppercase tracking-wide">Avg</div>
                          <div className="text-xs text-zinc-400 tabular-nums font-mono">
                            {stats.avgTimes[d] != null ? formatTime(stats.avgTimes[d]!) : '—'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-zinc-600 uppercase tracking-wide">Best</div>
                          <div className="text-sm text-zinc-100 tabular-nums font-mono font-semibold">
                            {stats.bestTimes[d] != null ? formatTime(stats.bestTimes[d]!) : '—'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Heatmap */}
            <section>
              <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-4">
                Activity{' '}
                <span className="normal-case font-normal text-zinc-700">— last 52 weeks</span>
              </h2>

              <div className="overflow-x-auto">
                <div className="inline-flex gap-[3px]">
                  {/* Day-of-week labels */}
                  <div className="flex flex-col gap-[3px] pt-[14px] pr-1">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, i) => (
                      <div
                        key={i}
                        className="h-[11px] w-3 flex items-center justify-end text-[7px] text-zinc-600"
                      >
                        {i % 2 === 1 ? label : ''}
                      </div>
                    ))}
                  </div>

                  {/* Week columns */}
                  <div className="flex flex-col gap-0">
                    {/* Month row */}
                    <div className="flex gap-[3px] h-[14px] mb-0">
                      {weeks.map((_, wi) => {
                        const label = getMonthLabel(weeks, wi);
                        return (
                          <div
                            key={wi}
                            className="w-[11px] text-[8px] text-zinc-500 overflow-visible whitespace-nowrap"
                          >
                            {label}
                          </div>
                        );
                      })}
                    </div>

                    {/* Day columns (transposed: render each week as a column) */}
                    <div className="flex gap-[3px]">
                      {weeks.map((week, wi) => (
                        <div key={wi} className="flex flex-col gap-[3px]">
                          {week.map((day) => (
                            <div
                              key={day.date}
                              title={`${day.date}: ${day.count} puzzle${day.count !== 1 ? 's' : ''}`}
                              className={`w-[11px] h-[11px] rounded-[2px] ${cellBg(day.count, day.future)}`}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-1.5 mt-3 text-[10px] text-zinc-600">
                <span>Less</span>
                {[0, 1, 2, 3, 4].map((n) => (
                  <div key={n} className={`w-[11px] h-[11px] rounded-[2px] ${cellBg(n, false)}`} />
                ))}
                <span>More</span>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

// ─── sub-components ───────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center py-20 gap-4 text-center">
      <span className="text-5xl">🧩</span>
      <p className="text-zinc-400 text-sm">No games yet. Start playing to see your stats.</p>
      <Link
        href="/"
        className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
      >
        Pick a puzzle →
      </Link>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
        <Skeleton className="w-14 h-5" />
        <Skeleton className="w-28 h-5" />
        <div className="w-12" />
      </header>
      <div className="max-w-2xl mx-auto px-5 py-7 space-y-10">
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <div className="space-y-[1px] rounded-xl overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 rounded-none first:rounded-t-xl last:rounded-b-xl" />
          ))}
        </div>
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </div>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}
