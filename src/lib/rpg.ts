import type { Operation, DifficultyLevel } from './math';

export interface Item {
  id: string;
  name: string;
  price: number;
  category: 'hat' | 'aura' | 'pet';
  image: string;
}

// Kid-friendly shop items — bright, playful names
export const SHOP_ITEMS: Item[] = [
  { id: 'hat_1', name: 'หมวกนักเรียน', price: 50, category: 'hat', image: '🎓' },
  { id: 'hat_2', name: 'มงกุฎทอง', price: 250, category: 'hat', image: '👑' },
  { id: 'aura_1', name: 'แสงรุ้ง', price: 150, category: 'aura', image: '🌈' },
  { id: 'aura_2', name: 'พายุดาว', price: 400, category: 'aura', image: '✨' },
  { id: 'pet_1', name: 'หมาน้อย', price: 300, category: 'pet', image: '🐶' },
  { id: 'pet_2', name: 'แมวอวกาศ', price: 500, category: 'pet', image: '🐱' },
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
  { id: 'first_win', title: 'เปิดตัวสุดปัง', description: 'ตอบถูกข้อแรก', requirement: 1, reward: 50, icon: '🎯' },
  { id: 'math_master', title: 'เทพคณิต', description: 'ตอบถูก 100 ข้อ', requirement: 100, reward: 500, icon: '🎓' },
  { id: 'speed_demon', title: 'ไวเว่อร์', description: 'ตอบถูก 10 ข้อรวด', requirement: 10, reward: 200, icon: '⚡' },
  { id: 'big_spender', title: 'นักช็อปมือใหม่', description: 'ซื้อของชิ้นแรก', requirement: 1, reward: 100, icon: '💎' },
];

// --- Adventure Stages (worlds + stages, Candy-Crush style) ---

export interface Stage {
  id: string;
  name: string;
  operation: Operation;
  difficulty: DifficultyLevel;
  tables?: number[];
  problemCount: number;
  /** Stars target: e.g. {3: 100, 2: 80, 1: 60} → % accuracy thresholds */
  targets: { three: number; two: number; one: number };
  rewardCoins: number;
}

export interface World {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgFrom: string;
  bgTo: string;
  stages: Stage[];
}

const make = (
  id: string,
  name: string,
  operation: Operation,
  difficulty: DifficultyLevel,
  problemCount: number,
  rewardCoins: number,
  tables?: number[]
): Stage => ({
  id,
  name,
  operation,
  difficulty,
  tables,
  problemCount,
  targets: { three: 100, two: 80, one: 60 },
  rewardCoins,
});

