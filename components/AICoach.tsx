'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Difficulty } from '@/lib/sudoku-engine';
import { type CellState } from '@/hooks/useSudoku';

interface Props {
  board: CellState[][];
  solution: number[][];
  difficulty: Difficulty;
  selected: [number, number] | null;
}

type HintLevel = 'nudge' | 'region' | 'value';

interface CoachResponse {
  hint: string;
  level: HintLevel;
}

export function AICoach({ board, solution, difficulty, selected }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CoachResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function askCoach() {
    setLoading(true); setError(null); setResponse(null);
    const boardState = board.map((row) => row.map((cell) => ({ value: cell.value, isGiven: cell.isGiven, isConflict: cell.isConflict })));
    try {
      const res = await fetch('/api/coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ board: boardState, difficulty, selected }) });
      if (!res.ok) throw new Error('Coach unavailable');
      setResponse(await res.json());
    } catch {
      setError('Coach is unavailable right now. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[396px]">
      <button onClick={() => { setIsOpen((o) => !o); if (!isOpen && !response) askCoach(); }}
        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
        <SparklesIcon className="w-4 h-4 text-orange-400" />
        AI Coach
        <ChevronIcon className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="mt-3 p-4 rounded-xl bg-zinc-800/60 border border-zinc-700/50">
              {loading && <p className="text-zinc-400 text-sm animate-pulse">Analyzing board...</p>}
              {error && <p className="text-red-400 text-sm">{error}</p>}
              {response && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <SparklesIcon className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-zinc-200 leading-relaxed">{response.hint}</p>
                  </div>
                  <button onClick={askCoach} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Another hint</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
}
function ChevronIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
}
