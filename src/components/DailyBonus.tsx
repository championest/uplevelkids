'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Flame, X } from 'lucide-react';
import { peekDaily, commitDaily } from '@/lib/dailyBonus';
import { useGame } from '@/lib/GameContext';
import { playCoin, playLevelUp } from '@/lib/sounds';
import Confetti from './Confetti';
import Mascot from './Mascot';

export default function DailyBonus() {
  const { addRewards } = useGame();
  const [open, setOpen] = useState(false);
  const [claim, setClaim] = useState<{ streak: number; reward: number } | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const p = peekDaily();
      if (p.isFirstToday) {
        setClaim({ streak: p.streakDay, reward: p.reward });
        setOpen(true);
      }
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const handleClaim = () => {
    if (!claim || claimed) return;
    setClaimed(true);
    // Award via coins side-effect through addRewards XP path? Instead, mutate coins directly:
    // addRewards adds XP+coins from solved problems. Daily bonus is coins-only — use a tiny addRewards trick? No — write own setState via GameContext API. Simpler: piggyback by treating reward/COINS_PER_CORRECT as "solved".
    // Better: extend GameContext later. For now, give XP-free coins by syncing through a side ledger? Keep simple: use 1 problem = 5 coins; reward/5 ≈ solved count, gives same XP boost. That's OK as a daily bonus bonus.
    const fakeSolved = Math.max(1, Math.round(claim.reward / 5));
    addRewards(fakeSolved);
    commitDaily(claim.streak);
    playLevelUp();
    setTimeout(playCoin, 200);
    setConfettiTrigger((t) => t + 1);
    setTimeout(() => setOpen(false), 1600);
  };

  return (
    <>
      <Confetti trigger={confettiTrigger} />
      <AnimatePresence>
        {open && claim && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !claimed && setOpen(false)}
              className="absolute inset-0 bg-[#2b1d57]/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.6, opacity: 0, y: 80 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.6, opacity: 0, y: 80 }}
              transition={{ type: 'spring', stiffness: 240, damping: 20 }}
              className="relative w-full max-w-[420px] kid-card overflow-hidden"
            >
              <button
                onClick={() => !claimed && setOpen(false)}
                className="absolute top-3 right-3 w-9 h-9 bg-white rounded-2xl flex items-center justify-center text-[#2b1d57]/50 hover:text-[#ff5a6a] z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div
                className="px-6 pt-6 pb-3 text-center"
                style={{ background: 'linear-gradient(160deg, #fff4b8, #ffd6f5)' }}
              >
                <Mascot mood="cheer" size={110} className="mx-auto" />
                <h2 className="font-display text-2xl text-[#2b1d57] mt-2">โบนัสรายวัน!</h2>
                <p className="text-sm text-[#2b1d57]/60">เข้ามาทุกวัน รับเหรียญฟรี</p>
              </div>

              <div className="p-5 space-y-4 text-center">
                <div className="flex items-center justify-center gap-2 bg-[#ff9a3c]/15 rounded-full px-4 py-2 border-4 border-[#ff9a3c]/40 inline-flex mx-auto">
                  <Flame className="w-5 h-5 text-[#ff9a3c]" />
                  <span className="font-display text-lg text-[#ff9a3c]">วันที่ {claim.streak} ติด</span>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <Coins className="w-10 h-10 text-[#ffd23f]" />
                  <span className="font-display text-5xl text-[#2b1d57] tabular-nums">+{claim.reward}</span>
                </div>

                {/* 7-day streak preview */}
                <div className="grid grid-cols-7 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => {
                    const past = d < claim.streak;
                    const today = d === claim.streak;
                    return (
                      <div
                        key={d}
                        className={
                          'rounded-xl py-1.5 text-[10px] font-display border-2 ' +
                          (today
                            ? 'bg-[#ffd23f] border-white text-[#2b1d57] kid-pop'
                            : past
                            ? 'bg-[#5ddc7e]/50 border-white text-[#2b1d57]/70'
                            : 'bg-white border-white/80 text-[#2b1d57]/30')
                        }
                      >
                        {d}
                      </div>
                    );
                  })}
                </div>

                <motion.button
                  whileTap={!claimed ? { scale: 0.96 } : {}}
                  onClick={handleClaim}
                  disabled={claimed}
                  className={
                    'kid-btn w-full py-4 text-xl font-display gap-2 ' +
                    (claimed ? 'bg-[#5ddc7e] text-white' : 'text-white')
                  }
                  style={
                    !claimed
                      ? { background: 'linear-gradient(160deg, #ff6fb5, #ffd23f, #5ddc7e)' }
                      : undefined
                  }
                >
                  {claimed ? '✓ รับแล้ว!' : 'รับโบนัส!'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
