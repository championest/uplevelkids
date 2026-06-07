import type { Operation, DifficultyLevel } from './math';

export type ItemSlot =
  | 'hat'
  | 'face'
  | 'top'
  | 'instrument'
  | 'accessory'
  | 'aura'
  | 'pet'
  | 'frame';

export type ItemRarity = 'common' | 'rare' | 'legendary';

export interface Item {
  id: string;
  name: string;
  price: number;
  category: ItemSlot;
  image: string;
  rarity?: ItemRarity;
}

// 50+ items across 8 slots — all earnable in coins (no IAP gating, TTRS-style).
// Prices: common 30-150, rare 200-500, legendary 800-2000.
export const SHOP_ITEMS: Item[] = [
  // --- HAT (10) ---
  { id: 'hat_grad',     name: 'หมวกนักเรียน',   price: 60,  category: 'hat', image: '🎓', rarity: 'common' },
  { id: 'hat_party',    name: 'หมวกปาร์ตี้',     price: 80,  category: 'hat', image: '🎩', rarity: 'common' },
  { id: 'hat_cowboy',   name: 'หมวกคาวบอย',    price: 120, category: 'hat', image: '🤠', rarity: 'common' },
  { id: 'hat_cap',      name: 'หมวกแก๊ป',       price: 90,  category: 'hat', image: '🧢', rarity: 'common' },
  { id: 'hat_helmet',   name: 'หมวกขับขี่',     price: 100, category: 'hat', image: '⛑️', rarity: 'common' },
  { id: 'hat_crown',    name: 'มงกุฎทอง',       price: 600, category: 'hat', image: '👑', rarity: 'rare' },
  { id: 'hat_chef',     name: 'หมวกเชฟ',        price: 200, category: 'hat', image: '👨‍🍳', rarity: 'rare' },
  { id: 'hat_magic',    name: 'หมวกพ่อมด',      price: 400, category: 'hat', image: '🧙', rarity: 'rare' },
  { id: 'hat_unicorn',  name: 'มงกุฎยูนิคอร์น', price: 1200, category: 'hat', image: '🦄', rarity: 'legendary' },
  { id: 'hat_halo',     name: 'แสงทิพย์',        price: 1800, category: 'hat', image: '😇', rarity: 'legendary' },

  // --- FACE / EXPRESSION (8) ---
  { id: 'face_smile',   name: 'ยิ้มร่า',         price: 30,  category: 'face', image: '😄', rarity: 'common' },
  { id: 'face_cool',    name: 'แว่นเท่',         price: 100, category: 'face', image: '😎', rarity: 'common' },
  { id: 'face_starry',  name: 'ตาดาว',          price: 200, category: 'face', image: '🤩', rarity: 'common' },
  { id: 'face_glasses', name: 'แว่นนักอ่าน',     price: 80,  category: 'face', image: '🤓', rarity: 'common' },
  { id: 'face_mask',    name: 'หน้ากากปาร์ตี้',  price: 220, category: 'face', image: '🥸', rarity: 'rare' },
  { id: 'face_ninja',   name: 'นินจาเงียบ',      price: 350, category: 'face', image: '🥷', rarity: 'rare' },
  { id: 'face_devil',   name: 'แกล้งซน',         price: 500, category: 'face', image: '😈', rarity: 'rare' },
  { id: 'face_robot',   name: 'หน้าหุ่นยนต์',    price: 1500, category: 'face', image: '🤖', rarity: 'legendary' },

  // --- TOP / OUTFIT (7) ---
  { id: 'top_shirt',    name: 'เสื้อยืด',        price: 50,  category: 'top', image: '👕', rarity: 'common' },
  { id: 'top_tie',      name: 'เนคไท',          price: 120, category: 'top', image: '👔', rarity: 'common' },
  { id: 'top_jacket',   name: 'แจ็คเก็ตหนัง',   price: 300, category: 'top', image: '🧥', rarity: 'rare' },
  { id: 'top_kimono',   name: 'กิโมโน',         price: 350, category: 'top', image: '👘', rarity: 'rare' },
  { id: 'top_dress',    name: 'ชุดเดรส',        price: 280, category: 'top', image: '👗', rarity: 'rare' },
  { id: 'top_lab',      name: 'เสื้อแล็บ',      price: 420, category: 'top', image: '🥼', rarity: 'rare' },
  { id: 'top_king',     name: 'ชุดราชวงศ์',     price: 1500, category: 'top', image: '🤴', rarity: 'legendary' },

  // --- WEAPON / TOOL (8) ---
  { id: 'ins_sword',    name: 'ดาบเหล็ก',        price: 80,  category: 'instrument', image: '🗡️', rarity: 'common' },
  { id: 'ins_bow',      name: 'ธนูนักล่า',       price: 100, category: 'instrument', image: '🏹', rarity: 'common' },
  { id: 'ins_shield',   name: 'โล่กันภัย',       price: 100, category: 'instrument', image: '🛡️', rarity: 'common' },
  { id: 'ins_axe',      name: 'ขวานยักษ์',       price: 120, category: 'instrument', image: '🪓', rarity: 'common' },
  { id: 'ins_wand',     name: 'ไม้กายสิทธิ์',     price: 250, category: 'instrument', image: '🪄', rarity: 'rare' },
  { id: 'ins_scroll',   name: 'คัมภีร์เก่า',     price: 280, category: 'instrument', image: '📜', rarity: 'rare' },
  { id: 'ins_torch',    name: 'คบเพลิง',         price: 240, category: 'instrument', image: '🔥', rarity: 'rare' },
  { id: 'ins_crystal',  name: 'ลูกแก้ววิเศษ',    price: 1200, category: 'instrument', image: '🔮', rarity: 'legendary' },

  // --- ACCESSORY (7) ---
  { id: 'acc_ribbon',   name: 'โบว์ผูกผม',      price: 40,  category: 'accessory', image: '🎀', rarity: 'common' },
  { id: 'acc_balloon',  name: 'ลูกโป่ง',        price: 60,  category: 'accessory', image: '🎈', rarity: 'common' },
  { id: 'acc_star',     name: 'ดาวประดับ',      price: 90,  category: 'accessory', image: '⭐', rarity: 'common' },
  { id: 'acc_medal',    name: 'เหรียญรางวัล',   price: 200, category: 'accessory', image: '🏅', rarity: 'rare' },
  { id: 'acc_trophy',   name: 'ถ้วยเล็ก',       price: 400, category: 'accessory', image: '🏆', rarity: 'rare' },
  { id: 'acc_wings',    name: 'ปีกนางฟ้า',      price: 700, category: 'accessory', image: '🪽', rarity: 'rare' },
  { id: 'acc_rocket',   name: 'เป้จรวด',        price: 1600, category: 'accessory', image: '🚀', rarity: 'legendary' },

  // --- AURA (7) ---
  { id: 'aura_rainbow', name: 'แสงรุ้ง',        price: 150, category: 'aura', image: '🌈', rarity: 'common' },
  { id: 'aura_sparkle', name: 'พายุดาว',        price: 300, category: 'aura', image: '✨', rarity: 'common' },
  { id: 'aura_fire',    name: 'เปลวไฟ',        price: 400, category: 'aura', image: '🔥', rarity: 'rare' },
  { id: 'aura_ice',     name: 'หิมะคริสตัล',   price: 400, category: 'aura', image: '❄️', rarity: 'rare' },
  { id: 'aura_storm',   name: 'พายุฟ้าผ่า',    price: 600, category: 'aura', image: '⚡', rarity: 'rare' },
  { id: 'aura_galaxy',  name: 'จักรวาล',       price: 1400, category: 'aura', image: '🌌', rarity: 'legendary' },
  { id: 'aura_blossom', name: 'ดอกซากุระ',     price: 900, category: 'aura', image: '🌸', rarity: 'rare' },

  // --- PET (8) ---
  { id: 'pet_dog',      name: 'หมาน้อย',        price: 250, category: 'pet', image: '🐶', rarity: 'common' },
  { id: 'pet_cat',      name: 'แมวเหมียว',      price: 250, category: 'pet', image: '🐱', rarity: 'common' },
  { id: 'pet_bunny',    name: 'กระต่ายฟู',      price: 280, category: 'pet', image: '🐰', rarity: 'common' },
  { id: 'pet_fox',      name: 'จิ้งจอก',         price: 350, category: 'pet', image: '🦊', rarity: 'rare' },
  { id: 'pet_panda',    name: 'หมีแพนด้า',      price: 400, category: 'pet', image: '🐼', rarity: 'rare' },
  { id: 'pet_dragon',   name: 'มังกรน้อย',       price: 1200, category: 'pet', image: '🐉', rarity: 'legendary' },
  { id: 'pet_unicorn',  name: 'ยูนิคอร์น',       price: 1800, category: 'pet', image: '🦄', rarity: 'legendary' },
  { id: 'pet_dino',     name: 'ไดโนเสาร์',       price: 600, category: 'pet', image: '🦕', rarity: 'rare' },

  // --- FRAME (profile frame, 5) ---
  { id: 'frame_basic',  name: 'กรอบมาตรฐาน',    price: 100, category: 'frame', image: '🟡', rarity: 'common' },
  { id: 'frame_silver', name: 'กรอบเงิน',       price: 300, category: 'frame', image: '⚪', rarity: 'rare' },
  { id: 'frame_gold',   name: 'กรอบทอง',        price: 600, category: 'frame', image: '🟠', rarity: 'rare' },
  { id: 'frame_diamond', name: 'กรอบเพชร',     price: 1500, category: 'frame', image: '💎', rarity: 'legendary' },
  { id: 'frame_neon',   name: 'กรอบนีออน',      price: 800, category: 'frame', image: '🟣', rarity: 'rare' },
];

