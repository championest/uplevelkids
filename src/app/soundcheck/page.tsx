'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, Mic2, Timer, CheckCircle2, XCircle } from 'lucide-react';
import { generateProblem, Problem } from '@/lib/math';
import { rateSpeed, recordSpeed, recordFact, statusForAvgSec, SpeedRating } from '@/lib/speed';
import { useGame } from '@/lib/GameContext';
import { getTodaySoundcheck, saveSoundcheck, isSoundcheckAvailable } from '@/lib/soundcheck';
import { playCorrect, playWrong, playLevelUp } from '@/lib/sounds';
import { cn } from '@/lib/utils';
import Mascot from '@/components/Mascot';
import Numpad from '@/components/Numpad';
import SpeedPop from '@/components/SpeedPop';
import Confetti from '@/components/Confetti';

const QUESTION_COUNT = 10;
const PER_QUESTION_SEC = 6;

// Build a mixed-table set: random op + random table 2-12
function makeSoundcheckSet(): Problem[] {
  const ops = ['multiplication', 'addition', 'subtraction'] as const;
  return Array.from({ length: QUESTION_COUNT }, () => {
    const op = ops[Math.floor(Math.random() * ops.length)];
    if (op === 'multiplication') {
      const t = 2 + Math.floor(Math.random() * 11);
      return generateProblem('multiplication', 'table-1-12', [t]);
    }
    return generateProblem(op, '2-digit');
  });
}

type Status = 'idle' | 'playing' | 'done';

