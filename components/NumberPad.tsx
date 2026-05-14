'use client';

import { motion } from 'framer-motion';

interface Props {
  onNumber: (n: number) => void;
  onErase: () => void;
  onUndo: () => void;
  notesMode: boolean;
  onToggleNotes: () => void;
  remainingCounts: Record<number, number>;
}

export function NumberPad({ onNumber, onErase, onUndo, notesMode, onToggleNotes, remainingCounts }: Props) {
  return (
    <div className="flex flex-col gap-3 w-full max-w-[396px]">
      <div className="flex gap-2">
        <ActionButton onClick={onUndo} label="Undo" icon={UndoIcon} />
        <ActionButton onClick={onErase} label="Erase" icon={EraseIcon} />
        <ActionButton onClick={onToggleNotes} label="Notes" icon={NotesIcon} active={notesMode} />
      </div>
      <div className="grid grid-cols-9 gap-1.5">
        {[1,2,3,4,5,6,7,8,9].map((n) => {
          const remaining = remainingCounts[n] ?? 9;
          const exhausted = remaining === 0;
          return (
            <motion.button key={n} onPointerDown={() => !exhausted && onNumber(n)} whileTap={{ scale: 0.88 }}
              className={`flex flex-col items-center justify-center h-12 rounded-md text-xl font-semibold transition-colors ${
                exhausted ? 'text-zinc-600 bg-zinc-800/40 cursor-default' : 'text-zinc-100 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600'
              } ${notesMode ? 'ring-1 ring-orange-500/40' : ''}`}
            >
              {n}
              {!exhausted && <span className="text-[9px] text-zinc-500 leading-none mt-0.5">{remaining}</span>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function ActionButton({ onClick, label, icon: Icon, active }: { onClick: () => void; label: string; icon: React.FC<{ className?: string }>; active?: boolean }) {
  return (
    <motion.button onPointerDown={onClick} whileTap={{ scale: 0.92 }}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm transition-colors flex-1 justify-center ${
        active ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/40' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
      }`}
    >
      <Icon className="w-4 h-4" />{label}
    </motion.button>
  );
}

function UndoIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>;
}
function EraseIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2v-7a2 2 0 00-.586-1.414L13 1.586A2 2 0 0011.586 1H5a2 2 0 00-2 2v7a2 2 0 00.586 1.414z" /></svg>;
}
function NotesIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
}
