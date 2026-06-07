'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Flame, CheckCircle2, XCircle, RotateCcw, Play, Star } from 'lucide-react';
import { generateProblem, Problem } from '@/lib/math';
import { useGame } from '@/lib/GameContext';
import { Stage, starsForStage } from '@/lib/rpg';
import { cn } from '@/lib/utils';
import Numpad from './Numpad';
import Mascot, { MascotMood } from './Mascot';
import Confetti from './Confetti';
import SpeedPop from './SpeedPop';
import { playCorrect, playWrong, playStreak, playLevelUp } from '@/lib/sounds';
import { rateSpeed, recordSpeed, recordFact, SpeedRating } from '@/lib/speed';

type Status = 'idle' | 'playing' | 'finished';

interface StageEngineProps {
  stage: Stage;
  worldColor: string;
  onExit: () => void;
}

export default function StageEngine({ stage, worldColor, onExit }: StageEngineProps) {
  const { addRewards, completeStage } = useGame();
  const [status, setStatus] = useState<Status>('idle');
  const [problemIdx, setProblemIdx] = useState(0);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [mood, setMood] = useState<MascotMood>('happy');
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [earnedStars, setEarnedStars] = useState<0 | 1 | 2 | 3>(0);
  const [speedRating, setSpeedRating] = useState<SpeedRating | null>(null);
  const [godCount, setGodCount] = useState(0);

  const finalizedRef = useRef(false);
  const problemStartRef = useRef<number>(Date.now());

  const buildProblems = useCallback(
    () =>
      Array.from({ length: stage.problemCount }, () =>
        generateProblem(stage.operation, stage.difficulty, stage.tables)
      ),
    [stage]
  );

  const start = () => {
    setProblems(buildProblems());
    setProblemIdx(0);
    setCorrect(0);
    setIncorrect(0);
    setStreak(0);
    setBestStreak(0);
    setUserAnswer('');
    setMood('happy');
    setStatus('playing');
    setGodCount(0);
    setSpeedRating(null);
    finalizedRef.current = false;
    problemStartRef.current = Date.now();
  };

  const currentProblem = problems[problemIdx];
  const nextProblem = problems[problemIdx + 1];

  const stateRef = useRef({ currentProblem, userAnswer, status });
  stateRef.current = { currentProblem, userAnswer, status };

  const finish = useCallback(
    (finalCorrect: number) => {
      if (finalizedRef.current) return;
      finalizedRef.current = true;
      const stars = starsForStage(stage, finalCorrect, stage.problemCount);
      setEarnedStars(stars);
      addRewards(finalCorrect);
      completeStage(stage.id, stars, finalCorrect, stage.rewardCoins);
      if (stars === 3) {
        setConfettiTrigger((t) => t + 1);
        playLevelUp();
      }
      setStatus('finished');
    },
    [addRewards, completeStage, stage]
  );

  const handleSubmit = useCallback(() => {
    const { currentProblem: cp, userAnswer: ua, status: st } = stateRef.current;
    if (st !== 'playing' || !cp || ua === '') return;
    const isCorrect = parseInt(ua) === cp.answer;
    const elapsedMs = Date.now() - problemStartRef.current;
    // Parse a, b out of the question — works for "a + b", "a - b", "a × b", "a ÷ b"
    const m = cp.question.match(/(\d+)\s*[+\-×÷]\s*(\d+)/);
    if (m) {
      const a = parseInt(m[1], 10);
      const b = parseInt(m[2], 10);
      recordFact(stage.operation, a, b, isCorrect, elapsedMs);
    }
    if (isCorrect) {
      const rating = rateSpeed(elapsedMs);
      setSpeedRating(rating);
      recordSpeed(rating);
      if (rating.tier === 'god') setGodCount((g) => g + 1);
      setTimeout(() => setSpeedRating(null), 900);
      const newCorrect = correct + 1;
      setCorrect(newCorrect);
      setStreak((s) => {
        const n = s + 1;
        setBestStreak((b) => Math.max(b, n));
        if (n >= 3 && n % 5 === 0) {
          setConfettiTrigger((t) => t + 1);
          playLevelUp();
          setMood('cheer');
          setTimeout(() => setMood('happy'), 1000);
        } else {
          playStreak(n);
          setMood('cheer');
          setTimeout(() => setMood('happy'), 400);
        }
        return n;
      });
      playCorrect();
      setFeedback('correct');
      setUserAnswer('');
      const nextIdx = problemIdx + 1;
      if (nextIdx >= stage.problemCount) {
        setTimeout(() => finish(newCorrect), 300);
      } else {
        setProblemIdx(nextIdx);
        problemStartRef.current = Date.now();
      }
    } else {
      setIncorrect((i) => i + 1);
      setStreak(0);
      setFeedback('incorrect');
      playWrong();
      setMood('sad');
      setTimeout(() => setMood('think'), 500);
    }
    setTimeout(() => setFeedback(null), 350);
  }, [correct, problemIdx, stage.problemCount, finish]);

  const handleInput = useCallback((val: string) => {
    setUserAnswer((p) => (p.length >= 6 ? p : p + val));
  }, []);
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
  const progressPct = (problemIdx / stage.problemCount) * 100;

  return (
    <div className="w-full">
      <Confetti trigger={confettiTrigger} />
      <div className="kid-card p-5 min-h-[680px] flex flex-col">
        {status === 'idle' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
            <Mascot mood="happy" size={130} />
            <h1 className="font-display text-3xl text-[#2b1d57]">{stage.name}</h1>
            <p className="text-sm text-[#2b1d57]/60">
              {stage.problemCount} ข้อ · รางวัล +{stage.rewardCoins}🪙
            </p>

            <div className="grid grid-cols-3 gap-3 w-full mt-2">
              <div className="bg-[#fff4b8] border-4 border-white rounded-2xl p-3">
                <p className="text-[10px] font-bold text-[#2b1d57]/60">1 ดาว</p>
                <p className="font-display text-base text-[#2b1d57]">≥{stage.targets.one}%</p>
              </div>
              <div className="bg-[#ffd6a8] border-4 border-white rounded-2xl p-3">
                <p className="text-[10px] font-bold text-[#2b1d57]/60">2 ดาว</p>
                <p className="font-display text-base text-[#2b1d57]">≥{stage.targets.two}%</p>
              </div>
              <div className="bg-[#ff9a3c] border-4 border-white rounded-2xl p-3">
                <p className="text-[10px] font-bold text-white/80">3 ดาว</p>
                <p className="font-display text-base text-white">{stage.targets.three}%</p>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={start}
              className="kid-btn w-full mt-4 py-5 text-2xl font-display text-white gap-3"
              style={{ background: `linear-gradient(160deg, ${worldColor}, #9b6dff)` }}
            >
              <Play className="w-7 h-7" />
              ลุยด่าน!
            </motion.button>
            <button onClick={onExit} className="text-sm font-bold text-[#2b1d57]/50 underline">
              กลับไปแผนที่
            </button>
          </div>
        ) : status === 'playing' ? (
          <div className="flex-1 flex flex-col relative">
            <SpeedPop rating={speedRating} />
            {/* Progress bar + streak */}
            <div className="flex justify-between items-center mb-3 gap-3">
              <div className="flex-1 bg-white/80 rounded-full h-5 border-[3px] border-white overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progressPct}%`,
                    background: `linear-gradient(90deg, ${worldColor}, #ffd23f, #5ddc7e)`,
                  }}
                />
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 rounded-full px-3 py-1.5 border-[3px] border-white shrink-0">
                <Flame className={cn('w-4 h-4', streak > 0 ? 'text-[#ff9a3c]' : 'text-[#2b1d57]/30')} />
                <span className={cn('font-display text-sm', streak > 0 ? 'text-[#ff9a3c]' : 'text-[#2b1d57]/40')}>x{streak}</span>
              </div>
            </div>
            <p className="text-center text-xs font-bold text-[#2b1d57]/60 mb-3">
              ข้อ {problemIdx + 1} / {stage.problemCount}
            </p>

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

              <div
                className={cn(
                  'w-full bg-white border-4 rounded-3xl py-5 text-5xl font-display text-center transition-all min-h-[5rem] flex items-center justify-center',
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

              <button onClick={onExit} className="text-sm font-bold text-[#2b1d57]/50 underline mt-1">
                พอแล้ว · ออก
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-4">
            <Mascot mood={earnedStars >= 2 ? 'cheer' : earnedStars === 1 ? 'happy' : 'think'} size={130} />
            <h2 className="font-display text-3xl text-[#2b1d57]">
              {earnedStars === 3 ? 'เพอร์เฟกต์!' : earnedStars === 2 ? 'เก่งมาก!' : earnedStars === 1 ? 'ผ่านได้!' : 'ลองอีกที!'}
            </h2>

            <div className="flex items-center gap-2 mt-1">
              {[1, 2, 3].map((n) => (
                <Star
                  key={n}
                  className={cn(
                    'w-12 h-12 transition-all',
                    earnedStars >= n
                      ? 'fill-[#ffd23f] text-[#ffd23f] drop-shadow-lg kid-pop'
                      : 'text-[#2b1d57]/15'
                  )}
                  style={{ animationDelay: `${n * 100}ms` }}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 w-full mt-3">
              <div className="bg-[#5ddc7e]/15 border-4 border-[#5ddc7e] rounded-3xl p-3">
                <CheckCircle2 className="w-5 h-5 text-[#5ddc7e] mx-auto" />
                <p className="font-display text-2xl text-[#5ddc7e] mt-1">{correct}</p>
                <p className="text-xs font-bold text-[#2b1d57]/60">ถูก</p>
              </div>
              <div className="bg-[#ff5a6a]/15 border-4 border-[#ff5a6a] rounded-3xl p-3">
                <XCircle className="w-5 h-5 text-[#ff5a6a] mx-auto" />
                <p className="font-display text-2xl text-[#ff5a6a] mt-1">{incorrect}</p>
                <p className="text-xs font-bold text-[#2b1d57]/60">ผิด</p>
              </div>
              <div className="bg-[#ff9a3c]/15 border-4 border-[#ff9a3c] rounded-3xl p-3">
                <Flame className="w-5 h-5 text-[#ff9a3c] mx-auto" />
                <p className="font-display text-2xl text-[#ff9a3c] mt-1">{bestStreak}</p>
                <p className="text-xs font-bold text-[#2b1d57]/60">ติดสุด</p>
              </div>
              <div className="bg-[#9b6dff]/15 border-4 border-[#9b6dff] rounded-3xl p-3">
                <p className="font-display text-2xl text-[#9b6dff]">{accuracy}%</p>
                <p className="text-xs font-bold text-[#2b1d57]/60">แม่นยำ</p>
              </div>
            </div>

            {godCount > 0 && (
              <div className="flex items-center gap-2 bg-[#ffd23f]/20 border-4 border-[#ffd23f] rounded-full px-4 py-2 mt-2">
                <span className="text-2xl">⚡</span>
                <span className="font-display text-base text-[#2b1d57]">เทพ x {godCount}</span>
              </div>
            )}

            <button
              onClick={start}
              className="kid-btn w-full mt-3 py-4 text-xl font-display text-white gap-2"
              style={{ background: 'linear-gradient(160deg, #5ddc7e, #4cc9ff)' }}
            >
              <RotateCcw className="w-5 h-5" />
              เอาอีก!
            </button>
            <button onClick={onExit} className="text-sm font-bold text-[#2b1d57]/50 underline">
              กลับไปแผนที่
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
