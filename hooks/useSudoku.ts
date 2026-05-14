'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import {
  type Difficulty,
  type Puzzle,
  generatePuzzle,
  isComplete,
  validateBoard,
} from '@/lib/sudoku-engine';

export type CellState = {
  value: number;
  isGiven: boolean;
  notes: Set<number>;
  isConflict: boolean;
};

type GameState = {
  board: CellState[][];
  solution: number[][];
  seed: string;
  difficulty: Difficulty;
  selected: [number, number] | null;
  mistakes: number;
  isComplete: boolean;
  elapsedSeconds: number;
  isRunning: boolean;
  history: CellState[][][];
};

type Action =
  | { type: 'NEW_GAME'; puzzle: Puzzle; difficulty: Difficulty }
  | { type: 'SELECT_CELL'; row: number; col: number }
  | { type: 'ENTER_VALUE'; value: number }
  | { type: 'TOGGLE_NOTE'; value: number }
  | { type: 'ERASE' }
  | { type: 'UNDO' }
  | { type: 'TICK' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' };

function buildBoard(puzzle: Puzzle): CellState[][] {
  return puzzle.puzzle.map((row) =>
    row.map((val) => ({
      value: val,
      isGiven: val !== 0,
      notes: new Set<number>(),
      isConflict: false,
    }))
  );
}

function applyConflicts(board: CellState[][], solution: number[][]): CellState[][] {
  const raw = board.map((row) => row.map((c) => c.value));
  const { conflicts } = validateBoard(raw);
  const conflictSet = new Set(conflicts.map(([r, c]) => `${r},${c}`));
  return board.map((row, r) =>
    row.map((cell, c) => ({ ...cell, isConflict: conflictSet.has(`${r},${c}`) }))
  );
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'NEW_GAME': {
      const board = buildBoard(action.puzzle);
      return {
        ...state,
        board,
        solution: action.puzzle.solution,
        seed: action.puzzle.seed,
        difficulty: action.difficulty,
        selected: null,
        mistakes: 0,
        isComplete: false,
        elapsedSeconds: 0,
        isRunning: true,
        history: [],
      };
    }
    case 'SELECT_CELL':
      return { ...state, selected: [action.row, action.col] };
    case 'ENTER_VALUE': {
      if (!state.selected || state.isComplete) return state;
      const [row, col] = state.selected;
      const cell = state.board[row][col];
      if (cell.isGiven) return state;
      const prevBoard = state.board.map((r) => r.map((c) => ({ ...c, notes: new Set(c.notes) })));
      const newBoard = state.board.map((r) => r.map((c) => ({ ...c, notes: new Set(c.notes) })));
      newBoard[row][col] = { ...newBoard[row][col], value: action.value, notes: new Set() };
      const withConflicts = applyConflicts(newBoard, state.solution);
      const raw = withConflicts.map((r) => r.map((c) => c.value));
      const completed = isComplete(raw, state.solution);
      const wasWrong = action.value !== 0 && state.solution[row][col] !== action.value;
      return {
        ...state,
        board: withConflicts,
        mistakes: wasWrong ? state.mistakes + 1 : state.mistakes,
        isComplete: completed,
        isRunning: completed ? false : state.isRunning,
        history: [...state.history, prevBoard],
      };
    }
    case 'TOGGLE_NOTE': {
      if (!state.selected || state.isComplete) return state;
      const [row, col] = state.selected;
      const cell = state.board[row][col];
      if (cell.isGiven || cell.value !== 0) return state;
      const prevBoard = state.board.map((r) => r.map((c) => ({ ...c, notes: new Set(c.notes) })));
      const newBoard = state.board.map((r) => r.map((c) => ({ ...c, notes: new Set(c.notes) })));
      const notes = new Set(newBoard[row][col].notes);
      if (notes.has(action.value)) notes.delete(action.value);
      else notes.add(action.value);
      newBoard[row][col] = { ...newBoard[row][col], notes };
      return { ...state, board: newBoard, history: [...state.history, prevBoard] };
    }
    case 'ERASE': {
      if (!state.selected || state.isComplete) return state;
      const [row, col] = state.selected;
      if (state.board[row][col].isGiven) return state;
      const prevBoard = state.board.map((r) => r.map((c) => ({ ...c, notes: new Set(c.notes) })));
      const newBoard = state.board.map((r) => r.map((c) => ({ ...c, notes: new Set(c.notes) })));
      newBoard[row][col] = { ...newBoard[row][col], value: 0, notes: new Set() };
      return { ...state, board: applyConflicts(newBoard, state.solution), history: [...state.history, prevBoard] };
    }
    case 'UNDO': {
      if (state.history.length === 0) return state;
      const prev = state.history[state.history.length - 1];
      return { ...state, board: applyConflicts(prev, state.solution), history: state.history.slice(0, -1), isComplete: false, isRunning: true };
    }
    case 'TICK':
      return state.isRunning ? { ...state, elapsedSeconds: state.elapsedSeconds + 1 } : state;
    case 'PAUSE':
      return { ...state, isRunning: false };
    case 'RESUME':
      return { ...state, isRunning: true };
    default:
      return state;
  }
}

const initialState: GameState = {
  board: [], solution: [], seed: '', difficulty: 'easy',
  selected: null, mistakes: 0, isComplete: false,
  elapsedSeconds: 0, isRunning: false, history: [],
};

export function useSudoku() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const newGame = useCallback((difficulty: Difficulty) => {
    dispatch({ type: 'NEW_GAME', puzzle: generatePuzzle(difficulty), difficulty });
  }, []);

  const loadPuzzle = useCallback((puzzle: Puzzle, difficulty: Difficulty) => {
    dispatch({ type: 'NEW_GAME', puzzle, difficulty });
  }, []);

  const selectCell = useCallback((row: number, col: number) => {
    dispatch({ type: 'SELECT_CELL', row, col });
  }, []);

  const enterValue = useCallback((value: number) => dispatch({ type: 'ENTER_VALUE', value }), []);
  const toggleNote = useCallback((value: number) => dispatch({ type: 'TOGGLE_NOTE', value }), []);
  const erase = useCallback(() => dispatch({ type: 'ERASE' }), []);
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const resume = useCallback(() => dispatch({ type: 'RESUME' }), []);

  return { state, newGame, loadPuzzle, selectCell, enterValue, toggleNote, erase, undo, pause, resume };
}
