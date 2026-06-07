'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Trophy, Dumbbell, Swords, Coins, Sparkles, CheckCircle2, Mic2, Wrench } from "lucide-react";
import { statusForAvgSec, avgSecondsFromSession } from "@/lib/speed";
import { useGame } from "@/lib/GameContext";
import { ACHIEVEMENTS, getXpInCurrentLevel, XP_PER_LEVEL } from "@/lib/rpg";
import { cn } from "@/lib/utils";
import { useLeaderboardSync } from "@/lib/useLeaderboardSync";
import AvatarVisual from "@/components/AvatarVisual";
import AvatarStore from "@/components/AvatarStore";
import DailyBonus from "@/components/DailyBonus";

const MENU = [
  { id: 'play', label: 'ผจญภัย', sub: 'Adventure', icon: Play, href: '/play', from: '#ff9a3c', to: '#ff5a6a' },
  { id: 'soundcheck', label: 'เช็คฝีมือ', sub: 'Soundcheck', icon: Mic2, href: '/soundcheck', from: '#ff6fb5', to: '#9b6dff' },
  { id: 'garage', label: 'โรงรถ', sub: 'Garage', icon: Wrench, href: '/garage', from: '#9b6dff', to: '#4cc9ff' },
  { id: 'practice', label: 'ฝึกฝีมือ', sub: 'Practice', icon: Dumbbell, href: '/practice', from: '#4cc9ff', to: '#5ddc7e' },
  { id: 'lobby', label: 'ดวลเพื่อน', sub: 'Battle Online', icon: Swords, href: '/lobby', from: '#5ddc7e', to: '#4cc9ff' },
  { id: 'leaderboard', label: 'ตารางเทพ', sub: 'Rankings', icon: Trophy, href: '/leaderboard', from: '#ffd23f', to: '#ff9a3c' },
];

// Friendlier achievement labels (Thai + English) overlaid on existing IDs
const ACH_LABEL: Record<string, { th: string; en: string }> = {
  first_win: { th: 'เปิดตัวสุดปัง!', en: 'First Step' },
  math_master: { th: 'เทพคณิต', en: 'Math Champion' },
  speed_demon: { th: 'ไวเว่อร์', en: 'Super Speedy' },
  big_spender: { th: 'นักช็อปมือใหม่', en: 'First Shopper' },
};

