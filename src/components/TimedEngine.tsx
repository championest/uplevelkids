'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Flame, CheckCircle2, XCircle, RotateCcw, Timer, Infinity as InfinityIcon, Coins } from 'lucide-react';
import { generateProblem, Problem, Operation } from '@/lib/math';
import { useGame } from '@/lib/GameContext';
import { GameMode, COIN_PER_CORRECT, XP_PER_CORRECT_BY_MODE } from '@/lib/modes';
import { cn } from '@/lib/utils';
import Numpad from './Numpad';
import Mascot, { MascotMood } from './Mascot';
import Confetti from './Confetti';
import SpeedPop from './SpeedPop';
import { playCorrect, playWrong, playStreak, playLevelUp } from '@/lib/sounds';
import { rateSpeed, recordSpeed, recordFact, SpeedRating, statusForAvgSec } from '@/lib/speed';

interface TimedEngineProps {
  mode: GameMode;
  /** 0 = no timer (Jamming) */
  durationSec: number;
  /** 0 = unlimited (Studio runs until timer). >0 = stop after N questions even if timer left. */
  problemLimit?: number;
  buildProblem: () => Problem;
  /** Optional tables for the meta line */
  metaLine?: string;
  title: string;
  ctaText?: string;
  /** background gradient for start CTA */
  gradient: string;
}

type Status = 'idle' | 'playing' | 'done';

