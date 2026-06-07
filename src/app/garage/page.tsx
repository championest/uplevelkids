'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, Wrench, Play, Flame, Star } from 'lucide-react';
import { generateProblem, Problem } from '@/lib/math';
import { getWeakest, recordFact, recordSpeed, rateSpeed, SpeedRating, WeakFact } from '@/lib/speed';
import { useGame } from '@/lib/GameContext';
import { playCorrect, playWrong, playStreak } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Mascot from '@/components/Mascot';
import Numpad from '@/components/Numpad';
import SpeedPop from '@/components/SpeedPop';
import Confetti from '@/components/Confetti';

const TARGET = 10;

function buildProblemFromFact(f: WeakFact): Problem {
  // Reuse generateProblem when possible for multiplication/division to keep formatting consistent.
  if (f.operation === 'multiplication') {
    return { id: Math.random().toString(36).slice(2), question: `${f.a} × ${f.b}`, answer: f.a * f.b };
  }
  if (f.operation === 'division') {
    return { id: Math.random().toString(36).slice(2), question: `${f.a * f.b} ÷ ${f.a}`, answer: f.b };
  }
  if (f.operation === 'subtraction') {
    const big = Math.max(f.a, f.b), small = Math.min(f.a, f.b);
    return { id: Math.random().toString(36).slice(2), question: `${big} − ${small}`, answer: big - small };
  }
  return { id: Math.random().toString(36).slice(2), question: `${f.a} + ${f.b}`, answer: f.a + f.b };
}

function generateRandomTableProblem(): Problem {
  const t = 2 + Math.floor(Math.random() * 11);
  return generateProblem('multiplication', 'table-1-12', [t]);
}

type Status = 'idle' | 'playing' | 'done';