export const WORLDS: World[] = [
  {
    id: 'w1',
    name: 'สวนผลไม้',
    emoji: '🍓',
    color: '#ff6fb5',
    bgFrom: '#ffd6f5',
    bgTo: '#ffb3d4',
    stages: [
      make('w1-1', 'บวกง่ายๆ', 'addition', '1-digit', 5, 20),
      make('w1-2', 'บวกต่อเนื่อง', 'addition', '1-digit', 10, 30),
      make('w1-3', 'ลบเบาๆ', 'subtraction', '1-digit', 5, 20),
      make('w1-4', 'ลบรัวๆ', 'subtraction', '1-digit', 10, 30),
      make('w1-5', 'บอสสวน', 'addition', '1-digit', 15, 60),
    ],
  },
  {
    id: 'w2',
    name: 'ชายหาด',
    emoji: '🏖️',
    color: '#4cc9ff',
    bgFrom: '#a5e8ff',
    bgTo: '#7cd1ff',
    stages: [
      make('w2-1', 'บวก 2 หลัก', 'addition', '2-digit', 8, 30),
      make('w2-2', 'ลบ 2 หลัก', 'subtraction', '2-digit', 8, 30),
      make('w2-3', 'ผสมโรง', 'addition', '2-digit', 12, 40),
      make('w2-4', 'แม่น้อย ๆ', 'multiplication', 'table-1-5', 10, 40, [2, 3, 4, 5]),
      make('w2-5', 'บอสหาด', 'subtraction', '2-digit', 15, 70),
    ],
  },
  {
    id: 'w3',
    name: 'ป่ามหัศจรรย์',
    emoji: '🌳',
    color: '#5ddc7e',
    bgFrom: '#caf7d6',
    bgTo: '#7ae7a0',
    stages: [
      make('w3-1', 'แม่ 2', 'multiplication', 'table-1-12', 10, 35, [2]),
      make('w3-2', 'แม่ 3', 'multiplication', 'table-1-12', 10, 35, [3]),
      make('w3-3', 'แม่ 4-5', 'multiplication', 'table-1-12', 12, 45, [4, 5]),
      make('w3-4', 'หาร 2-5', 'division', 'table-1-12', 10, 45, [2, 3, 4, 5]),
      make('w3-5', 'บอสป่า', 'multiplication', 'table-1-12', 15, 80, [2, 3, 4, 5]),
    ],
  },
  {
    id: 'w4',
    name: 'ภูเขาน้ำแข็ง',
    emoji: '🏔️',
    color: '#9b6dff',
    bgFrom: '#d5c9ff',
    bgTo: '#b39bff',
    stages: [
      make('w4-1', 'แม่ 6-7', 'multiplication', 'table-1-12', 12, 50, [6, 7]),
      make('w4-2', 'แม่ 8-9', 'multiplication', 'table-1-12', 12, 50, [8, 9]),
      make('w4-3', 'แม่ 10-12', 'multiplication', 'table-1-12', 12, 55, [10, 11, 12]),
      make('w4-4', 'หาร 6-9', 'division', 'table-1-12', 12, 55, [6, 7, 8, 9]),
      make('w4-5', 'บอสน้ำแข็ง', 'multiplication', 'table-1-12', 18, 100, [6, 7, 8, 9, 10, 11, 12]),
    ],
  },
  {
    id: 'w5',
    name: 'อวกาศ',
    emoji: '🚀',
    color: '#ff9a3c',
    bgFrom: '#ffdcb3',
    bgTo: '#ffb37a',
    stages: [
      make('w5-1', 'บวก 3 หลัก', 'addition', '3-digit', 10, 60),
      make('w5-2', 'ลบ 3 หลัก', 'subtraction', '3-digit', 10, 60),
      make('w5-3', 'คูณรวม', 'multiplication', 'table-1-12', 15, 70, [2, 4, 6, 8, 10, 12]),
      make('w5-4', 'หารรวม', 'division', 'table-1-12', 15, 70, [3, 5, 7, 9, 11]),
      make('w5-5', 'บอสจักรวาล', 'multiplication', 'table-1-12', 20, 150, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
    ],
  },
];

export interface StageResult {
  stars: 0 | 1 | 2 | 3;
  bestCorrect: number;
}

export interface UserState {
  coins: number;
  xp: number;
  level: number;
  totalSolved: number;
  inventory: string[];
  achievements: string[];
  equipped: {
    hat: string | null;
    aura: string | null;
    pet: string | null;
  };
  /** Stage progress: stageId → best stars (0-3) + best correct */
  stageProgress: Record<string, StageResult>;
}

export const INITIAL_STATE: UserState = {
  coins: 0,
  xp: 0,
  level: 1,
  totalSolved: 0,
  inventory: [],
  achievements: [],
  equipped: { hat: null, aura: null, pet: null },
  stageProgress: {},
};

export const XP_PER_LEVEL = 500;
export const COINS_PER_CORRECT = 5;
export const XP_PER_CORRECT = 10;

export const calculateLevel = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;
export const getXpInCurrentLevel = (xp: number) => xp % XP_PER_LEVEL;

/** Star count from accuracy % vs stage targets */
export function starsForStage(stage: Stage, correct: number, total: number): 0 | 1 | 2 | 3 {
  if (total === 0) return 0;
  const pct = (correct / total) * 100;
  if (pct >= stage.targets.three) return 3;
  if (pct >= stage.targets.two) return 2;
  if (pct >= stage.targets.one) return 1;
  return 0;
}

/** Flat ordered stage list */
export const ALL_STAGES: { world: World; stage: Stage; index: number }[] = WORLDS.flatMap((w) =>
  w.stages.map((s, i) => ({ world: w, stage: s, index: i }))
);

/** Is a stage unlocked? First stage always unlocked. Otherwise need prior stage stars > 0. */
export function isStageUnlocked(stageId: string, progress: Record<string, StageResult>): boolean {
  const idx = ALL_STAGES.findIndex((x) => x.stage.id === stageId);
  if (idx <= 0) return true;
  const prev = ALL_STAGES[idx - 1];
  return (progress[prev.stage.id]?.stars ?? 0) > 0;
}
