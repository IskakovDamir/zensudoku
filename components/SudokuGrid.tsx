'use client';

import { motion } from 'framer-motion';
import { type CellState } from '@/hooks/useSudoku';

interface Props {
  board: CellState[][];
  solution: number[][];
  selected: [number, number] | null;
  onSelect: (row: number, col: number) => void;
}

export function SudokuGrid({ board, solution, selected, onSelect }: Props) {
  if (!board.length) return null;
  const [selRow, selCol] = selected ?? [-1, -1];

  function getCellStyle(row: number, col: number, cell: CellState): string {
    const isSelected = row === selRow && col === selCol;
    const isHighlighted = !isSelected && (row === selRow || col === selCol ||
      (Math.floor(row / 3) === Math.floor(selRow / 3) && Math.floor(col / 3) === Math.floor(selCol / 3)));
    const isMatchingValue = !isSelected && selected !== null && cell.value !== 0 &&
      cell.value === board[selRow]?.[selCol]?.value;
    let base = 'relative flex items-center justify-center select-none cursor-pointer transition-colors duration-100 text-[18px] font-medium ';
    if (cell.isConflict) base += 'bg-red-500/20 text-red-400 ';
    else if (isSelected) base += 'bg-orange-500/25 text-orange-300 ';
    else if (isMatchingValue) base += 'bg-orange-500/10 text-orange-300/90 ';
    else if (isHighlighted) base += 'bg-white/[0.04] text-zinc-200 ';
    else if (cell.isGiven) base += 'text-zinc-200 ';
    else base += 'text-orange-400 ';
    return base;
  }

  function getBorderStyle(row: number, col: number): string {
    let cls = 'border border-zinc-700/60 ';
    if (col % 3 === 0 && col !== 0) cls += 'border-l-2 border-l-zinc-500 ';
    if (row % 3 === 0 && row !== 0) cls += 'border-t-2 border-t-zinc-500 ';
    return cls;
  }

  return (
    <div className="inline-grid grid-cols-9 border-2 border-zinc-500 rounded-sm overflow-hidden">
      {board.map((rowCells, row) =>
        rowCells.map((cell, col) => (
          <motion.div
            key={`${row}-${col}`}
            className={`w-11 h-11 sm:w-12 sm:h-12 ${getCellStyle(row, col, cell)} ${getBorderStyle(row, col)}`}
            onPointerDown={() => onSelect(row, col)}
            whileTap={{ scale: 0.92 }}
          >
            {cell.value !== 0 ? (
              <motion.span key={`${row}-${col}-${cell.value}`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.12 }}>
                {cell.value}
              </motion.span>
            ) : cell.notes.size > 0 ? (
              <div className="grid grid-cols-3 gap-0 w-full h-full p-[2px]">
                {[1,2,3,4,5,6,7,8,9].map((n) => (
                  <span key={n} className={`flex items-center justify-center text-[7px] leading-none font-normal ${cell.notes.has(n) ? 'text-zinc-400' : 'text-transparent'}`}>{n}</span>
                ))}
              </div>
            ) : null}
          </motion.div>
        ))
      )}
    </div>
  );
}