export default function TimedEngine({
  mode,
  durationSec,
  problemLimit = 0,
  buildProblem,
  metaLine,
  title,
  ctaText = 'ลุยเลย!',
  gradient,
}: TimedEngineProps) {
  const { addModeRewards } = useGame();
  const [status, setStatus] = useState<Status>('idle');
  const [current, setCurrent] = useState<Problem | null>(null);
  const [next, setNext] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(durationSec);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [mood, setMood] = useState<MascotMood>('happy');
  const [speedRating, setSpeedRating] = useState<SpeedRating | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [godCount, setGodCount] = useState(0);
  const [totalMs, setTotalMs] = useState(0);

  const problemStartRef = useRef<number>(Date.now());
  const stateRef = useRef({ current, userAnswer, status });
  stateRef.current = { current, userAnswer, status };

  const start = () => {
    setCurrent(buildProblem());
    setNext(buildProblem());
    setUserAnswer('');
    setCorrect(0);
    setIncorrect(0);
    setStreak(0);
    setBestStreak(0);
    setMood('happy');
    setGodCount(0);
    setTotalMs(0);
    setTimeLeft(durationSec);
    setStatus('playing');
    problemStartRef.current = Date.now();
  };

  // Timer
  useEffect(() => {
    if (status !== 'playing' || durationSec === 0) return;
    if (timeLeft <= 0) {
      finish();
      return;
    }
    const t = setInterval(() => setTimeLeft((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, timeLeft, durationSec]);

  const finish = useCallback(() => {
    setStatus('done');
    addModeRewards(mode, correct);
    if (correct >= 10) setConfettiTrigger((t) => t + 1);
    playLevelUp();
  }, [addModeRewards, correct, mode]);

  const handleSubmit = useCallback(() => {
    const { current: cp, userAnswer: ua, status: st } = stateRef.current;
    if (st !== 'playing' || !cp || ua === '') return;
    const elapsedMs = Date.now() - problemStartRef.current;
    const isCorrect = parseInt(ua) === cp.answer;
    const m = cp.question.match(/(\d+)\s*[+\-×÷]\s*(\d+)/);
    if (m) recordFact(mode, parseInt(m[1]), parseInt(m[2]), isCorrect, elapsedMs);

    if (isCorrect) {
      const rating = rateSpeed(elapsedMs);
      setSpeedRating(rating);
      recordSpeed(rating);
      setTotalMs((tm) => tm + elapsedMs);
      if (rating.tier === 'god') setGodCount((g) => g + 1);
      setTimeout(() => setSpeedRating(null), 800);
      const newCorrect = correct + 1;
      setCorrect(newCorrect);
      setStreak((s) => {
        const n = s + 1;
        setBestStreak((b) => Math.max(b, n));
        if (n >= 3) playStreak(n);
        if (n % 5 === 0) setConfettiTrigger((t) => t + 1);
        return n;
      });
      setMood('cheer');
      setTimeout(() => setMood('happy'), 400);
      playCorrect();
      setFeedback('correct');
      const nextProblem = next ?? buildProblem();
      setCurrent(nextProblem);
      setNext(buildProblem());
      setUserAnswer('');
      problemStartRef.current = Date.now();
      if (problemLimit > 0 && newCorrect + incorrect + 1 >= problemLimit) {
        setTimeout(finish, 250);
      }
    } else {
      setIncorrect((i) => i + 1);
      setStreak(0);
      setMood('sad');
      setTimeout(() => setMood('think'), 500);
      playWrong();
      setFeedback('incorrect');
    }
    setTimeout(() => setFeedback(null), 350);
  }, [correct, incorrect, next, buildProblem, finish, mode, problemLimit]);

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

  const total = correct + incorrect;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const timeLow = durationSec > 0 && timeLeft <= 10;
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };
  const avgSec = correct > 0 ? totalMs / correct / 1000 : 999;
  const tier = statusForAvgSec(avgSec);

  return (
    <div className="w-full">
      <Confetti trigger={confettiTrigger} />
      <div className="kid-card p-5 min-h-[640px] flex flex-col">
        {status === 'idle' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
            <Mascot mood="happy" size={130} />
            <h1 className="font-display text-3xl text-[#2b1d57]">{title}</h1>
            {metaLine && <p className="text-sm text-[#2b1d57]/60">{metaLine}</p>}
            <div className="flex items-center gap-2 mt-2 bg-white border-4 border-white rounded-full px-4 py-2">
              <Coins className="w-5 h-5 text-[#ffd23f]" />
              <span className="font-display text-sm text-[#2b1d57]">+{COIN_PER_CORRECT[mode]} / ตอบถูก</span>
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={start}
              className="kid-btn w-full mt-3 py-5 text-2xl font-display text-white gap-3"
              style={{ background: gradient }}
            >
              <Play className="w-7 h-7" />
              {ctaText}
            </motion.button>
          </div>
        ) : status === 'playing' ? (
          <div className="flex-1 flex flex-col relative">
            <SpeedPop rating={speedRating} />
            <div className="flex justify-between items-center mb-3 gap-3">
              <div className="flex items-center gap-2 bg-white/80 rounded-full px-3 py-1.5 border-[3px] border-white">
                {durationSec === 0 ? <InfinityIcon className="w-4 h-4 text-[#4cc9ff]" /> : <Timer className={cn('w-4 h-4', timeLow ? 'text-[#ff5a6a]' : 'text-[#4cc9ff]')} />}
                <span className={cn('font-display text-base tabular-nums', timeLow ? 'text-[#ff5a6a] kid-shake' : 'text-[#2b1d57]')}>
                  {durationSec === 0 ? '∞' : formatTime(timeLeft)}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 rounded-full px-3 py-1.5 border-[3px] border-white">
                <Coins className="w-4 h-4 text-[#ffd23f]" />
                <span className="font-display text-base text-[#2b1d57] tabular-nums">{correct * COIN_PER_CORRECT[mode]}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 rounded-full px-3 py-1.5 border-[3px] border-white">
                <Flame className={cn('w-4 h-4', streak > 0 ? 'text-[#ff9a3c]' : 'text-[#2b1d57]/30')} />
                <span className={cn('font-display text-base', streak > 0 ? 'text-[#ff9a3c]' : 'text-[#2b1d57]/40')}>x{streak}</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <Mascot mood={mood} size={80} />
              <div className="flex flex-col items-center">
                <motion.div
                  key={current?.id}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-display text-6xl text-[#2b1d57] tabular-nums tracking-tight"
                >
                  {current?.question}
                </motion.div>
                {next && (
                  <div className="font-display text-base text-[#2b1d57]/25 tabular-nums mt-1 select-none">
                    ถัดไป · {next.question}
                  </div>
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

              <button onClick={finish} className="text-sm font-bold text-[#2b1d57]/50 underline mt-1">
                พอแล้ว · ออก
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center text-center gap-3 py-4">
            <Mascot mood="cheer" size={130} />
            <h2 className="font-display text-3xl text-[#2b1d57]">เก่งมาก!</h2>

            <div
              className="rounded-3xl px-5 py-3 border-4 border-white shadow-[0_6px_0_rgba(0,0,0,0.08)]"
              style={{ background: tier.color }}
            >
              <p className="text-xs font-bold text-white/80">ระดับ Rock Status</p>
              <p className="font-display text-2xl text-white">{tier.emoji} {tier.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="bg-[#5ddc7e]/15 border-4 border-[#5ddc7e] rounded-3xl p-3">
                <CheckCircle2 className="w-5 h-5 text-[#5ddc7e] mx-auto" />
                <p className="font-display text-2xl text-[#5ddc7e]">{correct}</p>
                <p className="text-xs font-bold text-[#2b1d57]/60">ถูก</p>
              </div>
              <div className="bg-[#ff5a6a]/15 border-4 border-[#ff5a6a] rounded-3xl p-3">
                <XCircle className="w-5 h-5 text-[#ff5a6a] mx-auto" />
                <p className="font-display text-2xl text-[#ff5a6a]">{incorrect}</p>
                <p className="text-xs font-bold text-[#2b1d57]/60">ผิด</p>
              </div>
              <div className="bg-[#ffd23f]/20 border-4 border-[#ffd23f] rounded-3xl p-3">
                <Coins className="w-5 h-5 text-[#ffd23f] mx-auto" />
                <p className="font-display text-2xl text-[#2b1d57]">{correct * COIN_PER_CORRECT[mode]}</p>
                <p className="text-xs font-bold text-[#2b1d57]/60">เหรียญ</p>
              </div>
              <div className="bg-[#ff9a3c]/15 border-4 border-[#ff9a3c] rounded-3xl p-3">
                <p className="text-2xl">⚡</p>
                <p className="font-display text-2xl text-[#ff9a3c]">{godCount}</p>
                <p className="text-xs font-bold text-[#2b1d57]/60">เทพ</p>
              </div>
              <div className="bg-[#9b6dff]/15 border-4 border-[#9b6dff] rounded-3xl p-3">
                <p className="font-display text-2xl text-[#9b6dff]">{accuracy}%</p>
                <p className="text-xs font-bold text-[#2b1d57]/60">แม่นยำ</p>
              </div>
              <div className="bg-white border-4 border-white rounded-3xl p-3">
                <p className="font-display text-2xl text-[#2b1d57]">{avgSec < 50 ? avgSec.toFixed(1) + 's' : '—'}</p>
                <p className="text-xs font-bold text-[#2b1d57]/60">เฉลี่ย</p>
              </div>
            </div>

            <button
              onClick={start}
              className="kid-btn w-full mt-3 py-4 text-xl font-display text-white gap-2"
              style={{ background: gradient }}
            >
              <RotateCcw className="w-5 h-5" />
              เล่นอีก!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
