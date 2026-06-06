'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Trophy, ChevronLeft, Medal, Star, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  id: string;
  name: string;
  level: number;
  xp: number;
  isCurrentUser?: boolean;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', name: 'CyberKid_99', level: 42, xp: 21000 },
  { id: '2', name: 'MathWizard', level: 38, xp: 19000 },
  { id: '3', name: 'QuantumSolver', level: 35, xp: 17500 },
  { id: '4', name: 'NeonByte', level: 31, xp: 15500 },
  { id: '5', name: 'StarGazer', level: 28, xp: 14000 },
  { id: '6', name: 'PixelMaster', level: 25, xp: 12500 },
  { id: '7', name: 'CodeRunner', level: 22, xp: 11000 },
];

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 font-['Plus_Jakarta_Sans'] p-4">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05),transparent_80%)]" />
      </div>

      <div className="w-full max-w-[500px] mx-auto relative z-10 space-y-8 pt-8 pb-20">
        <header className="flex items-center gap-6">
          <Link 
            href="/"
            className="p-3 bg-slate-900/80 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">HALL OF FAME</h1>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Global Rankings</p>
          </div>
        </header>

        {/* Top 3 Podiums */}
        <div className="flex items-end justify-center gap-4 pt-12 pb-8">
          {/* Rank 2 */}
          <div className="flex flex-col items-center gap-3">
             <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-slate-400/50 flex items-center justify-center relative">
                <Medal className="w-8 h-8 text-slate-400" />
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-400 text-slate-950 rounded-full flex items-center justify-center font-black text-xs">2</div>
             </div>
             <p className="text-[10px] font-black text-white uppercase">{MOCK_LEADERBOARD[1].name}</p>
             <div className="w-20 h-24 bg-gradient-to-t from-slate-800/20 to-slate-400/20 rounded-t-2xl border-x border-t border-slate-400/30" />
          </div>

          {/* Rank 1 */}
          <div className="flex flex-col items-center gap-3 -translate-y-6">
             <div className="w-20 h-20 rounded-3xl bg-slate-800 border-2 border-yellow-400 flex items-center justify-center relative shadow-[0_0_30px_rgba(250,204,21,0.3)]">
                <Trophy className="w-10 h-10 text-yellow-400" />
                <div className="absolute -top-4 -right-4 w-10 h-10 bg-yellow-400 text-slate-950 rounded-full flex items-center justify-center font-black text-sm">1</div>
             </div>
             <p className="text-xs font-black text-white uppercase">{MOCK_LEADERBOARD[0].name}</p>
             <div className="w-24 h-32 bg-gradient-to-t from-yellow-400/5 to-yellow-400/20 rounded-t-3xl border-x border-t border-yellow-400/40" />
          </div>

          {/* Rank 3 */}
          <div className="flex flex-col items-center gap-3">
             <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-orange-400/50 flex items-center justify-center relative">
                <Medal className="w-8 h-8 text-orange-400" />
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-orange-400 text-slate-950 rounded-full flex items-center justify-center font-black text-xs">3</div>
             </div>
             <p className="text-[10px] font-black text-white uppercase">{MOCK_LEADERBOARD[2].name}</p>
             <div className="w-20 h-20 bg-gradient-to-t from-orange-400/5 to-orange-400/20 rounded-t-2xl border-x border-t border-orange-400/30" />
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {MOCK_LEADERBOARD.slice(3).map((player, idx) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={player.id}
              className="flex items-center justify-between p-5 bg-slate-900/50 border border-white/5 rounded-3xl hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-5">
                <span className="text-sm font-black text-slate-500 w-4">{idx + 4}</span>
                <div className="w-10 h-10 bg-slate-800 rounded-xl border border-white/5 flex items-center justify-center font-black text-indigo-400 text-xs">
                  LV{player.level}
                </div>
                <span className="text-sm font-black text-white uppercase tracking-tight">{player.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />
                <span className="text-sm font-black tabular-nums text-slate-300">{player.xp.toLocaleString()}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Current User Fixed Bar */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[460px] px-4">
           <div className="bg-indigo-600 p-5 rounded-[2.5rem] border border-white/20 shadow-[0_0_50px_rgba(79,70,229,0.4)] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center font-black text-white">#99</div>
                <div>
                   <p className="text-xs font-black text-white uppercase">You (Guest)</p>
                   <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Level 1 // 0 XP</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-black/20 rounded-full">
                 <Flame className="w-4 h-4 text-orange-400" />
                 <span className="text-xs font-black text-white">New Player</span>
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}
