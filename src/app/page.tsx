'use client';

import ProfileCard from "@/components/ProfileCard";
import AvatarStore from "@/components/AvatarStore";
import Link from "next/link";
import { Play, Trophy, Settings, Star, Zap, Target, CheckCircle2, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";
import { useGame } from "@/lib/GameContext";
import { ACHIEVEMENTS } from "@/lib/rpg";
import { cn } from "@/lib/utils";
import AvatarVisual from "@/components/AvatarVisual";

export default function Home() {
  const { state } = useGame();

  const menuItems = [
    { id: 'play', label: 'Start Mission', icon: Play, href: '/play', color: 'bg-indigo-500', shadow: 'shadow-indigo-500/40' },
    { id: 'practice', label: 'Practice', icon: Dumbbell, href: '/practice', color: 'bg-cyan-500', shadow: 'shadow-cyan-500/40' },
    { id: 'leaderboard', label: 'Rankings', icon: Trophy, href: '/leaderboard', color: 'bg-yellow-500', shadow: 'shadow-yellow-500/40' },
  ];

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 font-['Plus_Jakarta_Sans'] selection:bg-indigo-500/30 overflow-x-hidden flex flex-col items-center p-6">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.08),transparent_80%)]" />
      </div>

      <div className="w-full max-w-[500px] relative z-10 space-y-8 pt-4 pb-12">
        {/* Header */}
        <header className="flex justify-between items-center px-2">
           <ProfileCard />
           <div className="flex gap-3">
              <AvatarStore />
              <button className="p-3 bg-slate-900/80 border border-white/10 rounded-2xl text-slate-500 hover:text-white transition-colors">
                <Settings className="w-6 h-6" />
              </button>
           </div>
        </header>

        {/* Dashboard Stats & Avatar Visual */}
        <section className="px-2">
           <div className="relative bg-slate-900/50 border border-white/10 rounded-[3rem] p-8 backdrop-blur-sm overflow-hidden">
              <div className="flex justify-between items-start mb-10">
                 <div className="space-y-1">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">DASHBOARD</h2>
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em]">Neural Status: Optimized</p>
                 </div>
                 <div className="bg-indigo-500/20 px-4 py-2 rounded-full border border-indigo-500/30 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-black text-indigo-400 uppercase">LV.{state.level}</span>
                 </div>
              </div>

              <div className="flex flex-col items-center gap-10">
                 {/* Central Large Avatar Display */}
                 <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full scale-150" />
                    <AvatarVisual size="xl" className="relative z-10" />
                 </div>

                 <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="bg-slate-950/40 p-5 rounded-3xl border border-white/5">
                       <div className="flex items-center gap-2 mb-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="text-[8px] font-black text-slate-500 uppercase">XP Pool</span>
                       </div>
                       <p className="text-xl font-black text-white">{state.xp.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-950/40 p-5 rounded-3xl border border-white/5">
                       <div className="flex items-center gap-2 mb-1">
                          <Target className="w-3 h-3 text-red-500" />
                          <span className="text-[8px] font-black text-slate-500 uppercase">Solved</span>
                       </div>
                       <p className="text-xl font-black text-white">{state.totalSolved || 0}</p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Action Menu */}
        <nav className="grid grid-cols-1 gap-4 px-2">
           {menuItems.map((item) => (
             <Link key={item.id} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative bg-slate-900/80 border border-white/10 rounded-[2.5rem] p-6 flex items-center justify-between overflow-hidden"
                >
                   <div className="flex items-center gap-6 relative z-10">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", item.color, item.shadow)}>
                         <item.icon className="w-7 h-7" />
                      </div>
                      <span className="text-xl font-black uppercase italic tracking-tight text-white">{item.label}</span>
                   </div>
                   <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      <Play className="w-4 h-4 text-slate-500 group-hover:text-white" />
                   </div>
                </motion.div>
             </Link>
           ))}
        </nav>

        {/* Quests / Achievements Section */}
        <section className="px-2 space-y-4">
           <div className="flex items-center justify-between ml-2">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Neural Achievements</h3>
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                {state.achievements.length} / {ACHIEVEMENTS.length}
              </span>
           </div>
           
           <div className="grid grid-cols-1 gap-3">
              {ACHIEVEMENTS.map((ach) => {
                const isUnlocked = state.achievements.includes(ach.id);
                return (
                  <div 
                    key={ach.id}
                    className={cn(
                      "p-5 rounded-[2rem] border transition-all flex items-center justify-between",
                      isUnlocked 
                        ? "bg-green-500/10 border-green-500/30" 
                        : "bg-slate-900/40 border-white/5 grayscale opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-5">
                       <div className="text-3xl">{ach.icon}</div>
                       <div className="space-y-1">
                          <p className="text-sm font-black text-white uppercase tracking-tight">{ach.title}</p>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{ach.description}</p>
                       </div>
                    </div>
                    {isUnlocked ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <div className="bg-slate-800 px-3 py-1.5 rounded-full text-[9px] font-black text-yellow-500">
                        +{ach.reward} C
                      </div>
                    )}
                  </div>
                );
              })}
           </div>
        </section>

        <footer className="pt-8 flex flex-col items-center gap-4 opacity-30">
           <div className="h-px w-20 bg-indigo-500/30" />
           <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-600 text-center">
             UPLEVEL_KIDS_OS // V2.5.0
           </p>
        </footer>
      </div>
    </main>
  );
}