export default function SoundcheckPage() {
  const { addRewards } = useGame();
  const [status, setStatus] = useState<Status>('idle');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [idx, setIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [totalMs, setTotalMs] = useState(0);
  const [godCount, setGodCount] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [speedRating, setSpeedRating] = useState<SpeedRating | null>(null);
  const [perQTimeLeft, setPerQTimeLeft] = useState(PER_QUESTION_SEC);
  const [available, setAvailable] = useState(true);
  const [tier, setTier] = useState<{ name: string; emoji: string; color: string } | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  const problemStartRef = useRef(Date.now());
  const finalizedRef = useRef(false);
  // Tally refs — avoid stale closures inside setIdx callback
  const correctRef = useRef(0);
  const incorrectRef = useRef(0);
  const totalMsRef = useRef(0);
  const godRef = useRef(0);

  useEffect(() => {
    setAvailable(isSoundcheckAvailable());
  }, []);

  const start = () => {
    setProblems(makeSoundcheckSet());
    setIdx(0);
    setCorrect(0);
    setIncorrect(0);
    setTotalMs(0);
    setGodCount(0);
    setUserAnswer('');
    setStatus('playing');
    setPerQTimeLeft(PER_QUESTION_SEC);
    finalizedRef.current = false;
    problemStartRef.current = Date.now();
    correctRef.current = 0;
    incorrectRef.current = 0;
    totalMsRef.current = 0;
    godRef.current = 0;
  };

  const currentProblem = problems[idx];
  const nextProblem = problems[idx + 1];

  // Per-question timeout
  useEffect(() => {
    if (status !== 'playing') return;
    if (perQTimeLeft <= 0) {
      // Auto-fail this question
      const elapsedMs = PER_QUESTION_SEC * 1000;
      const m = currentProblem?.question.match(/(\d+)\s*[+\-×÷]\s*(\d+)/);
      if (m && currentProblem) recordFact('soundcheck', parseInt(m[1]), parseInt(m[2]), false, elapsedMs);
      incorrectRef.current += 1;
      totalMsRef.current += elapsedMs;
      setIncorrect((i) => i + 1);
      setTotalMs((t) => t + elapsedMs);
      setFeedback('incorrect');
      playWrong();
      setTimeout(() => setFeedback(null), 350);
      advance();
      return;
    }
    const t = setInterval(() => setPerQTimeLeft((p) => p - 0.1), 100);
    return () => clearInterval(t);
  }, [status, perQTimeLeft, currentProblem]); // eslint-disable-line react-hooks/exhaustive-deps

  const finish = useCallback(
    (finalCorrect: number, finalMs: number, gods: number) => {
      if (finalizedRef.current) return;
      finalizedRef.current = true;
      const avgSec = finalCorrect > 0 ? finalMs / finalCorrect / 1000 : 999;
      const t = statusForAvgSec(avgSec);
      setTier({ name: t.name, emoji: t.emoji, color: t.color });
      const reward = finalCorrect + gods * 2; // bonus for god answers
      addRewards(reward);
      saveSoundcheck({
        correct: finalCorrect,
        total: QUESTION_COUNT,
        avgSec,
        godCount: gods,
        tier: t.id,
      });
      playLevelUp();
      if (finalCorrect >= 7) setConfettiTrigger((x) => x + 1);
      setStatus('done');
    },
    [addRewards]
  );

  const advance = useCallback(() => {
    setIdx((i) => {
      const next = i + 1;
      if (next >= QUESTION_COUNT) {
        // Read latest tallies from refs — closure-safe
        setTimeout(() => finish(correctRef.current, totalMsRef.current, godRef.current), 50);
        return i;
      }
      setUserAnswer('');
      setPerQTimeLeft(PER_QUESTION_SEC);
      problemStartRef.current = Date.now();
      return next;
    });
  }, [finish]);

  const handleSubmit = useCallback(() => {
    if (status !== 'playing' || !currentProblem || userAnswer === '') return;
    const elapsedMs = Date.now() - problemStartRef.current;
    const isCorrect = parseInt(userAnswer) === currentProblem.answer;
    const m = currentProblem.question.match(/(\d+)\s*[+\-×÷]\s*(\d+)/);
    if (m) recordFact('soundcheck', parseInt(m[1]), parseInt(m[2]), isCorrect, elapsedMs);
    if (isCorrect) {
      const rating = rateSpeed(elapsedMs);
      setSpeedRating(rating);
      recordSpeed(rating);
      if (rating.tier === 'god') {
        godRef.current += 1;
        setGodCount((g) => g + 1);
      }
      setTimeout(() => setSpeedRating(null), 800);
      correctRef.current += 1;
      totalMsRef.current += elapsedMs;
      setCorrect((c) => c + 1);
      setTotalMs((t) => t + elapsedMs);
      setFeedback('correct');
      playCorrect();
      setTimeout(() => setFeedback(null), 300);
      advance();
    } else {
      incorrectRef.current += 1;
      totalMsRef.current += elapsedMs;
      setIncorrect((i) => i + 1);
      setTotalMs((t) => t + elapsedMs);
      setFeedback('incorrect');
      playWrong();
      setTimeout(() => setFeedback(null), 350);
      advance();
    }
  }, [status, currentProblem, userAnswer, advance]);

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

  const today = getTodaySoundcheck();
  const timeLow = perQTimeLeft <= 2;

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
            <p className="font-display text-base text-[#2b1d57]">เช็คฝีมือ</p>
            <p className="text-xs text-[#2b1d57]/60">Soundcheck</p>
          </div>
        </header>

        {status === 'idle' && (
          <div className="kid-card p-5 flex flex-col items-center text-center gap-3">
            <Mascot mood="wow" size={120} />
            <h1 className="font-display text-3xl text-[#2b1d57]">เช็คฝีมือประจำวัน</h1>
            <p className="text-sm text-[#2b1d57]/60">10 ข้อ คละแบบ · {PER_QUESTION_SEC} วิ/ข้อ</p>
            <p className="text-sm text-[#2b1d57]/60">ตอบไวจะเป็น ⚡ เทพ</p>

            {!available && today && (
              <div className="kid-card p-3 mt-2 w-full" style={{ background: '#fff4b8' }}>
                <p className="text-xs font-bold text-[#2b1d57]/70">วันนี้เล่นแล้ว · กลับมาพรุ่งนี้</p>
                <p className="font-display text-base text-[#2b1d57] mt-1">
                  {today.correct}/{today.total} · {today.avgSec.toFixed(1)}s
                </p>
              </div>
            )}

            <motion.button
              whileTap={available ? { scale: 0.96 } : {}}
              onClick={available ? start : undefined}
              disabled={!available}
              className={cn(
                'kid-btn w-full mt-3 py-5 text-2xl font-display gap-3',
                available ? 'text-white' : 'bg-white/60 text-[#2b1d57]/40 cursor-not-allowed'
              )}
              style={available ? { background: 'linear-gradient(160deg, #ff6fb5, #9b6dff)' } : undefined}
            >
              <Mic2 className="w-7 h-7" />
              {available ? 'เริ่ม Soundcheck!' : 'ผ่านวันนี้แล้ว'}
            </motion.button>
          </div>
        )}

        {status === 'playing' && (
          <div className="kid-card p-5 flex flex-col gap-3 relative min-h-[600px]">
            <SpeedPop rating={speedRating} />
            {/* Per-question timer bar */}
            <div className="flex items-center gap-2">
              <Timer className={cn('w-5 h-5', timeLow ? 'text-[#ff5a6a]' : 'text-[#4cc9ff]')} />
              <div className="flex-1 h-3 bg-white rounded-full overflow-hidden border-2 border-white">
                <motion.div
                  animate={{ width: `${(perQTimeLeft / PER_QUESTION_SEC) * 100}%` }}
                  transition={{ ease: 'linear', duration: 0.1 }}
                  className="h-full rounded-full"
                  style={{
                    background: timeLow ? '#ff5a6a' : 'linear-gradient(90deg, #5ddc7e, #ffd23f, #ff5a6a)',
                  }}
                />
              </div>
              <span className={cn('font-display text-sm tabular-nums w-10 text-right', timeLow && 'text-[#ff5a6a]')}>{Math.max(0, perQTimeLeft).toFixed(1)}</span>
            </div>

            <p className="text-center text-xs font-bold text-[#2b1d57]/60">
              ข้อ {idx + 1} / {QUESTION_COUNT}
            </p>

            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="flex flex-col items-center">
                <motion.div
                  key={currentProblem?.id}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-display text-6xl text-[#2b1d57] tabular-nums"
                >
                  {currentProblem?.question}
                </motion.div>
                {nextProblem && (
                  <div className="font-display text-base text-[#2b1d57]/25 mt-1">ถัดไป · {nextProblem.question}</div>
                )}
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

        {status === 'done' && tier && (
          <div className="kid-card p-5 flex flex-col items-center text-center gap-3">
            <Mascot mood="cheer" size={130} />
            <h2 className="font-display text-3xl text-[#2b1d57]">เช็คฝีมือเสร็จแล้ว!</h2>

            <div
              className="rounded-3xl px-5 py-3 border-4 border-white shadow-[0_6px_0_rgba(0,0,0,0.08)]"
              style={{ background: tier.color }}
            >
              <p className="text-xs font-bold text-white/80">ระดับ Rock Star</p>
              <p className="font-display text-2xl text-white">{tier.emoji} {tier.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full mt-2">
              <div className="bg-[#5ddc7e]/15 border-4 border-[#5ddc7e] rounded-3xl p-3">
                <CheckCircle2 className="w-5 h-5 text-[#5ddc7e] mx-auto" />
                <p className="font-display text-2xl text-[#5ddc7e] mt-1">{correct}</p>
                <p className="text-xs font-bold text-[#2b1d57]/60">ถูก</p>
              </div>
              <div className="bg-[#ff5a6a]/15 border-4 border-[#ff5a6a] rounded-3xl p-3">
                <XCircle className="w-5 h-5 text-[#ff5a6a] mx-auto" />
                <p className="font-display text-2xl text-[#ff5a6a] mt-1">{incorrect}</p>
                <p className="text-xs font-bold text-[#2b1d57]/60">ผิด/หมดเวลา</p>
              </div>
              <div className="bg-[#ffd23f]/20 border-4 border-[#ffd23f] rounded-3xl p-3">
                <p className="text-2xl">⚡</p>
                <p className="font-display text-2xl text-[#2b1d57] mt-1">{godCount}</p>
                <p className="text-xs font-bold text-[#2b1d57]/60">เทพ</p>
              </div>
              <div className="bg-[#9b6dff]/15 border-4 border-[#9b6dff] rounded-3xl p-3">
                <p className="font-display text-2xl text-[#9b6dff]">
                  {correct > 0 ? (totalMs / correct / 1000).toFixed(1) : '—'}s
                </p>
                <p className="text-xs font-bold text-[#2b1d57]/60">เฉลี่ย/ข้อ</p>
              </div>
            </div>

            <Link href="/" className="kid-btn w-full mt-3 py-4 text-xl font-display text-white" style={{ background: 'linear-gradient(160deg, #4cc9ff, #5ddc7e)' }}>
              กลับหน้าหลัก
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
