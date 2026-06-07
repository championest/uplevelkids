/**
 * TTRS-style coin economy: different modes pay different rates so kids
 * are pushed toward Garage/Gig for grinding while still rewarding the
 * speed-focused modes that drive Rock Status.
 */
export type GameMode =
  | 'studio'
  | 'garage'
  | 'soundcheck'
  | 'jamming'
  | 'gig'
  | 'arena'
  | 'festival'
  | 'adventure'
  | 'practice';

export const COIN_PER_CORRECT: Record<GameMode, number> = {
  garage: 10,
  gig: 10,
  adventure: 8,
  soundcheck: 5,
  jamming: 6,
  practice: 4,
  studio: 1,
  arena: 1,
  festival: 1,
};

export const XP_PER_CORRECT_BY_MODE: Record<GameMode, number> = {
  garage: 10,
  gig: 12,
  adventure: 10,
  soundcheck: 10,
  jamming: 6,
  practice: 6,
  studio: 4,
  arena: 4,
  festival: 4,
};

export interface ModeMeta {
  id: GameMode;
  th: string;
  en: string;
  emoji: string;
  desc: string;
  href: string;
  bgFrom: string;
  bgTo: string;
}

export const MODES: ModeMeta[] = [
  {
    id: 'adventure',
    th: 'ผจญภัย',
    en: 'Adventure',
    emoji: '🗺️',
    desc: 'เก็บดาว ปลดด่าน',
    href: '/play',
    bgFrom: '#ff9a3c',
    bgTo: '#ff5a6a',
  },
  {
    id: 'soundcheck',
    th: 'เช็คฝีมือ',
    en: 'Soundcheck',
    emoji: '🎤',
    desc: 'รายวัน · 25 ข้อ',
    href: '/soundcheck',
    bgFrom: '#ff6fb5',
    bgTo: '#9b6dff',
  },
  {
    id: 'garage',
    th: 'โรงรถ',
    en: 'Garage',
    emoji: '🔧',
    desc: 'ซ้อมจุดอ่อน · เหรียญเยอะ',
    href: '/garage',
    bgFrom: '#9b6dff',
    bgTo: '#4cc9ff',
  },
  {
    id: 'studio',
    th: 'สตูดิโอ',
    en: 'Studio',
    emoji: '🎧',
    desc: '1 นาที วัดเรทตอบ',
    href: '/studio',
    bgFrom: '#4cc9ff',
    bgTo: '#5ddc7e',
  },
  {
    id: 'jamming',
    th: 'แจม',
    en: 'Jamming',
    emoji: '🎸',
    desc: 'ไม่มีจับเวลา · สบายใจ',
    href: '/jamming',
    bgFrom: '#5ddc7e',
    bgTo: '#ffd23f',
  },
  {
    id: 'gig',
    th: 'คอนเสิร์ต',
    en: 'Gig',
    emoji: '🪩',
    desc: '100 ข้อ · 5 นาที',
    href: '/gig',
    bgFrom: '#ffd23f',
    bgTo: '#ff9a3c',
  },
  {
    id: 'festival',
    th: 'ดวลเพื่อน',
    en: 'Battle',
    emoji: '⚔️',
    desc: 'แข่งเรียลไทม์',
    href: '/lobby',
    bgFrom: '#ff5a6a',
    bgTo: '#9b6dff',
  },
];

/** How many coins/XP this run earned. */
export function modeReward(mode: GameMode, correct: number): { coins: number; xp: number } {
  return {
    coins: correct * COIN_PER_CORRECT[mode],
    xp: correct * XP_PER_CORRECT_BY_MODE[mode],
  };
}
