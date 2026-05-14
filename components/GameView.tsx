'use client';

import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSudoku } from '@/hooks/useSudoku';
import { type Difficulty, getDailyPuzzle, generatePuzzle } from '@/lib/sudoku-engine';
import { GameHeader } from './GameHeader';
import { GameControls } from './GameControls';
import { SudokuGrid } from './SudokuGrid';
import { NumberPad } from './NumberPad';
import { WinModal } from './WinModal';
import { GameOverModal } from './GameOverModal';
import { AICoach } from './AICoach';
import { DifficultySelector } from './DifficultySelector';

interface Props {
  difficulty: string;
}

function toDifficulty(d: string): Difficulty {
  if (['easy', 'medium', 'hard', 'expert'].includes(d)) return d as Difficulty;
  return 'medium';
}

export function GameView({ difficulty: difficultyParam }: Props) {
  const isDaily = difficultyParam === 'daily';
  const initialDifficulty = isDaily ? 'medium' : toDifficulty(difficultyParam);

  const { state, newGame, selectCell, enterValue, toggleNote, erase, undo, useHint, pause, resume } =
    useSudoku();

  const [notesMode, setNotesMode] = useState(false);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>(initialDifficulty);

  // Boot game
  useEffect(() => {
    if (isDaily) {
      const today = new Date().toISOString().split('T')[0];
      newGame('medium', getDailyPuzzle(today));
    } else {
      newGame(initialDifficulty);
    }
  }, []);

  // Page visibility → auto-pause
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) pause();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [pause]);

  // Keyboard input
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (state.isGameOver) return;

      if (e.key >= '1' && e.key <= '9') {
        const n = parseInt(e.key);
        notesMode ? toggleNote(n) : enterValue(n);
        return;
      }
      if (e.key === '0' || e.key === 'Backspace' || e.key === 'Delete') {
        erase(); return;
      }
      if (e.key === 'z' && !e.shiftKey) { undo(); return; }
      if (e.key === 'n') { setNotesMode((m) => !m); return; }
      if (e.key === 'h') { useHint(); return; }
      if (e.key === ' ') { e.preventDefault(); state.isRunning ? pause() : resume(); return; }

      if (!state.selected) return;
      const [r, c] = state.selected;
      const dirs: Record<string, [number, number]> = {
        ArrowUp:    [Math.max(0, r - 1), c],
        ArrowDown:  [Math.min(8, r + 1), c],
        ArrowLeft:  [r, Math.max(0, c - 1)],
        ArrowRight: [r, Math.min(8, c + 1)],
      };
      if (dirs[e.key]) { e.preventDefault(); selectCell(...dirs[e.key]); }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [notesMode, state.selected, state.isRunning, state.isGameOver,
      enterValue, toggleNote, erase, undo, useHint, selectCell, pause, resume]);

  const handleNewGame = useCallback((d: Difficulty) => {
    setCurrentDifficulty(d);
    setNotesMode(false);
    newGame(d);
  }, [newGame]);

  const handleRetry = useCallback(() => {
    setNotesMode(false);
    newGame(currentDifficulty);
  }, [newGame, currentDifficulty]);

  // Remaining digit counts
  const remainingCounts: Record<number, number> = {};
  for (let n = 1; n <= 9; n++) {
    let count = 0;
    for (const row of state.board) {
      for (const cell of row) { if (cell.value === n) count++; }
    }
    remainingCounts[n] = 9 - count;
  }

  const paused = !state.isRunning && !state.isComplete && !state.isGameOver;

  if (!state.board.length) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center px-4">
      <GameHeader difficulty={isDaily ? 'daily' : state.difficulty} />

      {!isDaily && (
        <div className="mb-5">
          <DifficultySelector current={currentDifficulty} onChange={handleNewGame} />
        </div>
      )}

      <div className="flex flex-col items-center gap-4 w-full">
        <GameControls
          elapsedSeconds={state.elapsedSeconds}
          mistakes={state.mistakes}
          hintsUsed={state.hintsUsed}
          notesMode={notesMode}
          isRunning={state.isRunning}
          isComplete={state.isComplete}
          isGameOver={state.isGameOver}
          onHint={useHint}
          onToggleNotes={() => setNotesMode((m) => !m)}
          onUndo={undo}
          onPause={pause}
          onResume={resume}
        />

        {/* Grid with pause overlay */}
        <div className="relative">
          <SudokuGrid
            board={state.board}
            selected={paused ? null : state.selected}
            onSelect={selectCell}
            masked={paused}
          />

          <AnimatePresence>
            {paused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 rounded cursor-pointer"
                onClick={resume}
              >
                <div className="flex flex-col items-center gap-2 text-zinc-400">
                  <PlayIcon className="w-10 h-10" />
                  <span className="text-sm">Tap to resume</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <NumberPad
          onNumber={(n) => notesMode ? toggleNote(n) : enterValue(n)}
          onErase={erase}
          notesMode={notesMode}
          remainingCounts={remainingCounts}
          disabled={paused || state.isComplete || state.isGameOver}
        />

        {state.board.length > 0 && !state.isGameOver && (
          <AICoach
            board={state.board}
            solution={state.solution}
            difficulty={state.difficulty}
            selected={state.selected}
          />
        )}

        <button
          onClick={handleRetry}
          className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors pb-8"
        >
          Restart puzzle
        </button>
      </div>

      <WinModal
        isOpen={state.isComplete}
        difficulty={isDaily ? 'daily' : state.difficulty}
        elapsedSeconds={state.elapsedSeconds}
        mistakes={state.mistakes}
        hintsUsed={state.hintsUsed}
        onNewGame={handleNewGame}
        onClose={() => {}}
      />

      <GameOverModal
        isOpen={state.isGameOver}
        difficulty={isDaily ? 'daily' : state.difficulty}
        onRetry={handleRetry}
        onNewDifficulty={handleNewGame}
      />
    </div>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z" /></svg>;
}
