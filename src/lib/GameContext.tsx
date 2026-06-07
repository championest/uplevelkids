'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import {
  UserState,
  INITIAL_STATE,
  calculateLevel,
  COINS_PER_CORRECT,
  XP_PER_CORRECT,
  SHOP_ITEMS,
  ACHIEVEMENTS,
  StageResult,
} from '@/lib/rpg';
import { GameMode, modeReward } from '@/lib/modes';
import { useSession } from 'next-auth/react';

interface GameContextType {
  state: UserState;
  /** Legacy: defaults to "practice" rate (4 coins + 6 XP per correct). */
  addRewards: (correctAnswers: number) => void;
  /** TTRS-style mode-specific reward */
  addModeRewards: (mode: GameMode, correctAnswers: number) => void;
  /** Add raw coins (e.g. from coin packs, daily bonus, stage clear reward). */
  addCoins: (amount: number) => void;
  buyItem: (itemId: string) => boolean;
  equipItem: (itemId: string) => void;
  checkAchievements: () => void;
  completeStage: (stageId: string, stars: 0 | 1 | 2 | 3, correct: number, rewardCoins: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const { data: session, status: sessionStatus } = useSession();
  const [state, setState] = useState<UserState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  const storageKey = session?.user?.email
    ? `up-level-kids-save-${session.user.email}`
    : 'up-level-kids-save-guest';

  useEffect(() => {
    if (sessionStatus === 'loading') return;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState({
          ...INITIAL_STATE,
          ...parsed,
          inventory: parsed.inventory || [],
          achievements: parsed.achievements || [],
          totalSolved: parsed.totalSolved || 0,
          stageProgress: parsed.stageProgress || {},
          // Migrate equipped from old 3-slot shape to 8-slot
          equipped: { ...INITIAL_STATE.equipped, ...(parsed.equipped || {}) },
          premiumPassId: parsed.premiumPassId ?? null,
          premiumExpiresAt: parsed.premiumExpiresAt ?? 0,
        });
      } catch {
        setState(INITIAL_STATE);
      }
    } else {
      setState(INITIAL_STATE);
    }
    setIsLoaded(true);
  }, [storageKey, sessionStatus]);

  useEffect(() => {
    if (isLoaded && sessionStatus !== 'loading') {
      localStorage.setItem(storageKey, JSON.stringify(state));
    }
  }, [state, isLoaded, storageKey, sessionStatus]);

  const checkAchievements = () => {
    setState((prev) => {
      let newCoins = prev.coins;
      const newAchievements = [...prev.achievements];
      let changed = false;

      ACHIEVEMENTS.forEach((ach) => {
        if (!newAchievements.includes(ach.id)) {
          let met = false;
          if (ach.id === 'first_win' && prev.totalSolved >= 1) met = true;
          if (ach.id === 'math_master' && prev.totalSolved >= 100) met = true;
          if (ach.id === 'big_spender' && prev.inventory.length >= 1) met = true;
          if (met) {
            newAchievements.push(ach.id);
            newCoins += ach.reward;
            changed = true;
          }
        }
      });

      return changed ? { ...prev, coins: newCoins, achievements: newAchievements } : prev;
    });
  };

  const applyRewards = (correct: number, coinsRate: number, xpRate: number) => {
    setState((prev) => {
      const newXp = prev.xp + correct * xpRate;
      const newCoins = prev.coins + correct * coinsRate;
      const newLevel = calculateLevel(newXp);
      const newTotalSolved = (prev.totalSolved || 0) + correct;
      const newAchievements = [...prev.achievements];
      let bonusCoins = 0;
      if (correct >= 10 && !newAchievements.includes('speed_demon')) {
        newAchievements.push('speed_demon');
        const ach = ACHIEVEMENTS.find((a) => a.id === 'speed_demon');
        bonusCoins = ach?.reward || 0;
      }
      return {
        ...prev,
        xp: newXp,
        coins: newCoins + bonusCoins,
        level: newLevel,
        totalSolved: newTotalSolved,
        achievements: newAchievements,
      };
    });
    setTimeout(checkAchievements, 100);
  };

  const addRewards = (correctAnswers: number) =>
    applyRewards(correctAnswers, COINS_PER_CORRECT, XP_PER_CORRECT);

  const addModeRewards = (mode: GameMode, correctAnswers: number) => {
    const { coins, xp } = modeReward(mode, correctAnswers);
    if (correctAnswers === 0) return;
    applyRewards(correctAnswers, coins / correctAnswers, xp / correctAnswers);
  };

  const addCoins = (amount: number) => {
    if (amount === 0) return;
    setState((prev) => ({ ...prev, coins: prev.coins + amount }));
  };

  const buyItem = (itemId: string) => {
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item || state.inventory.includes(itemId) || state.coins < item.price) return false;
    setState((prev) => ({
      ...prev,
      coins: prev.coins - item.price,
      inventory: [...prev.inventory, itemId],
    }));
    setTimeout(checkAchievements, 100);
    return true;
  };

  const equipItem = (itemId: string) => {
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item || !state.inventory.includes(itemId)) return;
    setState((prev) => ({
      ...prev,
      equipped: {
        ...prev.equipped,
        [item.category]: prev.equipped[item.category as keyof typeof prev.equipped] === itemId ? null : itemId,
      },
    }));
  };

  const completeStage = (
    stageId: string,
    stars: 0 | 1 | 2 | 3,
    correct: number,
    rewardCoins: number
  ) => {
    setState((prev) => {
      const prevResult: StageResult = prev.stageProgress[stageId] ?? { stars: 0, bestCorrect: 0 };
      const improved = stars > prevResult.stars;
      const nextStars = (Math.max(stars, prevResult.stars) as 0 | 1 | 2 | 3);
      const nextResult: StageResult = {
        stars: nextStars,
        bestCorrect: Math.max(correct, prevResult.bestCorrect),
      };
      // Only award stage coins the FIRST time a star tier improves (avoid farming)
      const bonus = improved ? Math.round(rewardCoins * (stars / 3)) : 0;
      return {
        ...prev,
        coins: prev.coins + bonus,
        stageProgress: { ...prev.stageProgress, [stageId]: nextResult },
      };
    });
  };

  return (
    <GameContext.Provider
      value={{ state, addRewards, addModeRewards, addCoins, buyItem, equipItem, checkAchievements, completeStage }}
    >
      {isLoaded ? (
        children
      ) : (
        <div className="min-h-screen flex flex-col items-center justify-center text-[#2b1d57] gap-4">
          <div className="text-4xl font-display kid-bounce">🌈</div>
          <div className="text-2xl font-display">กำลังโหลด...</div>
          <div className="w-48 h-3 bg-white/60 rounded-full overflow-hidden border-2 border-white">
            <div className="h-full bg-gradient-to-r from-[#ff6fb5] via-[#ffd23f] to-[#5ddc7e] animate-[loading_1.4s_ease-in-out_infinite]" />
          </div>
          <style jsx>{`
            @keyframes loading {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `}</style>
        </div>
      )}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
