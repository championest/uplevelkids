export interface Item {
  id: string;
  name: string;
  price: number;
  category: 'hat' | 'aura' | 'pet';
  image: string;
}

export const SHOP_ITEMS: Item[] = [
  { id: 'hat_1', name: 'Cyber Cap', price: 50, category: 'hat', image: '🧢' },
  { id: 'hat_2', name: 'Golden Crown', price: 250, category: 'hat', image: '👑' },
  { id: 'aura_1', name: 'Neon Glow', price: 150, category: 'aura', image: '✨' },
  { id: 'aura_2', name: 'Plasma Field', price: 400, category: 'aura', image: '🌀' },
  { id: 'pet_1', name: 'Robo-Pup', price: 300, category: 'pet', image: '🐶' },
  { id: 'pet_2', name: 'Space Cat', price: 500, category: 'pet', image: '🐱' },
];

export interface Achievement {
  id: string;
  title: string;
  description: string;
  requirement: number;
  reward: number;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_win', title: 'First Blood', description: 'Solve 1 problem', requirement: 1, reward: 50, icon: '🎯' },
  { id: 'math_master', title: 'Math Master', description: 'Solve 100 problems', requirement: 100, reward: 500, icon: '🎓' },
  { id: 'speed_demon', title: 'Speed Demon', description: 'Solve 10 problems in one go', requirement: 10, reward: 200, icon: '⚡' },
  { id: 'big_spender', title: 'Big Spender', description: 'Buy your first item', requirement: 1, reward: 100, icon: '💎' },
];

export interface UserState {
  coins: number;
  xp: number;
  level: number;
  totalSolved: number;
  inventory: string[];
  achievements: string[]; // IDs of unlocked achievements
  equipped: {
    hat: string | null;
    aura: string | null;
    pet: string | null;
  };
}

export const INITIAL_STATE: UserState = {
  coins: 0,
  xp: 0,
  level: 1,
  totalSolved: 0,
  inventory: [],
  achievements: [],
  equipped: {
    hat: null,
    aura: null,
    pet: null,
  },
};

export const XP_PER_LEVEL = 500;
export const COINS_PER_CORRECT = 5;
export const XP_PER_CORRECT = 10;

export const calculateLevel = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;
export const getXpInCurrentLevel = (xp: number) => xp % XP_PER_LEVEL;
