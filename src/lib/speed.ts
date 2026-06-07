'use client';

export type SpeedTier = 'god' | 'fast' | 'ok' | 'slow';

export interface SpeedRating {
  tier: SpeedTier;
  label: string;
  emoji: string;
  color: string;
  ms: number;
}

/** TTRS-style speed rating for one answer. */
export function rateSpeed(ms: number): SpeedRating {
  if (ms <= 3000) return { tier: 'god', label: 'เทพ', emoji: '⚡', color: '#ffd23f', ms };
  if (ms <= 5000) return { tier: 'fast', label: 'เร็ว!', emoji: '🔥', color: '#ff6fb5', ms };
  if (ms <= 8000) return { tier: 'ok', label: 'โอเค', emoji: '👍', color: '#5ddc7e', ms };
  return { tier: 'slow', label: 'ลองอีก', emoji: '🐢', color: '#9b6dff', ms };
}

// --- Rock-star status tiers (averaged answer time) ---

export interface StatusTier {
  id: string;
  name: string;
  emoji: string;
  color: string;
  /** Max average seconds */
  maxSec: number;
}

// 12-tier ladder matching TTRS Rock Status thresholds (avg seconds/question).
// Top → bottom. Names are Thai-rocker hybrid for kid resonance.
export const STATUS_TIERS: StatusTier[] = [
  { id: 'rockhero',   name: 'ร็อคฮีโร่',     emoji: '🔥', color: '#ff3b6b', maxSec: 1 },
  { id: 'rocklegend', name: 'ร็อคเลเจนด์',   emoji: '👑', color: '#ffd23f', maxSec: 2 },
  { id: 'rockstar',   name: 'ร็อคสตาร์',     emoji: '🌟', color: '#ff6fb5', maxSec: 3 },
  { id: 'headliner',  name: 'เฮดไลเนอร์',    emoji: '🎤', color: '#9b6dff', maxSec: 4 },
  { id: 'support',    name: 'นักร้องเปิด',    emoji: '🎸', color: '#4cc9ff', maxSec: 5 },
  { id: 'breakout',   name: 'หน้าใหม่มาแรง', emoji: '✨', color: '#5ddc7e', maxSec: 6 },
  { id: 'unsigned',   name: 'ศิลปินอินดี้',   emoji: '🎶', color: '#7cd1ff', maxSec: 7 },
  { id: 'gigger',     name: 'มือไมโครโฟน',   emoji: '🪩', color: '#ff9a3c', maxSec: 8 },
  { id: 'busker',     name: 'มือกีตาร์ข้างถนน', emoji: '🎵', color: '#ffb37a', maxSec: 9 },
  { id: 'garage',     name: 'วงโรงรถ',       emoji: '🥁', color: '#caf7d6', maxSec: 10 },
  { id: 'wannabe',    name: 'มือใหม่หัดเล่น', emoji: '🎹', color: '#d5c9ff', maxSec: 20 },
  { id: 'newbie',     name: 'น้องใหม่ลองดู', emoji: '🐣', color: '#ffd6f5', maxSec: Infinity },
];

export function statusForAvgSec(avgSec: number): StatusTier {
  for (const t of STATUS_TIERS) {
    if (avgSec <= t.maxSec) return t;
  }
  return STATUS_TIERS[STATUS_TIERS.length - 1];
}

// --- Weakness heatmap (per math fact) ---

interface FactRecord {
  attempts: number;
  correct: number;
  totalMs: number;
  lastSeen: number;
}

const KEY = 'uplevelkids-weakness';

/** Composite key for a math fact. e.g. "mul:7x8" / "add:14+5" / "div:56÷7" */
export function factKey(operation: string, a: number, b: number): string {
  return `${operation}:${a}|${b}`;
}

function load(): Record<string, FactRecord> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

function save(map: Record<string, FactRecord>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function recordFact(operation: string, a: number, b: number, isCorrect: boolean, ms: number) {
  const k = factKey(operation, a, b);
  const map = load();
  const r = map[k] || { attempts: 0, correct: 0, totalMs: 0, lastSeen: 0 };
  r.attempts++;
  if (isCorrect) r.correct++;
  r.totalMs += ms;
  r.lastSeen = Date.now();
  map[k] = r;
  save(map);
}

export function getAllFacts(): Record<string, FactRecord> {
  return load();
}

export interface WeakFact {
  operation: string;
  a: number;
  b: number;
  score: number; // higher = weaker
  attempts: number;
  accuracy: number;
  avgMs: number;
}

/**
 * Rank facts by weakness: low accuracy AND slow.
 * Score = (1 - accuracy) * 60 + min(avgSec, 15)
 * Only includes facts with ≥2 attempts.
 */
export function getWeakest(operation?: string, limit = 10): WeakFact[] {
  const map = load();
  const out: WeakFact[] = [];
  for (const [k, r] of Object.entries(map)) {
    const [op, ab] = k.split(':');
    if (operation && op !== operation) continue;
    if (r.attempts < 2) continue;
    const [aStr, bStr] = ab.split('|');
    const a = parseInt(aStr, 10);
    const b = parseInt(bStr, 10);
    const accuracy = r.correct / r.attempts;
    const avgMs = r.totalMs / r.attempts;
    const score = (1 - accuracy) * 60 + Math.min(avgMs / 1000, 15);
    out.push({ operation: op, a, b, score, attempts: r.attempts, accuracy, avgMs });
  }
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, limit);
}

// --- Session summary ---

const SESSION_KEY = 'uplevelkids-speed-session';

export interface SpeedSession {
  totalAnswers: number;
  totalMs: number;
  tierCounts: Record<SpeedTier, number>;
}

const EMPTY: SpeedSession = { totalAnswers: 0, totalMs: 0, tierCounts: { god: 0, fast: 0, ok: 0, slow: 0 } };

export function loadSession(): SpeedSession {
  if (typeof window === 'undefined') return EMPTY;
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || JSON.stringify(EMPTY));
  } catch {
    return EMPTY;
  }
}

export function recordSpeed(rating: SpeedRating) {
  if (typeof window === 'undefined') return;
  const s = loadSession();
  s.totalAnswers++;
  s.totalMs += rating.ms;
  s.tierCounts[rating.tier]++;
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

export function avgSecondsFromSession(): number {
  const s = loadSession();
  if (s.totalAnswers === 0) return 999;
  return s.totalMs / s.totalAnswers / 1000;
}