export default function GaragePage() {
  const { addRewards } = useGame();
  const [status, setStatus] = useState<Status>('idle');
  const [queue, setQueue] = useState<Problem[]>([]);
  const [idx, setIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [speedRating, setSpeedRating] = useState<SpeedRating | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [weakest, setWeakest] = useState<WeakFact[]>([]);

  const problemStartRef = useRef(Date.now());

  useEffect(() => {
    if (status === 'idle') setWeakest(getWeakest(undefined, 6));
  }, [status]);

  const start = useCallback(() => {
    const weak = getWeakest(undefined, 20);
    const q: Problem[] = [];
    // 70% weak facts, 30% random tables for variety
    while (q.length < TARGET) {
      if (weak.length > 0 && Math.random() < 0.7) {
        q.push(buildProblemFromFact(weak[Math.floor(Math.random() * Math.min(weak.length, 8))]));
      } else {
        q.push(generateRandomTableProblem());
      }
    }
    setQueue(q);
    setIdx(0);
    setCorrect(0);
    setStreak(0);
    setBestStreak(0);
    setUserAnswer('');
    setStatus('playing');
    problemStartRef.current = Date.now();
  }, []);

  const current = queue[idx];
  const next = queue[idx + 1];

  const finish = useCallback(
    (finalCorrect: number, bestS: number) => {
      addRewards(finalCorrect);
      if (bestS >= 5) setConfettiTrigger((t) => t + 1);
      setStatus('done');
    },
    [addRewards]
  );

  const handleSubmit = useCallback(() => {
    if (!current || userAnswer === '' || status !== 'playing') return;
    const elapsedMs = Date.now() - problemStartRef.current;
    const isCorrect = parseInt(userAnswer) === current.answer;
    const m = current.question.match(/(\d+)\s*[+\-−×÷]\s*(\d+)/);
    if (m) recordFact('garage', parseInt(m[1]), parseInt(m[2]), isCorrect, elapsedMs);
    if (isCorrect) {
      const r = rateSpeed(elapsedMs);
      setSpeedRating(r);
      recordSpeed(r);
      setTimeout(() => setSpeedRating(null), 800);
      const newCorrect = correct + 1;
      setCorrect(newCorrect);
      setStreak((s) => {
        const n = s + 1;
        setBestStreak((b) => Math.max(b, n));
        if (n >= 3) playStreak(n);
        return n;
      });
      playCorrect();
      setFeedback('correct');
      setUserAnswer('');
      const nextIdx = idx + 1;
      if (nextIdx >= TARGET) {
        setTimeout(() => finish(newCorrect, Math.max(bestStreak, streak + 1)), 250);
      } else {
        setIdx(nextIdx);
        problemStartRef.current = Date.now();
      }
    } else {
      setStreak(0);
      setFeedback('incorrect');
      playWrong();
    }
    setTimeout(() => setFeedback(null), 350);
  }, [current, userAnswer, status, correct, idx, finish, bestStreak, streak]);

  const handleInput = useCallback((v: string) => setUserAnswer((p) => (p.length >= 6 ? p : p + v)), []);
  const handleDelete = useCallback(() => setUserAnswer((p) => p.slice(0, -1)), []);

  useEffect(() => {
    if (status !== 'playing') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') { e.preventDefault(); handleInput(e.key); }
      else if (e.key === 'Backspace') { e.preventDefault(); handleDelete(); }
      else if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [status, handleInput, handleDelete, handleSubmit]);

  const opLabel = (op: string) => ({ multiplication: '×', division: '÷', addition: '+', subtraction: '−' }[op] || '?');

  const accuracy = useMemo(() => (idx === 0 ? 0 : Math.round((correct / idx) * 100)), [idx, correct]);

  return (
    <main className="min-h-screen flex flex-col items-center px-4 pt-6 pb-12">
      <Confetti trigger={confettiTrigger} />
      <div className="w-full max-w-[520px] relative z-10 space-y-4">
        <header className="flex justify-between items-center">
          <Link href="/" className="kid-btn bg-white px-4 py-3 text-[#9b6dff]">
            <ChevronLeft className="w-6 h-6" />
            <span className="font-display text-base">กลับ</span>
          </Link>
          <div className="text-right">
            <p className="font-display text-base text-[#2b1d57]">ห้องซ้อม</p>
            <p className="text-xs text-[#2b1d57]/60">Training · ซ้อมจุดอ่อน</p>
          </div>
        </header>

        {status === 'idle' && (
          <>
            <div className="kid-card p-5 flex flex-col items-center text-center gap-3">
              <Mascot mood="think" size={120} />
              <h1 className="font-display text-3xl text-[#2b1d57]">ซ้อมจุดอ่อน</h1>
              <p className="text-sm text-[#2b1d57]/60">เลือกข้อที่หนูยังตอบช้า/พลาด มาฝึกซ้ำ {TARGET} ข้อ</p>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={start}
                className="kid-btn w-full mt-3 py-5 text-2xl font-display text-white gap-3"
                style={{ background: 'linear-gradient(160deg, #ff9a3c, #ff5a6a)' }}
              >
                <Play className="w-7 h-7" />
                เริ่มซ้อม!
              </motion.button>
            </div>

            <div className="kid-card p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#9b6dff]" />
                <h2 className="font-display text-lg text-[#2b1d57]">จุดอ่อนตอนนี้</h2>
              </div>
              {weakest.length === 0 ? (
                <p className="text-sm text-[#2b1d57]/60 text-center py-4">ยังไม่มีข้อมูล — เล่นด่านสักนิดก่อนน้า</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {weakest.map((w, i) => (
                    <div
                      key={i}
                      className="rounded-2xl p-2 border-2 border-white text-center"
                      style={{
                        background: w.accuracy < 0.5 ? '#ffd6d6' : w.avgMs > 6000 ? '#fff4b8' : '#ffd6f5',
                      }}
                    >
                      <p className="font-display text-base text-[#2b1d57] tabular-nums">
                        {w.a} {opLabel(w.operation)} {w.b}
                      </p>
                      <p className="text-[10px] text-[#2b1d57]/60">
                        {Math.round(w.accuracy * 100)}% · {(w.avgMs / 1000).toFixed(1)}s
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {status === 'playing' && current && (
          <div className="kid-card p-5 flex flex-col gap-3 relative min-h-[600px]">
            <SpeedPop rating={speedRating} />
            <div className="flex items-center justify-between">
              <div className="flex-1 h-4 bg-white rounded-full overflow-hidden border-[3px] border-white">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(idx / TARGET) * 100}%`,
                    background: 'linear-gradient(90deg, #ff9a3c, #ffd23f, #5ddc7e)',
                  }}
                />
              </div>
              <div className="ml-2 flex items-center gap-1.5 bg-white rounded-full px-3 py-1 border-[3px] border-white">
                <Flame className={cn('w-4 h-4', streak > 0 ? 'text-[#ff9a3c]' : 'text-[#2b1d57]/30')} />
                <span className={cn('font-display text-sm', streak > 0 ? 'text-[#ff9a3c]' : 'text-[#2b1d57]/40')}>x{streak}</span>
              </div>
            </div>
            <p className="text-center text-xs font-bold text-[#2b1d57]/60">ข้อ {idx + 1} / {TARGET}</p>

            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="flex flex-col items-center">
                <motion.div
                  key={current.id}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-display text-6xl text-[#2b1d57] tabular-nums"
                >
                  {current.question}
                </motion.div>
                {next && <div className="font-display text-base text-[#2b1d57]/25 mt-1">ถัดไป · {next.question}</div>}
              </div>

              <div
                className={cn(
                  'w-full bg-white border-4 rounded-3xl py-5 text-5xl font-display text-center min-h-[5rem] flex items-center justify-center',
                  feedback === 'correct'
                    ? 'border-[#5ddc7e] text-[#5ddc7e] kid-pop'
                    : feedback === 'incorrect'
                    ? 'border-[#ff5a6a] text-[#ff5a6a] kid-shake'
                    : 'border-[#9b6dff]/30 text-[#2b1d57]'
                )}
              >
                {userAnswer || <span className="text-[#2b1d57]/20">?</span>}
              </div>

              <Numpad onInput={handleInput} onDelete={handleDelete} onSubmit={handleSubmit} />
            </div>
          </div>
        )}

        {status === 'done' && (
          <div className="kid-card p-5 flex flex-col items-center text-center gap-3">
            <Mascot mood="cheer" size={130} />
            <h2 className="font-display text-3xl text-[#2b1d57]">ซ้อมเสร็จแล้ว!</h2>
            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="bg-[#5ddc7e]/15 border-4 border-[#5ddc7e] rounded-3xl p-3">
                <p className="font-display text-2xl text-[#5ddc7e]">{correct}</p>
                <p className="text-xs font-bold text-[#2b1d57]/60">ถูก · {accuracy}%</p>
              </div>
              <div className="bg-[#ff9a3c]/15 border-4 border-[#ff9a3c] rounded-3xl p-3">
                <Flame className="w-5 h-5 text-[#ff9a3c] mx-auto" />
                <p className="font-display text-2xl text-[#ff9a3c]">{bestStreak}</p>
                <p className="text-xs font-bold text-[#2b1d57]/60">ติดต่อสุด</p>
              </div>
            </div>
            <button
              onClick={start}
              className="kid-btn w-full mt-3 py-4 text-xl font-display text-white gap-2"
              style={{ background: 'linear-gradient(160deg, #ff9a3c, #ff5a6a)' }}
            >
              ซ้อมอีก!
            </button>
            <Link href="/" className="text-sm font-bold text-[#2b1d57]/50 underline">กลับหน้าหลัก</Link>
          </div>
        )}
      </div>
    </main>
  );
}
