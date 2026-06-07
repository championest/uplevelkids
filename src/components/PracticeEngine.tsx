'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, X as Multiply, Divide, Flame, CheckCircle2, XCircle, RotateCcw, Timer, Infinity as InfinityIcon, Play } from 'lucide-react';
import { generateProblem, Problem, Operation, DifficultyLevel } from '@/lib/math';
import { cn } from '@/lib/utils';
import Numpad from './Numpad';
import Mascot, { MascotMood } from './Mascot';
import Confetti from './Confetti';
import { playCorrect, playWrong, playStreak, playLevelUp } from '@/lib/sounds';

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

const OP_META: Record<Operation, { icon: typeof Plus; label: string; th: string; color: string }> = {
  addition: { icon: Plus, label: 'Add', th: 'บวก', color: '#5ddc7e' },
  subtraction: { icon: Minus, label: 'Sub', th: 'ลบ', color: '#4cc9ff' },
  multiplication: { icon: Multiply, label: 'Mul', th: 'คูณ', color: '#ff6fb5' },
  division: { icon: Divide, label: 'Div', th: 'หาร', color: '#ff9a3c' },
};

export default function PracticeEngine() {
  const [status, setStatus] = useState<Status>('idle');
  const [operation, setOperation] = useState<Operation>('addition');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('1-digit');
  const [tables, setTables] = useState<number[]>([2, 3, 4, 5]);
  const [durationSec, setDurationSec] = useState<number>(60);

  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [nextProblem, setNextProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [mood, setMood] = useState<MascotMood>('happy');
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  const isMulDiv = operation === 'multiplication' || operation === 'division';

  const stateRef = useRef({ status, currentProblem, userAnswer, operation, difficulty, tables });
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
    setMood('happy');
    setTimeout(() => {
      setCurrentProblem(generateProblem(operation, difficulty, isMulDiv ? tables : undefined));
      setNextProblem(generateProblem(operation, difficulty, isMulDiv ? tables : undefined));
    }, 0);
  };

  const endSession = () => setStatus('finished');

  useEffect(() => {
    if (status !== 'playing' || durationSec === 0) return;
    if (timeLeft <= 0) { setStatus('finished'); return; }
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { setStatus('finished'); return 0; }
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
        if (next >= 3 && next % 5 === 0) {
          setConfettiTrigger((t) => t + 1);
          playLevelUp();
          setMood('cheer');
          setTimeout(() => setMood('happy'), 1200);
        } else {
          playStreak(next);
          setMood('cheer');
          setTimeout(() => setMood('happy'), 500);
        }
        return next;
      });
      playCorrect();
      setFeedback('correct');
      setCurrentProblem(nextProblemRef.current ?? genNext());
      setNextProblem(genNext());
      setUserAnswer('');
    } else {
      setIncorrect((i) => i + 1);
      setStreak(0);
      setFeedback('incorrect');
      playWrong();
      setMood('sad');
      setTimeout(() => setMood('think'), 600);
    }

    setTimeout(() => setFeedback(null), 400);
  }, [genNext]);

  const handleInput = useCallback((val: string) => {
    setUserAnswer((p) => (p.length >= 6 ? p : p + val));
  }, []);

  const handleDelete = useCallback(() => {
    setUserAnswer((p) => p.slice(0, -1));
  }, []);

  useEffect(() => {
    if (status !== 'playing') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') { e.preventDefault(); handleInput(e.key); }
      else if (e.key === 'Backspace') { e.preventDefault(); handleDelete(); }
      else if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
      else if (e.key === 'Escape') { e.preventDefault(); endSession(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [status, handleInput, handleDelete, handleSubmit]);

  const toggleTable = (n: number) => {
    setTables((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n].sort((a, b) => a - b)));
  };

  const total = correct + incorrect;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const canStart = !isMulDiv || tables.length > 0;
  const timeLow = durationSec > 0 && timeLeft <= 10;

  const opMeta = OP_META[operation];

  return (
    <div className="w-full">
      <Confetti trigger={confettiTrigger} />

      <div className="kid-card p-5 min-h-[680px] flex flex-col">
        {status === 'idle' ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex flex-col items-center mb-4">
                <Mascot mood="happy" size={110} />
                <h1 className="font-display text-3xl text-[#2b1d57] mt-2">ลุยเลย!</h1>
                <p className="text-sm text-[#2b1d57]/60">Pick your vibe</p>
              </div>

              <div className="space-y-5 flex-1">
                {/* Operation */}
                <div className="space-y-2">
                  <p className="font-display text-base text-[#2b1d57] ml-1">เอาแบบไหน · Pick one</p>
                  <div className="grid grid-cols-4 gap-2">
                    {(Object.keys(OP_META) as Operation[]).map((op) => {
                      const meta = OP_META[op];
                      const Icon = meta.icon;
                      const active = operation === op;
                      return (
                        <motion.button
                          key={op}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setOperation(op)}
                          className={cn(
                            "kid-btn flex-col py-3 px-1 text-white",
                            !active && "opacity-50"
                          )}
                          style={{ background: meta.color }}
                        >
                          <Icon className="w-7 h-7" strokeWidth={3} />
                          <span className="text-[11px] font-display mt-0.5">{meta.th}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Difficulty (Add/Sub) */}
                {!isMulDiv && (
                  <div className="space-y-2">
                    <p className="font-display text-base text-[#2b1d57] ml-1">ระดับ · Level</p>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { id: '1-digit' as DifficultyLevel, label: 'ง่าย', sub: '1 หลัก' },
                        { id: '2-digit' as DifficultyLevel, label: 'กลาง', sub: '2 หลัก' },
                        { id: '3-digit' as DifficultyLevel, label: 'ยาก', sub: '3 หลัก' },
                      ]).map((d) => {
                        const active = difficulty === d.id;
                        return (
                          <motion.button
                            key={d.id}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => setDifficulty(d.id)}
                            className={cn(
                              "kid-btn flex-col py-3 text-[#2b1d57]",
                              active ? "bg-[#ffd23f]" : "bg-white opacity-70"
                            )}
                          >
                            <span className="font-display text-base">{d.label}</span>
                            <span className="text-[10px]">{d.sub}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tables (Mul/Div) */}
                {isMulDiv && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1 mr-1">
                      <p className="font-display text-base text-[#2b1d57]">แม่คูณ</p>
                      <div className="flex gap-2">
                        <button onClick={() => setTables([...TABLE_OPTIONS])} className="text-xs font-bold text-[#9b6dff]">ทั้งหมด</button>
                        <button onClick={() => setTables([])} className="text-xs font-bold text-[#2b1d57]/50">ล้าง</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {TABLE_OPTIONS.map((n) => {
                        const on = tables.includes(n);
                        return (
                          <motion.button
                            key={n}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleTable(n)}
                            className={cn(
                              "kid-btn py-3 text-lg font-display",
                              on ? "text-white" : "bg-white text-[#2b1d57]/40 opacity-70"
                            )}
                            style={on ? { background: '#ff6fb5' } : undefined}
                          >
                            {n}
                          </motion.button>
                        );
                      })}
                    </div>
                    {tables.length === 0 && (
                      <p className="text-xs font-bold text-[#ff5a6a] text-center">เลือกแม่คูณซัก 1 แม่ก่อนนะ</p>
                    )}
                  </div>
                )}

                {/* Time */}
                <div className="space-y-2">
                  <p className="font-display text-base text-[#2b1d57] ml-1">เวลา · Time</p>
                  <div className="grid grid-cols-6 gap-2">
                    {TIME_PRESETS.map((t) => {
                      const active = durationSec === t.sec;
                      return (
                        <motion.button
                          key={t.label}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setDurationSec(t.sec)}
                          className={cn(
                            "kid-btn py-3 font-display text-base",
                            active ? "text-white" : "bg-white text-[#2b1d57]/40 opacity-70"
                          )}
                          style={active ? { background: '#4cc9ff' } : undefined}
                        >
                          {t.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <motion.button
                whileTap={canStart ? { scale: 0.96 } : {}}
                onClick={start}
                disabled={!canStart}
                className={cn(
                  "kid-btn w-full mt-6 py-5 text-2xl font-display gap-3",
                  canStart ? "text-white" : "bg-white/60 text-[#2b1d57]/30 cursor-not-allowed"
                )}
                style={canStart ? { background: `linear-gradient(160deg, ${opMeta.color}, #9b6dff)` } : undefined}
              >
                <Play className="w-7 h-7" />
                ลุยเลย!
              </motion.button>
            </motion.div>
          ) : status === 'playing' ? (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col motion-safe"
            >
              {/* HUD */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 bg-white/80 rounded-full px-4 py-2 border-4 border-white shadow">
                  {durationSec === 0 ? <InfinityIcon className="w-5 h-5 text-[#4cc9ff]" /> : <Timer className={cn("w-5 h-5", timeLow ? "text-[#ff5a6a]" : "text-[#4cc9ff]")} />}
                  <span className={cn("font-display text-lg tabular-nums", timeLow ? "text-[#ff5a6a] kid-shake" : "text-[#2b1d57]")}>
                    {durationSec === 0 ? '∞' : formatTime(timeLeft)}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 rounded-full px-4 py-2 border-4 border-white shadow">
                  <Flame className={cn("w-5 h-5", streak > 0 ? "text-[#ff9a3c]" : "text-[#2b1d57]/30")} />
                  <span className={cn("font-display text-lg", streak > 0 ? "text-[#ff9a3c]" : "text-[#2b1d57]/40")}>x{streak}</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <Mascot mood={mood} size={90} />

                <div className="flex flex-col items-center gap-0">
                  <motion.div
                    key={currentProblem?.id}
                    initial={{ scale: 0.7, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="font-display text-6xl text-[#2b1d57] tabular-nums tracking-tight"
                  >
                    {currentProblem?.question}
                  </motion.div>
                  {nextProblem && (
                    <div className="font-display text-base text-[#2b1d57]/25 tabular-nums tracking-tight mt-1 select-none">
                      ถัดไป · {nextProblem.question}
                    </div>
                  )}
                </div>

                {/* Answer display */}
                <div
                  className={cn(
                    "w-full bg-white border-4 rounded-3xl py-5 text-5xl font-display text-center transition-all min-h-[5rem] flex items-center justify-center",
                    feedback === 'correct' ? "border-[#5ddc7e] text-[#5ddc7e] kid-pop" :
                    feedback === 'incorrect' ? "border-[#ff5a6a] text-[#ff5a6a] kid-shake" :
                    "border-[#9b6dff]/30 text-[#2b1d57]"
                  )}
                >
                  {userAnswer || <span className="text-[#2b1d57]/20">?</span>}
                </div>

                <Numpad onInput={handleInput} onDelete={handleDelete} onSubmit={handleSubmit} />

                <button
                  onClick={endSession}
                  className="text-sm font-bold text-[#2b1d57]/50 underline mt-2"
                >
                  พอแล้ว · End
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-6"
            >
              <Mascot mood="cheer" size={140} />
              <h2 className="font-display text-4xl text-[#2b1d57]">ปังมาก!</h2>
              <p className="text-base text-[#2b1d57]/60 -mt-2">Nice run!</p>

              <div className="grid grid-cols-2 gap-3 w-full mt-2">
                <div className="bg-[#5ddc7e]/15 border-4 border-[#5ddc7e] rounded-3xl p-4">
                  <CheckCircle2 className="w-5 h-5 text-[#5ddc7e] mx-auto" />
                  <p className="font-display text-3xl text-[#5ddc7e] mt-1">{correct}</p>
                  <p className="text-xs font-bold text-[#2b1d57]/60">ถูก · Correct</p>
                </div>
                <div className="bg-[#ff5a6a]/15 border-4 border-[#ff5a6a] rounded-3xl p-4">
                  <XCircle className="w-5 h-5 text-[#ff5a6a] mx-auto" />
                  <p className="font-display text-3xl text-[#ff5a6a] mt-1">{incorrect}</p>
                  <p className="text-xs font-bold text-[#2b1d57]/60">ผิด · Wrong</p>
                </div>
                <div className="bg-[#ff9a3c]/15 border-4 border-[#ff9a3c] rounded-3xl p-4">
                  <Flame className="w-5 h-5 text-[#ff9a3c] mx-auto" />
                  <p className="font-display text-3xl text-[#ff9a3c] mt-1">{bestStreak}</p>
                  <p className="text-xs font-bold text-[#2b1d57]/60">ติดต่อสุดปัง · Best Streak</p>
                </div>
                <div className="bg-[#9b6dff]/15 border-4 border-[#9b6dff] rounded-3xl p-4">
                  <p className="font-display text-3xl text-[#9b6dff] mt-1">{accuracy}%</p>
                  <p className="text-xs font-bold text-[#2b1d57]/60">แม่นยำ · Accuracy</p>
                </div>
              </div>

              <button
                onClick={start}
                className="kid-btn w-full mt-4 py-5 text-2xl font-display text-white gap-3"
                style={{ background: 'linear-gradient(160deg, #5ddc7e, #4cc9ff)' }}
              >
                <RotateCcw className="w-6 h-6" />
                เอาอีก!
              </button>
              <button
                onClick={() => setStatus('idle')}
                className="text-sm font-bold text-[#2b1d57]/50 underline"
              >
                เปลี่ยนโหมด
              </button>
            </motion.div>
          )}
      </div>
    </div>
  );
}
