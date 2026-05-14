'use client';

import { motion } from 'framer-motion';
import { type CellState } from '@/hooks/useSudoku';

interface Props {
  board: CellState[][];
  selected: [number, number] | null;
  onSelect: (row: number, col: number) => void;
  masked?: boolean;
}

export function SudokuGrid({ board, selected, onSelect, masked = false }: Props) {
  if (!board.length) return null;

  const [selRow, selCol] = selected ?? [-1, -1];

  function getCellClasses(row: number, col: number, cell: CellState): string {
    if (masked) return 'bg-zinc-900/50';

    const isSelected = row === selRow && col === selCol;
    const sameLine =
      !isSelected &&
      selected !== null &&
      (row === selRow ||
        col === selCol ||
        (Math.floor(row / 3) === Math.floor(selRow / 3) &&
          Math.floor(col / 3) === Math.floor(selCol / 3)));
    const sameValue =
      !isSelected &&
      selected !== null &&
      cell.value !== 0 &&
      cell.value === board[selRow]?.[selCol]?.value;

    let bg = '';
    if (cell.isConflict) bg = 'bg-red-500/15';
    else if (isSelected) bg = 'bg-blue-500/25';
    else if (sameValue) bg = 'bg-blue-500/10';
    else if (sameLine) bg = 'bg-white/[0.035]';

    let text = '';
    if (cell.isConflict) text = 'text-red-400';
    else if (cell.isHint) text = 'text-emerald-400';
    else if (!cell.isGiven) text = 'text-blue-400';
    else text = 'text-zinc-100';

    return `${bg} ${text}`;
  }

  function getBorderClasses(row: number, col: number): string {
    let cls = 'border border-zinc-700/50 ';
    if (col % 3 === 0 && col !== 0) cls += 'border-l border-l-zinc-400 ';
    if (row % 3 === 0 && row !== 0) cls += 'border-t border-t-zinc-400 ';
    return cls;
  }

  return (
    <div
      className="grid grid-cols-9 w-full max-w-[396px] border-2 border-zinc-400 rounded overflow-hidden"
      role="grid"
      aria-label="Sudoku board"
    >
      {board.map((rowCells, row) =>
        rowCells.map((cell, col) => (
          <motion.div
            key={`${row}-${col}`}
            role="gridcell"
            aria-label={`Row ${row + 1}, Column ${col + 1}${cell.value ? `, value ${cell.value}` : ', empty'}`}
            className={`
              relative aspect-square
              flex items-center justify-center
              select-none cursor-pointer
              transition-colors duration-75
              text-[15px] sm:text-[18px] font-medium
              ${getCellClasses(row, col, cell)}
              ${getBorderClasses(row, col)}
            `}
            onPointerDown={() => onSelect(row, col)}
            whileTap={{ scale: 0.88 }}
          >
            {masked ? null : cell.value !== 0 ? (
              <motion.span
                key={`v-${row}-${col}-${cell.value}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25, duration: 0.15 }}
              >
                {cell.value}
              </motion.span>
            ) : cell.notes.size > 0 ? (
              <NoteGrid notes={cell.notes} />
            ) : null}
          </motion.div>
        ))
      )}
    </div>
  );
}

function NoteGrid({ notes }: { notes: Set<number> }) {
  return (
    <div className="grid grid-cols-3 w-full h-full p-[1px]">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
        <span
          key={n}
          className={`flex items-center justify-center text-[6px] sm:text-[7px] leading-none font-normal ${
            notes.has(n) ? 'text-zinc-400' : 'text-transparent'
          }`}
        >
          {n}
        </span>
      ))}
    </div>
  );
}
