'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Zap, Trophy, Swords, ChevronRight, Activity, Plus, Minus, X as Multiply, Divide } from 'lucide-react';
import { generateProblem, Problem, Operation, DifficultyLevel } from '@/lib/math';
import { cn } from '@/lib/utils';
import { useGame } from '@/lib/GameContext';
import Numpad from './Numpad';

export default function BattleEngine() {
  const { addRewards } = useGame();
  const [status, setStatus] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [operation, setOperation] = useState<Operation>('addition');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('1-digit');
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const startBattle = useCallback(() => {
    setScore(0);
    setCombo(0);
    setTimeLeft(60);
    setStatus('playing');
    setCurrentProblem(generateProblem(operation, difficulty));
    setUserAnswer('');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [operation, difficulty]);

  useEffect(() => {
    if (status !== 'playing') return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setStatus('finished');
          addRewards(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status, score, addRewards]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!currentProblem || !userAnswer) return;

    const isCorrect = parseInt(userAnswer) === currentProblem.answer;

    if (isCorrect) {
      setScore((s) => s + 1);
      setCombo((c) => c + 1);
      setFeedback('correct');
      setCurrentProblem(generateProblem(operation, difficulty));
      setUserAnswer('');
    } else {
      setCombo(0);
      setFeedback('incorrect');
    }

    setTimeout(() => setFeedback(null), 500);
  };

  const handleNumpadInput = (val: string) => {
    setUserAnswer(prev => prev + val);
  };

  const handleNumpadDelete = () => {
    setUserAnswer(prev => prev.slice(0, -1));
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
    return [
      { id: 'table-1-5', label: '1-5' },
      { id: 'table-1-12', label: '1-12' },
      { id: 'table-1-25', label: '1-25' },
    ];
  };

  return (
    <div className="w-full max-w-[480px] h-[720px] relative">
      {/* Outer Cyber Frame */}
      <div className="absolute inset-0 bg-slate-900 rounded-[3.5rem] border-[1px] border-white/10 shadow-[0_0_80px_rgba(99,102,241,0.2)] overflow-hidden">
        <motion.div 
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none"
        />
      </div>

      <div className="relative z-10 h-full flex flex-col p-6">
        {/* HUD */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-2xl transition-all duration-300 shadow-lg",
              timeLeft < 10 ? "bg-red-500/20 text-red-500 ring-2 ring-red-500/50" : "bg-slate-800/80 text-cyan-400 ring-1 ring-white/10"
            )}>
              <Timer className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Time</span>
              <span className={cn("text-xl font-black tabular-nums leading-none", timeLeft < 10 && "text-red-500")}>{timeLeft}S</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Combo</span>
              <span className={cn("text-xl font-black italic leading-none transition-colors", combo > 0 ? "text-yellow-400" : "text-slate-600")}>x{combo}</span>
            </div>
            <div className={cn(
              "p-2.5 rounded-2xl transition-all duration-300 shadow-lg",
              combo > 0 ? "bg-yellow-500/20 text-yellow-400 ring-2 ring-yellow-500/50" : "bg-slate-800/80 text-slate-600 ring-1 ring-white/10"
            )}>
              <Zap className="w-5 h-5" />
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {status === 'idle' ? (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl flex items-center justify-center shadow-lg border border-white/20 mb-4">
                  <Swords className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter">MATH COMMAND</h1>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Select Operation</p>
                  <div className="grid grid-cols-4 gap-2">
                    {operations.map((op) => (
                      <button
                        key={op.id}
                        onClick={() => {
                          setOperation(op.id);
                          setDifficulty(getDifficulties(op.id)[0].id);
                        }}
                        className={cn(
                          "flex flex-col items-center justify-center py-4 rounded-2xl border-b-4 transition-all",
                          operation === op.id 
                            ? "bg-indigo-500 border-indigo-700 text-white" 
                            : "bg-slate-800 border-slate-950 text-slate-500 hover:bg-slate-800/80"
                        )}
                      >
                        <op.icon className="w-6 h-6 mb-1" />
                        <span className="text-[9px] font-black uppercase">{op.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Level Difficulty</p>
                  <div className="grid grid-cols-3 gap-3">
                    {getDifficulties(operation).map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setDifficulty(d.id)}
                        className={cn(
                          "py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-b-4 transition-all",
                          difficulty === d.id 
                            ? "bg-cyan-500 border-cyan-700 text-white" 
                            : "bg-slate-800 border-slate-950 text-slate-500"
                        )}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startBattle}
                className="mt-6 w-full py-5 bg-white text-slate-950 rounded-[2rem] text-xl font-black uppercase italic tracking-widest shadow-[0_8px_0_rgb(226,232,240)] active:shadow-none active:translate-y-[8px] transition-all flex items-center justify-center gap-3 group"
              >
                DEPLOY
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
                    <span className="text-[9px] font-black text-cyan-400/80 uppercase tracking-[0.3em]">{operation} - {difficulty}</span>
                 </div>

                 <motion.div 
                    key={currentProblem?.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-7xl font-black text-white tracking-tighter mb-8 h-20 flex items-center"
                  >
                    {currentProblem?.question}
                  </motion.div>

                  <div className="w-full flex flex-col items-center gap-8">
                    <form onSubmit={handleSubmit} className="w-full relative">
                      <input
                        ref={inputRef}
                        type="number"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        className={cn(
                          "w-full bg-slate-950/80 border-[4px] rounded-3xl py-6 text-6xl font-black text-center outline-none transition-all",
                          feedback === 'correct' ? "border-green-400 text-green-400" :
                          feedback === 'incorrect' ? "border-red-500 text-red-500 animate-shake" : 
                          "border-slate-800 text-white focus:border-indigo-500/50"
                        )}
                        placeholder="?"
                      />
                    </form>

                    <Numpad 
                      onInput={handleNumpadInput}
                      onDelete={handleNumpadDelete}
                      onSubmit={handleSubmit}
                    />
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
                <Trophy className="w-20 h-20 text-yellow-400 animate-bounce" />
              </div>

              <h2 className="text-4xl font-black uppercase italic text-white mb-2">MISSION COMPLETE</h2>
              
              <div className="grid grid-cols-2 gap-4 w-full mb-8">
                <div className="bg-slate-950/60 p-5 rounded-3xl border border-white/5">
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Problems</p>
                  <p className="text-3xl font-black text-white">{score}</p>
                </div>
                <div className="bg-slate-950/60 p-5 rounded-3xl border border-white/5">
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Coins</p>
                  <p className="text-3xl font-black text-yellow-400">+{score * 5}</p>
                </div>
              </div>

              <button
                onClick={startBattle}
                className="w-full py-5 bg-white text-slate-950 rounded-[2rem] text-xl font-black uppercase italic tracking-widest shadow-[0_8px_0_rgb(226,232,240)] active:shadow-none active:translate-y-[8px] transition-all"
              >
                RE-ENGAGE
              </button>
              <button
                onClick={() => setStatus('idle')}
                className="mt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
              >
                Change Mission Parameters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.2); border-radius: 10px; }
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
