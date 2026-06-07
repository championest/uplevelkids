/**
 * Coin packs + premium pass catalog.
 * Prices in THB. Coin amount includes bonus where applicable.
 */
export interface CoinPack {
  id: string;
  name: string;
  priceTHB: number;
  coins: number;
  bonus: number;
  emoji: string;
  highlight?: string;
}

export const COIN_PACKS: CoinPack[] = [
  { id: 'pack_small',  name: 'ถุงเหรียญ',     priceTHB: 39,  coins: 1000,  bonus: 0,    emoji: '👛' },
  { id: 'pack_medium', name: 'กระเป๋าเหรียญ', priceTHB: 99,  coins: 3000,  bonus: 500,  emoji: '🎒', highlight: 'ฮิตที่สุด' },
  { id: 'pack_big',    name: 'กล่องเหรียญ',   priceTHB: 199, coins: 7000,  bonus: 1500, emoji: '🎁' },
  { id: 'pack_mega',   name: 'หีบสมบัติ',     priceTHB: 399, coins: 16000, bonus: 4000, emoji: '💎', highlight: 'คุ้มสุด' },
];

export interface PremiumPass {
  id: string;
  name: string;
  priceTHB: number;
  days: number;
  perks: string[];
  emoji: string;
}

export const PREMIUM_PASSES: PremiumPass[] = [
  {
    id: 'pass_1m',
    name: 'พาสนักผจญภัย — 1 เดือน',
    priceTHB: 99,
    days: 30,
    perks: [
      'รายวัน +100 เหรียญฟรี',
      'ปลดอวตารพรีเมียม',
      'XP ×2 ทุกโหมด',
      'ทดสอบฝีมือได้ 3 รอบ/วัน',
    ],
    emoji: '🗺️',
  },
  {
    id: 'pass_3m',
    name: 'พาสนักผจญภัย — 3 เดือน',
    priceTHB: 249,
    days: 90,
    perks: [
      'รายวัน +150 เหรียญฟรี',
      'ปลดอวตารพรีเมียม',
      'XP ×2 ทุกโหมด',
      'ทดสอบฝีมือได้ 5 รอบ/วัน',
      'เฟรมรายชื่อพิเศษ',
    ],
    emoji: '⚔️',
  },
];

export function findProduct(id: string) {
  return COIN_PACKS.find((p) => p.id === id) || PREMIUM_PASSES.find((p) => p.id === id);
}
