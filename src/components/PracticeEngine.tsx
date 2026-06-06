'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, X as Multiply, Divide, ChevronRight, Activity, Target, Flame, CheckCircle2, XCircle, RotateCcw, Timer, Infinity as InfinityIcon } from 'lucide-react';
import { generateProblem, Problem, Operation, DifficultyLevel } from '@/lib/math';
import { cn } from '@/lib/utils';
import Numpad from './Numpad';

type Status = 'idle' | 'playing' | 'finished';

const TABLE_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const TIME_PRESETS: { label: string; sec: number }[] = [
  { label: '30s', sec: 30 },
  { label: '1m', sec: 60 },
  { label: '2m', sec: 120 },
  { label: '3m', sec: 180 },
  { label: '5m', sec: 300 },
  { label: '∞', sec: 0 },
];

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function PracticeEngine() {
  const [status, setStatus] = useState<Status>('idle');
  const [operation, setOperation] = useState<Operation>('addition');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('1-digit');
  const [tables, setTables] = useState<number[]>([2, 3, 4, 5]);
  const [durationSec, setDurationSec] = useState<number>(60);
  const [customMin, setCustomMin] = useState<string>('1');
  const [customSec, setCustomSec] = useState<string>('0');

  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [nextProblem, setNextProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const isMulDiv = operation === 'multiplication' || operation === 'division';

  // Keep latest values in refs so global key listener stays correct without re-binding
  const stateRef = useRef({
    status,
    currentProblem,
    userAnswer,
    operation,
    difficulty,
    tables,
  });
  stateRef.current = { status, currentProblem, userAnswer, operation, difficulty, tables };

  const genNext = useCallback(() => {
    return generateProblem(
      stateRef.current.operation,
      stateRef.current.difficulty,
      isMulDiv ? stateRef.current.tables : undefined
    );
  }, [isMulDiv]);

  const nextProblemRef = useRef<Problem | null>(null);
  nextProblemRef.current = nextProblem;

  const start = () => {
    if (isMulDiv && tables.length === 0) return;
    setCorrect(0);
    setIncorrect(0);
    setStreak(0);
    setBestStreak(0);
    setUserAnswer('');
    setTimeLeft(durationSec);
    setStatus('playing');
    setTimeout(() => {
      setCurrentProblem(generateProblem(operation, difficulty, isMulDiv ? tables : undefined));
      setNextProblem(generateProblem(operation, difficulty, isMulDiv ? tables : undefined));
    }, 0);
  };

  const endSession = () => setStatus('finished');

  // Countdown timer
  useEffect(() => {
    if (status !== 'playing' || durationSec === 0) return;
    if (timeLeft <= 0) {
      setStatus('finished');
      return;
    }
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setStatus('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [status, durationSec, timeLeft]);

  const handleSubmit = useCallback(() => {
    const { currentProblem: cp, userAnswer: ua } = stateRef.current;
    if (!cp || ua === '') return;

    const isCorrect = parseInt(ua) === cp.answer;

    if (isCorrect) {
      setCorrect((c) => c + 1);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
      setFeedback('correct');
      setCurrentProblem(nextProblemRef.current ?? genNext());
      setNextProblem(genNext());
      setUserAnswer('');
    } else {
      setIncorrect((i) => i + 1);
      setStreak(0);
      setFeedback('incorrect');
    }

    setTimeout(() => setFeedback(null), 400);
  }, [genNext]);

  const handleInput = useCallback((val: string) => {
    setUserAnswer((p) => (p.length >= 6 ? p : p + val));
  }, []);

  const handleDelete = useCallback(() => {
    setUserAnswer((p) => p.slice(0, -1));
  }, []);

  // Global keyboard listener while playing
  useEffect(() => {
    if (status !== 'playing') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleInput(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        endSession();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [status, handleInput, handleDelete, handleSubmit]);

  const toggleTable = (n: number) => {
    setTables((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n].sort((a, b) => a - b)));
  };

  const applyCustomTime = () => {
    const m = parseInt(customMin) || 0;
    const s = parseInt(customSec) || 0;
    const total = m * 60 + s;
    if (total > 0) setDurationSec(total);
  };

  const operations: { id: Operation; icon: any; label: string }[] = [
    { id: 'addition', icon: Plus, label: 'Add' },
    { id: 'subtraction', icon: Minus, label: 'Sub' },
    { id: 'multiplication', icon: Multiply, label: 'Mul' },
    { id: 'division', icon: Divide, label: 'Div' },
  ];

  const getDifficulties = (op: Operation): { id: DifficultyLevel; label: string }[] => {
    if (op === 'addition' || op === 'subtraction') {
      return [
        { id: '1-digit', label: '1 Digit' },
        { id: '2-digit', label: '2 Digits' },
        { id: '3-digit', label: '3 Digits' },
      ];
    }
    return [];
  };

  const total = correct + incorrect;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const canStart = !isMulDiv || tables.length > 0;
  const timeLow = durationSec > 0 && timeLeft <= 10;

  return (
    <div className="w-full max-w-[480px] min-h-[720px] relative">
      <div className="absolute inset-0 bg-slate-900 rounded-[3.5rem] border-[1px] border-white/10 shadow-[0_0_80px_rgba(34,211,238,0.15)] overflow-hidden">
        <motion.div
          animate={{ opacity: [0.1, 0.18, 0.1], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.12),transparent_70%)] pointer-events-none"
        />
      </div>

      <div className="relative z-10 min-h-[720px] flex flex-col p-6">
        {/* HUD — playing only */}
        {status === 'playing' && (
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2.5 rounded-2xl transition-all duration-300 shadow-lg',
                durationSec === 0 ? 'bg-slate-800/80 text-cyan-400 ring-1 ring-white/10' :
                timeLow ? 'bg-red-500/20 text-red-500 ring-2 ring-red-500/50' :
                'bg-slate-800/80 text-cyan-400 ring-1 ring-white/10'
              )}>
                {durationSec === 0 ? <InfinityIcon className="w-5 h-5" /> : <Timer className="w-5 h-5" />}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Time</span>
                <span className={cn('text-xl font-black tabular-nums leading-none', timeLow ? 'text-red-500' : 'text-white')}>
                  {durationSec === 0 ? '∞' : formatTime(timeLeft)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right flex flex-col">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Streak</span>
                <span className={cn('text-xl font-black italic leading-none transition-colors', streak > 0 ? 'text-orange-400' : 'text-slate-600')}>x{streak}</span>
              </div>
              <div className={cn(
                'p-2.5 rounded-2xl transition-all duration-300 shadow-lg',
                streak > 0 ? 'bg-orange-500/20 text-orange-400 ring-2 ring-orange-500/50' : 'bg-slate-800/80 text-slate-600 ring-1 ring-white/10'
              )}>
                <Flame className="w-5 h-5" />
              </div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {status === 'idle' ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-3xl flex items-center justify-center shadow-lg border border-white/20 mb-4">
                  <Target className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter">PRACTICE</h1>
                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] mt-2">No login · No save</p>
              </div>

              <div className="space-y-6 flex-1 pr-1">
                {/* Operation */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Operation</p>
                  <div className="grid grid-cols-4 gap-2">
                    {operations.map((op) => (
                      <button
                        key={op.id}
                        onClick={() => setOperation(op.id)}
                        className={cn(
                          'flex flex-col items-center justify-center py-4 rounded-2xl border-b-4 transition-all',
                          operation === op.id
                            ? 'bg-cyan-500 border-cyan-700 text-white'
                            : 'bg-slate-800 border-slate-950 text-slate-500 hover:bg-slate-800/80'
                        )}
                      >
                        <op.icon className="w-6 h-6 mb-1" />
                        <span className="text-[9px] font-black uppercase">{op.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty (Add/Sub) */}
                {!isMulDiv && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Difficulty</p>
                    <div className="grid grid-cols-3 gap-3">
                      {getDifficulties(operation).map((d) => (
                        <button
                          key={d.id}
                          onClick={() => setDifficulty(d.id)}
                          className={cn(
                            'py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-b-4 transition-all',
                            difficulty === d.id
                              ? 'bg-indigo-500 border-indigo-700 text-white'
                              : 'bg-slate-800 border-slate-950 text-slate-500'
                          )}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tables (Mul/Div) */}
                {isMulDiv && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between ml-2 mr-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">เลือกแม่สูตรคูณ</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setTables([...TABLE_OPTIONS])}
                          className="text-[9px] font-black text-cyan-400 uppercase tracking-wider hover:text-white"
                        >
                          All
                        </button>
                        <button
                          onClick={() => setTables([])}
                          className="text-[9px] font-black text-slate-500 uppercase tracking-wider hover:text-white"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {TABLE_OPTIONS.map((n) => {
                        const on = tables.includes(n);
                        return (
                          <button
                            key={n}
                            onClick={() => toggleTable(n)}
                            className={cn(
                              'py-3 rounded-xl font-black text-base border-b-4 transition-all',
                              on
                                ? 'bg-indigo-500 border-indigo-700 text-white'
                                : 'bg-slate-800 border-slate-950 text-slate-500'
                            )}
                          >
                            {n}
                          </button>
                        );
                      })}
                    </div>
                    {tables.length === 0 && (
                      <p className="text-[9px] font-black text-red-400 uppercase tracking-wider text-center">Pick at least one table</p>
                    )}
                  </div>
                )}

                {/* Time */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Time</p>
                  <div className="grid grid-cols-6 gap-2">
                    {TIME_PRESETS.map((t) => (
                      <button
                        key={t.label}
                        onClick={() => setDurationSec(t.sec)}
                        className={cn(
                          'py-3 rounded-xl font-black text-xs uppercase border-b-4 transition-all',
                          durationSec === t.sec
                            ? 'bg-yellow-500 border-yellow-700 text-slate-950'
                            : 'bg-slate-800 border-slate-950 text-slate-500'
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  {/* Custom time */}
                  <div className="flex items-center gap-2 bg-slate-950/50 rounded-2xl p-3 border border-white/5">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Custom</span>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={customMin}
                      onChange={(e) => setCustomMin(e.target.value)}
                      className="w-14 bg-slate-800 text-white text-center font-black rounded-xl py-2 text-sm border border-white/10 outline-none focus:border-cyan-500/50"
                    />
                    <span className="text-[10px] font-black text-slate-500 uppercase">min</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={customSec}
                      onChange={(e) => setCustomSec(e.target.value)}
                      className="w-14 bg-slate-800 text-white text-center font-black rounded-xl py-2 text-sm border border-white/10 outline-none focus:border-cyan-500/50"
                    />
                    <span className="text-[10px] font-black text-slate-500 uppercase">sec</span>
                    <button
                      onClick={applyCustomTime}
                      className="ml-auto px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-cyan-500/30 hover:bg-cyan-500/30"
                    >
                      Set
                    </button>
                  </div>
                  <p className="text-[10px] font-black text-cyan-400/70 uppercase tracking-widest text-center">
                    Selected: {durationSec === 0 ? 'Endless ∞' : formatTime(durationSec)}
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={canStart ? { scale: 1.02 } : {}}
                whileTap={canStart ? { scale: 0.98 } : {}}
                onClick={start}
                disabled={!canStart}
                className={cn(
                  'mt-6 w-full py-5 rounded-[2rem] text-xl font-black uppercase italic tracking-widest transition-all flex items-center justify-center gap-3 group',
                  canStart
                    ? 'bg-white text-slate-950 shadow-[0_8px_0_rgb(226,232,240)] active:shadow-none active:translate-y-[8px]'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                )}
              >
                START
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          ) : status === 'playing' ? (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="flex items-center gap-3 mb-4 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                  <Activity className="w-3 h-3 text-cyan-400" />
                  <span className="text-[9px] font-black text-cyan-400/80 uppercase tracking-[0.3em]">
                    {operation}
                    {isMulDiv ? ` · [${tables.join(',')}]` : ` · ${difficulty}`}
                  </span>
                </div>

                <motion.div
                  key={currentProblem?.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-7xl font-black text-white tracking-tighter mb-8 h-20 flex items-center"
                >
                  {currentProblem?.question}
                </motion.div>

                <div className="w-full flex flex-col items-center gap-6">
                  {/* Answer display (readonly, big) */}
                  <div
                    className={cn(
                      'w-full bg-slate-950/80 border-[4px] rounded-3xl py-6 text-6xl font-black text-center transition-all min-h-[6rem] flex items-center justify-center',
                      feedback === 'correct' ? 'border-green-400 text-green-400' :
                      feedback === 'incorrect' ? 'border-red-500 text-red-500 animate-shake' :
                      'border-slate-800 text-white'
                    )}
                  >
                    {userAnswer || <span className="text-slate-700">?</span>}
                  </div>

                  <Numpad
                    onInput={handleInput}
                    onDelete={handleDelete}
                    onSubmit={handleSubmit}
                  />

                  {/* Next problem preview */}
                  {nextProblem && (
                    <div className="w-full flex items-center justify-center gap-3 opacity-50">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Next</span>
                      <span className="text-2xl font-black text-slate-400 tracking-tight">{nextProblem.question}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between w-full px-2">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                      ⌨ Enter / Backspace / 0-9 / Esc
                    </span>
                    <button
                      onClick={endSession}
                      className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                    >
                      End
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <div className="relative mb-6">
                <Target className="w-20 h-20 text-cyan-400" />
              </div>

              <h2 className="text-4xl font-black uppercase italic text-white mb-2">SESSION DONE</h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">
                {operation}
                {isMulDiv ? ` · [${tables.join(',')}]` : ` · ${difficulty}`}
              </p>

              <div className="grid grid-cols-2 gap-4 w-full mb-4">
                <div className="bg-slate-950/60 p-5 rounded-3xl border border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Correct</p>
                  </div>
                  <p className="text-3xl font-black text-green-400">{correct}</p>
                </div>
                <div className="bg-slate-950/60 p-5 rounded-3xl border border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-3 h-3 text-red-400" />
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Wrong</p>
                  </div>
                  <p className="text-3xl font-black text-red-400">{incorrect}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full mb-8">
                <div className="bg-slate-950/60 p-5 rounded-3xl border border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="w-3 h-3 text-orange-400" />
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Best Streak</p>
                  </div>
                  <p className="text-3xl font-black text-orange-400">{bestStreak}</p>
                </div>
                <div className="bg-slate-950/60 p-5 rounded-3xl border border-white/5">
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Accuracy</p>
                  <p className="text-3xl font-black text-white">{accuracy}%</p>
                </div>
              </div>

              <button
                onClick={start}
                className="w-full py-5 bg-white text-slate-950 rounded-[2rem] text-xl font-black uppercase italic tracking-widest shadow-[0_8px_0_rgb(226,232,240)] active:shadow-none active:translate-y-[8px] transition-all flex items-center justify-center gap-3"
              >
                <RotateCcw className="w-5 h-5" />
                AGAIN
              </button>
              <button
                onClick={() => setStatus('idle')}
                className="mt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
              >
                Change Settings
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 2; }
      `}</style>
    </div>
  );
}
