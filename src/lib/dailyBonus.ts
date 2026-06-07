'use client';

const KEY_LAST = 'uplevelkids-daily-last';
const KEY_STREAK = 'uplevelkids-daily-streak';

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export interface DailyClaim {
  isFirstToday: boolean;
  streakDay: number;
  reward: number;
}

/**
 * Compute today's bonus state without claiming.
 * - streak resets if previous claim wasn't yesterday
 * - reward = 10 + (streak-1) * 5, capped at 60
 */
export function peekDaily(): DailyClaim {
  if (typeof window === 'undefined') return { isFirstToday: false, streakDay: 0, reward: 0 };
  const last = localStorage.getItem(KEY_LAST);
  const today = todayKey();
  if (last === today) return { isFirstToday: false, streakDay: parseInt(localStorage.getItem(KEY_STREAK) || '0', 10), reward: 0 };

  // Decide streak
  let streak = parseInt(localStorage.getItem(KEY_STREAK) || '0', 10);
  if (last) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;
    streak = last === yKey ? streak + 1 : 1;
  } else {
    streak = 1;
  }
  const reward = Math.min(60, 10 + (streak - 1) * 5);
  return { isFirstToday: true, streakDay: streak, reward };
}

/** Commit today's claim — must be called after granting coins. */
export function commitDaily(streak: number) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY_LAST, todayKey());
  localStorage.setItem(KEY_STREAK, String(streak));
}
