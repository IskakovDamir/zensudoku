'use client';

import { motion } from 'framer-motion';

interface Props {
  onNumber: (n: number) => void;
  onErase: () => void;
  notesMode: boolean;
  remainingCounts: Record<number, number>;
  disabled?: boolean;
}

export function NumberPad({ onNumber, onErase, notesMode, remainingCounts, disabled }: Props) {
  return (
    <div className={`flex gap-1.5 w-full max-w-[396px] ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
        const remaining = remainingCounts[n] ?? 9;
        const exhausted = remaining === 0;
        return (
          <motion.button
            key={n}
            onPointerDown={() => !exhausted && onNumber(n)}
            whileTap={{ scale: 0.85 }}
            className={`flex-1 flex flex-col items-center justify-center h-12 rounded-lg text-lg font-semibold transition-colors duration-100 ${
              exhausted ? 'text-zinc-600 bg-zinc-800/30 cursor-default'
              : notesMode ? 'text-blue-300 bg-blue-500/10 ring-1 ring-blue-500/30 hover:bg-blue-500/20'
              : 'text-zinc-100 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600'
            }`}
          >
            {n}
            {!exhausted && <span className="text-[9px] text-zinc-500 leading-none">{remaining}</span>}
          </motion.button>
        );
      })}
      <motion.button
        onPointerDown={onErase}
        whileTap={{ scale: 0.85 }}
        className="flex-1 flex items-center justify-center h-12 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-400 hover:text-zinc-200 transition-colors"
        aria-label="Erase"
      >
        <BackspaceIcon className="w-5 h-5" />
      </motion.button>
    </div>
  );
}

function BackspaceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6H8.5a2 2 0 00-1.6.8L3 12l3.9 5.2a2 2 0 001.6.8H19a2 2 0 002-2V8a2 2 0 00-2-2h-7zm1 5l2 2m0-2l-2 2" />
    </svg>
  );
}
