'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, Lock, Star } from 'lucide-react';
import { useGame } from '@/lib/GameContext';
import { WORLDS, isStageUnlocked, Stage, World } from '@/lib/rpg';
import { cn } from '@/lib/utils';
import StageEngine from '@/components/StageEngine';
import Mascot from '@/components/Mascot';

export default function PlayPage() {
  const { state } = useGame();
  const [activeStage, setActiveStage] = useState<{ stage: Stage; world: World } | null>(null);

  if (activeStage) {
    return (
      <main className="min-h-screen flex flex-col items-center px-4 pt-6 pb-12">
        <div className="w-full max-w-[520px] relative z-10 space-y-4">
          <header className="flex justify-between items-center">
            <button
              onClick={() => setActiveStage(null)}
              className="kid-btn bg-white px-4 py-3 text-[#9b6dff]"
            >
              <ChevronLeft className="w-6 h-6" />
              <span className="font-display text-base">แผนที่</span>
            </button>
            <div className="text-right">
              <p className="font-display text-base text-[#2b1d57]">{activeStage.world.emoji} {activeStage.stage.name}</p>
              <p className="text-xs text-[#2b1d57]/60">{activeStage.world.name}</p>
            </div>
          </header>
          <StageEngine
            stage={activeStage.stage}
            worldColor={activeStage.world.color}
            onExit={() => setActiveStage(null)}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 pt-6 pb-16">
      <div className="w-full max-w-[520px] relative z-10 space-y-5">
        <header className="flex justify-between items-center">
          <Link href="/" className="kid-btn bg-white px-4 py-3 text-[#9b6dff]">
            <ChevronLeft className="w-6 h-6" />
            <span className="font-display text-base">กลับ</span>
          </Link>
          <div className="text-right">
            <p className="font-display text-base text-[#2b1d57]">ผจญภัย</p>
            <p className="text-xs text-[#2b1d57]/60">Adventure</p>
          </div>
        </header>

        <div className="kid-card p-4 flex items-center gap-3">
          <Mascot mood="cheer" size={70} />
          <div className="flex-1">
            <p className="font-display text-xl text-[#2b1d57] leading-tight">ลุยทีละด่าน เก็บดาวให้ครบ!</p>
            <p className="text-xs text-[#2b1d57]/60">เคลียร์ด่านบอสเพื่อเปิดโลกใหม่</p>
          </div>
        </div>

        {WORLDS.map((world) => (
          <WorldSection
            key={world.id}
            world={world}
            progress={state.stageProgress}
            onPick={(stage) => setActiveStage({ stage, world })}
          />
        ))}
      </div>
    </main>
  );
}

function WorldSection({
  world,
  progress,
  onPick,
}: {
  world: World;
  progress: ReturnType<typeof useGame>['state']['stageProgress'];
  onPick: (s: Stage) => void;
}) {
  const earnedStars = world.stages.reduce((sum, s) => sum + (progress[s.id]?.stars ?? 0), 0);
  const totalStars = world.stages.length * 3;
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-3"
    >
      <motion.div
        whileInView={{ scale: [0.94, 1] }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, ease: 'backOut' }}
        className="rounded-3xl p-4 border-4 border-white flex items-center justify-between"
        style={{ background: `linear-gradient(135deg, ${world.bgFrom}, ${world.bgTo})` }}
      >
        <div className="flex items-center gap-3">
          <div className="text-4xl kid-bounce">{world.emoji}</div>
          <div>
            <h2 className="font-display text-xl text-[#2b1d57] leading-none">{world.name}</h2>
            <p className="text-xs text-[#2b1d57]/70 mt-1">{world.stages.length} ด่าน</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-white/80 px-3 py-1.5 rounded-full">
          <Star className="w-4 h-4 fill-[#ffd23f] text-[#ffd23f]" />
          <span className="font-display text-sm text-[#2b1d57]">{earnedStars}/{totalStars}</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-3 px-1">
        {world.stages.map((stage, idx) => {
          const unlocked = isStageUnlocked(stage.id, progress);
          const result = progress[stage.id];
          const stars = result?.stars ?? 0;
          const isBoss = stage.name.startsWith('บอส') || stage.name.includes('บอส');
          return (
            <motion.button
              key={stage.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              whileTap={unlocked ? { scale: 0.97 } : {}}
              onClick={() => unlocked && onPick(stage)}
              disabled={!unlocked}
              className={cn(
                'kid-btn w-full p-4 flex-row justify-between gap-3 text-left',
                unlocked ? 'text-white' : 'bg-white/70 text-[#2b1d57]/40 cursor-not-allowed'
              )}
              style={
                unlocked
                  ? {
                      background: isBoss
                        ? `linear-gradient(135deg, ${world.color}, #ff5a6a)`
                        : `linear-gradient(135deg, ${world.color}, ${world.bgTo})`,
                    }
                  : undefined
              }
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center font-display text-lg border-3',
                    unlocked ? 'bg-white/25 border-white/40 text-white' : 'bg-white/60 border-white/80'
                  )}
                >
                  {unlocked ? (isBoss ? '👑' : idx + 1) : <Lock className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-display text-base leading-tight">{stage.name}</p>
                  <p className={cn('text-xs leading-tight', unlocked ? 'opacity-80' : 'opacity-60')}>
                    {stage.problemCount} ข้อ · +{stage.rewardCoins}🪙
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {[1, 2, 3].map((n) => (
                  <Star
                    key={n}
                    className={cn(
                      'w-5 h-5 transition-all',
                      stars >= n ? 'fill-[#ffd23f] text-[#ffd23f] drop-shadow' : 'text-white/30'
                    )}
                  />
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
}
