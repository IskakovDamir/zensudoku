'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { type Difficulty } from '@/lib/sudoku-engine';
import { formatTime } from './GameControls';

interface Props {
  isOpen: boolean;
  difficulty: Difficulty | 'daily';
  elapsedSeconds: number;
  mistakes: number;
  hintsUsed: number;
  onNewGame: (d: Difficulty) => void;
  onClose: () => void;
}

function getStars(mistakes: number, hintsUsed: number): number {
  if (mistakes === 0 && hintsUsed === 0) return 3;
  if (mistakes <= 1 && hintsUsed <= 1) return 2;
  return 1;
}

export function WinModal({ isOpen, difficulty, elapsedSeconds, mistakes, hintsUsed, onNewGame, onClose }: Props) {
  const firedRef = useRef(false);
  const [copied, setCopied] = useState(false);
  const stars = getStars(mistakes, hintsUsed);

  useEffect(() => {
    if (isOpen && !firedRef.current) {
      firedRef.current = true;
      const end = Date.now() + 2000;
      const colors = ['#f97316', '#fb923c', '#fbbf24', '#34d399'];
      const frame = () => {
        confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors });
        confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    }
    if (!isOpen) firedRef.current = false;
  }, [isOpen]);

  function handleShare() {
    const mistakeText = mistakes === 1 ? '1 mistake' : `${mistakes} mistakes`;
    const text = `I solved ${difficulty === 'daily' ? 'the Daily' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Sudoku in ${formatTime(elapsedSeconds)} with ${mistakeText}! 🧩 zensudoku.com`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-zinc-900 border border-zinc-700/80 rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl"
            initial={{ scale: 0.88, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.88, y: 24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Stars */}
            <div className="flex justify-center gap-2 mb-5">
              {[1, 2, 3].map((i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1 + i * 0.12, type: 'spring', stiffness: 400 }}
                  className={`text-3xl ${i <= stars ? 'text-yellow-400' : 'text-zinc-700'}`}
                >
                  ★
                </motion.span>
              ))}
            </div>

            <h2 className="text-2xl font-semibold text-zinc-100 mb-1">Puzzle solved</h2>
            <p className="text-zinc-500 text-sm mb-6 capitalize">
              {difficulty === 'daily' ? 'Daily challenge' : `${difficulty} difficulty`}
            </p>

            {/* Stats */}
            <div className="flex justify-center gap-10 mb-7">
              <Stat label="Time" value={formatTime(elapsedSeconds)} />
              <Stat label="Mistakes" value={String(mistakes)} warn={mistakes > 0} />
              <Stat label="Hints" value={String(hintsUsed)} warn={hintsUsed > 0} />
            </div>

            {/* Share */}
            <button
              onClick={handleShare}
              className="w-full mb-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <ShareIcon className="w-4 h-4" />
              {copied ? 'Copied!' : 'Share result'}
            </button>

            {/* New game buttons */}
            <div className="grid grid-cols-2 gap-2">
              {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => onNewGame(d)}
                  className={`py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    d === difficulty
                      ? 'bg-orange-500 text-white hover:bg-orange-400'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`text-xl font-bold tabular-nums ${warn ? 'text-red-400' : 'text-zinc-100'}`}>
        {value}
      </span>
      <span className="text-[11px] text-zinc-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  );
}
