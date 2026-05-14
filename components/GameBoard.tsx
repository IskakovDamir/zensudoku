'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSudoku } from '@/hooks/useSudoku';
import { type Difficulty } from '@/lib/sudoku-engine';
import { SudokuGrid } from './SudokuGrid';
import { NumberPad } from './NumberPad';
import { GameHeader } from './GameHeader';
import { WinModal } from './WinModal';
import { DifficultySelector } from './DifficultySelector';
import { AICoach } from './AICoach';

export function GameBoard() {
  const { state, newGame, selectCell, enterValue, toggleNote, erase, undo, pause, resume } =
    useSudoku();
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [notesMode, setNotesMode] = useState(false);
  const [showWin, setShowWin] = useState(false);

  useEffect(() => { newGame('easy'); }, []);

  useEffect(() => {
    if (state.isComplete) setShowWin(true);
  }, [state.isComplete]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey) return;
      if (e.key >= '1' && e.key <= '9') {
        const n = parseInt(e.key);
        if (notesMode) toggleNote(n); else enterValue(n);
        return;
      }
      if (e.key === '0' || e.key === 'Backspace' || e.key === 'Delete') { erase(); return; }
      if (e.key === 'z' && !e.shiftKey) { undo(); return; }
      if (e.key === 'n') { setNotesMode((m) => !m); return; }
      if (!state.selected) return;
      const [r, c] = state.selected;
      const moves: Record<string, [number, number]> = {
        ArrowUp: [Math.max(0, r - 1), c],
        ArrowDown: [Math.min(8, r + 1), c],
        ArrowLeft: [r, Math.max(0, c - 1)],
        ArrowRight: [r, Math.min(8, c + 1)],
      };
      if (moves[e.key]) { e.preventDefault(); selectCell(...moves[e.key]); }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [notesMode, state.selected, enterValue, toggleNote, erase, undo, selectCell]);

  function handleDifficultyChange(d: Difficulty) { setDifficulty(d); setShowWin(false); newGame(d); }
  function handleNewGame(d: Difficulty) { setDifficulty(d); setShowWin(false); newGame(d); }

  const remainingCounts: Record<number, number> = {};
  for (let n = 1; n <= 9; n++) {
    let count = 0;
    for (const row of state.board) for (const cell of row) if (cell.value === n) count++;
    remainingCounts[n] = 9 - count;
  }

  if (!state.board.length) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl font-semibold tracking-tight text-zinc-100">ZenSudoku</span>
      </div>
      <DifficultySelector current={difficulty} onChange={handleDifficultyChange} />
      <GameHeader
        difficulty={state.difficulty}
        mistakes={state.mistakes}
        elapsedSeconds={state.elapsedSeconds}
        isRunning={state.isRunning}
        onPause={pause}
        onResume={resume}
      />
      <AnimatePresence mode="wait">
        {!state.isRunning && !state.isComplete ? (
          <motion.div key="paused" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950/90 rounded-sm cursor-pointer" onClick={resume}>
              <span className="text-zinc-400 text-sm">Paused — click to resume</span>
            </div>
            <SudokuGrid
              board={state.board.map((row) => row.map((cell) => ({ ...cell, value: 0, notes: new Set() })))}
              solution={state.solution} selected={null} onSelect={() => {}}
            />
          </motion.div>
        ) : (
          <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <SudokuGrid board={state.board} solution={state.solution} selected={state.selected} onSelect={selectCell} />
          </motion.div>
        )}
      </AnimatePresence>
      <NumberPad
        onNumber={(n) => (notesMode ? toggleNote(n) : enterValue(n))}
        onErase={erase} onUndo={undo} notesMode={notesMode}
        onToggleNotes={() => setNotesMode((m) => !m)}
        remainingCounts={remainingCounts}
      />
      {state.board.length > 0 && (
        <AICoach board={state.board} solution={state.solution} difficulty={state.difficulty} selected={state.selected} />
      )}
      <button onClick={() => handleNewGame(difficulty)} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
        New game
      </button>
      <WinModal
        isOpen={showWin} difficulty={state.difficulty} elapsedSeconds={state.elapsedSeconds}
        mistakes={state.mistakes} onNewGame={handleNewGame} onClose={() => setShowWin(false)}
      />
    </div>
  );
}