export const SLOT_LABEL: Record<ItemSlot, { th: string; emoji: string }> = {
  hat: { th: 'หมวก', emoji: '🎩' },
  face: { th: 'ใบหน้า', emoji: '😎' },
  top: { th: 'เสื้อ', emoji: '👕' },
  instrument: { th: 'อาวุธ', emoji: '🗡️' },
  accessory: { th: 'ของประดับ', emoji: '🎀' },
  aura: { th: 'ออร่า', emoji: '✨' },
  pet: { th: 'สัตว์เลี้ยง', emoji: '🐾' },
  frame: { th: 'กรอบ', emoji: '🖼️' },
};

export const RARITY_META: Record<ItemRarity, { th: string; color: string; bg: string }> = {
  common:    { th: 'ทั่วไป',     color: '#5ddc7e', bg: '#caf7d6' },
  rare:      { th: 'หายาก',      color: '#9b6dff', bg: '#d5c9ff' },
  legendary: { th: 'ตำนาน',      color: '#ff9a3c', bg: '#ffd6a8' },
};

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

export type EquippedSlots = {
  [K in ItemSlot]: string | null;
};

export interface UserState {
  coins: number;
  xp: number;
  level: number;
  totalSolved: number;
  inventory: string[];
  achievements: string[];
  equipped: EquippedSlots;
  /** Stage progress: stageId → best stars (0-3) + best correct */
  stageProgress: Record<string, StageResult>;
  /** Active premium pass id, null if free */
  premiumPassId: string | null;
  /** Premium expiry timestamp (ms), 0 if none */
  premiumExpiresAt: number;
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
    face: null,
    top: null,
    instrument: null,
    accessory: null,
    aura: null,
    pet: null,
    frame: null,
  },
  stageProgress: {},
  premiumPassId: null,
  premiumExpiresAt: 0,
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
