'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { UserState, INITIAL_STATE, calculateLevel, COINS_PER_CORRECT, XP_PER_CORRECT, SHOP_ITEMS, ACHIEVEMENTS } from '@/lib/rpg';
import { useSession } from 'next-auth/react';

interface GameContextType {
  state: UserState;
  addRewards: (correctAnswers: number) => void;
  buyItem: (itemId: string) => boolean;
  equipItem: (itemId: string) => void;
  checkAchievements: () => void;
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
        // Migration: Ensure new fields exist
        setState({
          ...INITIAL_STATE,
          ...parsed,
          inventory: parsed.inventory || [],
          achievements: parsed.achievements || [],
          totalSolved: parsed.totalSolved || 0,
        });
      } catch (e) {
        console.error("Failed to load save", e);
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
      let newAchievements = [...prev.achievements];
      let changed = false;

      ACHIEVEMENTS.forEach(ach => {
        if (!newAchievements.includes(ach.id)) {
          let met = false;
          if (ach.id === 'first_win' && prev.totalSolved >= 1) met = true;
          if (ach.id === 'math_master' && prev.totalSolved >= 100) met = true;
          if (ach.id === 'big_spender' && prev.inventory.length >= 1) met = true;
          // Note: speed_demon logic would ideally be checked at the end of a battle
          
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

  const addRewards = (correctAnswers: number) => {
    setState((prev) => {
      const newXp = prev.xp + (correctAnswers * XP_PER_CORRECT);
      const newCoins = prev.coins + (correctAnswers * COINS_PER_CORRECT);
      const newLevel = calculateLevel(newXp);
      const newTotalSolved = (prev.totalSolved || 0) + correctAnswers;

      // Special check for speed demon here
      let newAchievements = [...prev.achievements];
      let bonusCoins = 0;
      if (correctAnswers >= 10 && !newAchievements.includes('speed_demon')) {
        newAchievements.push('speed_demon');
        const ach = ACHIEVEMENTS.find(a => a.id === 'speed_demon');
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
    // Trigger general check after reward update
    setTimeout(checkAchievements, 100);
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

  return (
    <GameContext.Provider value={{ state, addRewards, buyItem, equipItem, checkAchievements }}>
      {isLoaded ? children : (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white font-black italic">
          <div className="text-4xl animate-pulse text-indigo-500 mb-4 tracking-tighter">ESTABLISHING LINK...</div>
          <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 animate-[loading_1.5s_ease-in-out_infinite]" />
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