export default function Home() {
  const { state } = useGame();
  useLeaderboardSync();
  const xpInLevel = getXpInCurrentLevel(state.xp);
  const xpProgress = Math.min(100, (xpInLevel / XP_PER_LEVEL) * 100);
  const avgSec = typeof window !== 'undefined' ? avgSecondsFromSession() : 999;
  const statusTier = statusForAvgSec(avgSec);

  return (
    <main className="min-h-screen flex flex-col items-center px-5 pt-6 pb-16 overflow-x-hidden">
      <DailyBonus />
      {/* floating background sparkles */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl opacity-60 kid-float"
            style={{
              left: `${(i * 13 + 5) % 95}%`,
              top: `${(i * 17 + 8) % 90}%`,
              animationDelay: `${i * 0.7}s`,
              color: ['#ff6fb5', '#ffd23f', '#9b6dff', '#4cc9ff'][i % 4],
            }}
          >
            {['✦', '★', '◆', '♥'][i % 4]}
          </div>
        ))}
      </div>

      <div className="w-full max-w-[500px] relative z-10 space-y-6">
        {/* Top bar — coins + level */}
        <header className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 bg-white/90 px-4 py-2.5 rounded-full border-4 border-white shadow-[0_6px_0_rgba(255,210,63,0.6)]">
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className="font-display text-xl text-[#2b1d57] tabular-nums">{state.coins}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white/90 px-4 py-2.5 rounded-full border-4 border-white shadow-[0_6px_0_rgba(155,109,255,0.5)]">
              <Sparkles className="w-5 h-5 text-[#9b6dff]" />
              <span className="font-display text-xl text-[#2b1d57]">Lv {state.level}</span>
            </div>
            <AvatarStore />
          </div>
        </header>

        {/* Hero card with Mascot + welcome */}
        <section className="kid-card p-6 pt-10 relative overflow-visible">
          <div className="absolute -top-4 -right-3 text-4xl kid-sparkle pointer-events-none">✨</div>
          <div className="flex items-center gap-4">
            <AvatarVisual size="xl" />
            <div className="flex-1">
              <h1 className="font-display text-3xl text-[#2b1d57] leading-tight">
                เฮ้! 👋
              </h1>
              <p className="font-display text-xl text-[#9b6dff] -mt-1">ลุยกันเลย!</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-white" style={{ background: statusTier.color }}>
                <span className="text-base">{statusTier.emoji}</span>
                <span className="text-xs font-display text-white drop-shadow">{statusTier.name}</span>
                {avgSec < 50 && <span className="text-[10px] text-white/80 tabular-nums">· {avgSec.toFixed(1)}s</span>}
              </div>
            </div>
          </div>

          {/* XP bar — juicy */}
          <div className="mt-5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-bold text-[#2b1d57]/70">แต้มเลเวล · XP</span>
              <span className="text-xs font-bold text-[#9b6dff] tabular-nums">{xpInLevel} / {XP_PER_LEVEL}</span>
            </div>
            <div className="h-5 bg-white rounded-full border-[3px] border-[#2b1d57]/10 overflow-hidden p-0.5">
              <div
                style={{ width: `${xpProgress}%` }}
                className="h-full rounded-full bg-gradient-to-r from-[#ff6fb5] via-[#ffd23f] to-[#5ddc7e] shadow-inner transition-all duration-700"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-white/80 rounded-2xl p-3 border-2 border-white">
              <p className="text-[10px] font-bold text-[#2b1d57]/50">เคลียร์ไป</p>
              <p className="font-display text-2xl text-[#2b1d57]">{state.totalSolved || 0}</p>
              <p className="text-[10px] text-[#2b1d57]/50">ข้อ · solved</p>
            </div>
            <div className="bg-white/80 rounded-2xl p-3 border-2 border-white">
              <p className="text-[10px] font-bold text-[#2b1d57]/50">เหรียญ</p>
              <p className="font-display text-2xl text-[#2b1d57]">{state.coins}</p>
              <p className="text-[10px] text-[#2b1d57]/50">coins</p>
            </div>
          </div>
        </section>

        {/* Big colorful menu buttons */}
        <nav className="grid grid-cols-2 gap-3">
          {MENU.map((item) => (
            <Link key={item.id} href={item.href} className="block">
              <motion.div
                whileTap={{ scale: 0.94 }}
                className="kid-btn w-full aspect-[1.2] flex-col text-white relative overflow-hidden"
                style={{
                  background: `linear-gradient(160deg, ${item.from}, ${item.to})`,
                }}
              >
                <div className="absolute top-2 right-2 text-white/40 text-xl kid-sparkle">✦</div>
                <item.icon className="w-10 h-10 drop-shadow-lg" strokeWidth={2.5} />
                <span className="font-display text-lg mt-1 leading-none">{item.label}</span>
                <span className="text-[9px] uppercase tracking-wider opacity-80">{item.sub}</span>
              </motion.div>
            </Link>
          ))}
        </nav>

        {/* Achievements / Badges */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-display text-xl text-[#2b1d57]">เหรียญเทพ · Badges</h2>
            <span className="text-xs font-bold text-[#9b6dff] bg-white/80 px-3 py-1 rounded-full">
              {state.achievements.length} / {ACHIEVEMENTS.length}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {ACHIEVEMENTS.map((ach) => {
              const unlocked = state.achievements.includes(ach.id);
              const label = ACH_LABEL[ach.id] ?? { th: ach.title, en: ach.title };
              return (
                <div
                  key={ach.id}
                  className={cn(
                    "p-4 rounded-3xl border-4 transition-all flex flex-col items-center text-center gap-1",
                    unlocked
                      ? "bg-gradient-to-br from-[#fff4b8] to-[#ffd23f] border-white shadow-[0_6px_0_rgba(255,154,60,0.5)]"
                      : "bg-white/70 border-white/80 opacity-70"
                  )}
                >
                  <div className={cn("text-4xl", unlocked && "kid-bounce")}>{ach.icon}</div>
                  <p className="font-display text-base text-[#2b1d57] leading-tight">{label.th}</p>
                  <p className="text-[10px] text-[#2b1d57]/60">{label.en}</p>
                  {unlocked ? (
                    <CheckCircle2 className="w-5 h-5 text-[#5ddc7e]" />
                  ) : (
                    <span className="text-[10px] font-bold text-[#ff9a3c] bg-white/90 px-2 py-0.5 rounded-full">+{ach.reward} 🪙</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <footer className="pt-4 text-center">
          <p className="text-xs font-bold text-[#2b1d57]/40">Up Level Kids · เล่นสนุก เก่งไปด้วย</p>
        </footer>
      </div>
    </main>
  );
}
