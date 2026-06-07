'use client';

const KEY = 'uplevelkids-soundcheck-last';

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export interface SoundcheckResult {
  date: string;
  correct: number;
  total: number;
  avgSec: number;
  godCount: number;
  tier: string;
}

export function getTodaySoundcheck(): SoundcheckResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const r: SoundcheckResult | null = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (r && r.date === todayKey()) return r;
    return null;
  } catch {
    return null;
  }
}

export function isSoundcheckAvailable(): boolean {
  return getTodaySoundcheck() === null;
}

export function saveSoundcheck(result: Omit<SoundcheckResult, 'date'>) {
  if (typeof window === 'undefined') return;
  const r: SoundcheckResult = { date: todayKey(), ...result };
  localStorage.setItem(KEY, JSON.stringify(r));
}
