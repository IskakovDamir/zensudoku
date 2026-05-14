'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { type Difficulty } from '@/lib/sudoku-engine';

interface Props {
  isOpen: boolean;
  difficulty: Difficulty | 'daily';
  onRetry: () => void;
  onNewDifficulty: (d: Difficulty) => void;
}

export function GameOverModal({ isOpen, difficulty, onRetry, onNewDifficulty }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl p-8 w-full max-w-sm text-center" initial={{ scale: 0.88, y: 24, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.88, y: 24, opacity: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }}>
            <div className="text-5xl mb-4">💀</div>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-2">Game Over</h2>
            <p className="text-zinc-400 text-sm mb-8">You made 3 mistakes. <span className="capitalize">{difficulty === 'daily' ? 'Daily challenge' : `${difficulty} mode`}</span></p>
            <button onClick={onRetry} className="w-full mb-3 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-medium transition-colors">Try again</button>
            <div className="grid grid-cols-2 gap-2">
              {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).filter((d) => d !== difficulty).map((d) => (
                <button key={d} onClick={() => onNewDifficulty(d)} className="py-2 rounded-lg text-sm font-medium capitalize bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors">{d}</button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
