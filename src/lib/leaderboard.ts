'use client';

import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';

const COL = 'leaderboard';

export interface LeaderboardDoc {
  id: string;
  name: string;
  emoji: string;
  level: number;
  xp: number;
  totalSolved: number;
  updatedAt?: unknown;
}

/** Upsert current player's score. Throttled by caller. */
export async function upsertScore(input: Omit<LeaderboardDoc, 'updatedAt'>) {
  if (!input.id) return;
  const ref = doc(db, COL, input.id);
  await setDoc(
    ref,
    {
      name: (input.name || 'น้องเกสต์').slice(0, 24),
      emoji: input.emoji || '🌟',
      level: input.level,
      xp: input.xp,
      totalSolved: input.totalSolved,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/** Subscribe to top N by XP. Returns unsubscribe. */
export function subscribeTop(
  topN: number,
  cb: (entries: LeaderboardDoc[]) => void,
  onError?: (e: Error) => void
) {
  const q = query(collection(db, COL), orderBy('xp', 'desc'), limit(topN));
  return onSnapshot(
    q,
    (snap) => {
      const list: LeaderboardDoc[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<LeaderboardDoc, 'id'>) }));
      cb(list);
    },
    (err) => onError?.(err)
  );
}

/** One-shot fetch (fallback if subscribe fails). */
export async function fetchTop(topN: number): Promise<LeaderboardDoc[]> {
  const q = query(collection(db, COL), orderBy('xp', 'desc'), limit(topN));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<LeaderboardDoc, 'id'>) }));
}
