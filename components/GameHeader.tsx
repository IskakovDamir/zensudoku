'use client';

import { motion } from 'framer-motion';
import { type Difficulty } from '@/lib/sudoku-engine';

interface Props {
  difficulty: Difficulty;
  mistakes: number;
  elapsedSeconds: number;
  isRunning: boolean;
  onPause: () => void;
  onResume: () => void;
}

const MAX_MISTAKES = 3;

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy', medium: 'Medium', hard: 'Hard', expert: 'Expert',
};

export function GameHeader({ difficulty, mistakes, elapsedSeconds, isRunning, onPause, onResume }: Props) {
  return (
    <div className="flex items-center justify-between w-full max-w-[396px]">
      <span className="text-sm font-medium text-zinc-400 uppercase tracking-widest">{DIFFICULTY_LABELS[difficulty]}</span>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: MAX_MISTAKES }).map((_, i) => (
            <motion.div key={i} animate={i < mistakes ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.3 }}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${i < mistakes ? 'bg-red-500' : 'bg-zinc-700'}`}
            />
          ))}
        </div>
        <button onClick={isRunning ? onPause : onResume} className="flex items-center gap-1.5 text-sm font-mono text-zinc-300 hover:text-zinc-100 transition-colors">
          <span className="tabular-nums">{formatTime(elapsedSeconds)}</span>
          {isRunning ? <PauseIcon className="w-3.5 h-3.5 text-zinc-500" /> : <PlayIcon className="w-3.5 h-3.5 text-zinc-500" />}
        </button>
      </div>
    </div>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>;
}
function PlayIcon({ className }: { className?: string }) {
  return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z" /></svg>;
}
