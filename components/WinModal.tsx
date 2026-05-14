'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { type Difficulty } from '@/lib/sudoku-engine';

interface Props {
  isOpen: boolean;
  difficulty: Difficulty;
  elapsedSeconds: number;
  mistakes: number;
  onNewGame: (difficulty: Difficulty) => void;
  onClose: () => void;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
}

function getStars(mistakes: number, difficulty: Difficulty): number {
  const maxMistakes = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 2 : 1;
  if (mistakes === 0) return 3;
  if (mistakes <= maxMistakes) return 2;
  return 1;
}

export function WinModal({ isOpen, difficulty, elapsedSeconds, mistakes, onNewGame, onClose }: Props) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (isOpen && !firedRef.current) {
      firedRef.current = true;
      const end = Date.now() + 1800;
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#f97316', '#fb923c', '#fdba74'] });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#f97316', '#fb923c', '#fdba74'] });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    }
    if (!isOpen) firedRef.current = false;
  }, [isOpen]);

  const stars = getStars(mistakes, difficulty);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 w-full max-w-sm mx-4 text-center"
            initial={{ scale: 0.85, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 20, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center gap-1 mb-4">
              {[1,2,3].map((i) => (
                <motion.span key={i} initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.12, type: 'spring', stiffness: 400 }}
                  className={`text-3xl ${i <= stars ? 'grayscale-0' : 'grayscale opacity-30'}`}>★</motion.span>
              ))}
            </div>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-1">Puzzle solved</h2>
            <p className="text-zinc-400 text-sm mb-6 capitalize">{difficulty} difficulty</p>
            <div className="flex justify-center gap-8 mb-8">
              <Stat label="Time" value={formatTime(elapsedSeconds)} />
              <Stat label="Mistakes" value={String(mistakes)} highlight={mistakes > 0} />
            </div>
            <div className="flex flex-col gap-2">
              {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map((d) => (
                <button key={d} onClick={() => onNewGame(d)}
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                    d === difficulty ? 'bg-orange-500 text-white hover:bg-orange-400' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}>
                  New {d}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`text-2xl font-bold tabular-nums ${highlight ? 'text-red-400' : 'text-zinc-100'}`}>{value}</span>
      <span className="text-xs text-zinc-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}
