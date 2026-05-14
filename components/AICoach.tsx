'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type CellState } from '@/hooks/useSudoku';
import { type Difficulty } from '@/lib/sudoku-engine';

const DAILY_LIMIT = 5;

const EXAMPLE_PROMPTS = [
  'What strategy should I use?',
  'Why does 7 go here?',
  'Explain naked pairs',
  'What is a hidden single?',
];

function getUsageKey() {
  return `ai-coach-${new Date().toISOString().split('T')[0]}`;
}

function getQueriesUsed(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(getUsageKey()) ?? '0', 10);
}

function incrementQueries() {
  const key = getUsageKey();
  const n = parseInt(localStorage.getItem(key) ?? '0', 10);
  localStorage.setItem(key, String(n + 1));
}

interface Props {
  board: CellState[][];
  solution: number[][];
  difficulty: Difficulty;
  selected: [number, number] | null;
}

export function AICoach({ board, solution, difficulty, selected }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [queriesUsed, setQueriesUsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const responseRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Read localStorage only on client
  useEffect(() => {
    setQueriesUsed(getQueriesUsed());
  }, []);

  // Auto-scroll response
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen]);

  const hasReachedLimit = queriesUsed >= DAILY_LIMIT;
  const queriesLeft = DAILY_LIMIT - queriesUsed;

  const selectedHasValue = selected ? board[selected[0]]?.[selected[1]]?.value !== 0 : false;

  const askCoach = useCallback(
    async (prompt?: string) => {
      if (hasReachedLimit || isStreaming) return;

      const q = prompt ?? question.trim();

      setResponse('');
      setError(null);
      setIsStreaming(true);
      abortRef.current = new AbortController();

      const rawBoard = board.map((row) => row.map((c) => c.value));

      try {
        const res = await fetch('/api/ai-coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            board: rawBoard,
            solution,
            selectedCell: selected,
            userQuestion: q || undefined,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) throw new Error('HTTP ' + res.status);
        if (!res.body) throw new Error('No body');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let text = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
          setResponse(text);
        }

        incrementQueries();
        const used = getQueriesUsed();
        setQueriesUsed(used);
        setQuestion('');
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setError('Coach is unavailable. Check your ANTHROPIC_API_KEY.');
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [board, solution, selected, question, hasReachedLimit, isStreaming]
  );

  function handleClose() {
    if (isStreaming) {
      abortRef.current?.abort();
    }
    setIsOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askCoach();
    }
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen((o) => !o)}
        whileTap={{ scale: 0.94 }}
        className={`
          fixed bottom-5 right-5 z-40
          flex items-center gap-2
          px-4 py-2.5 rounded-full
          text-sm font-medium
          shadow-lg
          transition-colors duration-150
          ${isOpen
            ? 'bg-zinc-700 text-zinc-200'
            : 'bg-zinc-900 text-zinc-200 hover:bg-zinc-800 ring-1 ring-zinc-700'
          }
        `}
        aria-label="Open AI Coach"
      >
        <span>🧠</span>
        <span>Ask Coach</span>
        {!isOpen && queriesLeft < DAILY_LIMIT && (
          <span className="text-[10px] text-zinc-500 ml-0.5">{queriesLeft}/{DAILY_LIMIT}</span>
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="
              fixed bottom-20 right-5 z-40
              w-[calc(100vw-40px)] max-w-[380px]
              bg-zinc-900 border border-zinc-700/80
              rounded-2xl shadow-2xl
              flex flex-col overflow-hidden
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-100">AI Coach</span>
                <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20">
                  Claude <span className="text-orange-500">✦</span>
                </span>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Response area */}
            <div
              ref={responseRef}
              className="min-h-[100px] max-h-[200px] overflow-y-auto px-4 py-3 text-sm text-zinc-200 leading-relaxed"
            >
              {isStreaming && !response && (
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <span className="animate-pulse text-xs">Thinking</span>
                  <ThinkingDots />
                </div>
              )}

              {response && (
                <p className="whitespace-pre-wrap">
                  {response}
                  {isStreaming && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="inline-block w-0.5 h-3.5 bg-zinc-400 ml-0.5 align-middle"
                    />
                  )}
                </p>
              )}

              {error && <p className="text-red-400 text-xs">{error}</p>}

              {!response && !isStreaming && !error && (
                <p className="text-zinc-600 text-xs italic">
                  Ask about strategy, a specific cell, or a technique.
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-zinc-800" />

            {/* Quick actions */}
            <div className="px-4 py-2.5 flex flex-col gap-2">
              {/* Explain cell button */}
              {selected && !selectedHasValue && (
                <button
                  onClick={() => askCoach()}
                  disabled={hasReachedLimit || isStreaming}
                  className="
                    w-full text-left text-xs px-3 py-2 rounded-lg
                    bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20
                    hover:bg-blue-500/20 transition-colors
                    disabled:opacity-40 disabled:cursor-not-allowed
                    flex items-center gap-2
                  "
                >
                  <TargetIcon className="w-3.5 h-3.5 shrink-0" />
                  Explain cell R{selected[0] + 1}C{selected[1] + 1}
                </button>
              )}

              {/* Example prompts */}
              <div className="flex flex-wrap gap-1.5">
                {EXAMPLE_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => { setQuestion(p); askCoach(p); }}
                    disabled={hasReachedLimit || isStreaming}
                    className="
                      text-[11px] px-2.5 py-1 rounded-full
                      bg-zinc-800 text-zinc-400
                      hover:bg-zinc-700 hover:text-zinc-200
                      transition-colors
                      disabled:opacity-40 disabled:cursor-not-allowed
                    "
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-zinc-800 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={hasReachedLimit ? 'Daily limit reached' : 'Ask a question…'}
                  disabled={hasReachedLimit || isStreaming}
                  className="
                    flex-1 bg-zinc-800 text-zinc-100 text-sm
                    placeholder:text-zinc-600
                    rounded-lg px-3 py-2
                    outline-none focus:ring-1 focus:ring-zinc-600
                    disabled:opacity-40 disabled:cursor-not-allowed
                  "
                />
                <motion.button
                  onClick={() => askCoach()}
                  whileTap={{ scale: 0.88 }}
                  disabled={hasReachedLimit || isStreaming || (!question.trim() && !selected)}
                  className="
                    p-2 rounded-lg
                    bg-zinc-700 text-zinc-300
                    hover:bg-zinc-600 hover:text-zinc-100
                    transition-colors
                    disabled:opacity-40 disabled:cursor-not-allowed
                  "
                  aria-label="Send"
                >
                  <SendIcon className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Usage */}
              <div className="flex items-center justify-between mt-2 px-1">
                {hasReachedLimit ? (
                  <p className="text-[10px] text-red-400">
                    Daily limit reached. <span className="text-zinc-500">Resets at midnight.</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-zinc-600">
                    {queriesLeft} free {queriesLeft === 1 ? 'query' : 'queries'} left today
                  </p>
                )}
                <span className="text-[10px] text-zinc-700">AI-powered by Claude</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ThinkingDots() {
  return (
    <span className="flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
          className="w-1 h-1 rounded-full bg-zinc-500 inline-block"
        />
      ))}
    </span>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" strokeWidth={2} />
      <path strokeLinecap="round" strokeWidth={2}
        d="M12 2v3m0 14v3M2 12h3m14 0h3" />
    </svg>
  );
}
