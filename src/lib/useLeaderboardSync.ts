'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useGame } from './GameContext';
import { usePlayer } from './usePlayer';
import { upsertScore } from './leaderboard';

const EMOJI_POOL = ['🌟', '🐱', '🐶', '🐻', '🦊', '🐰', '🦄', '🐯', '🐸', '🦁', '🐼', '🐨', '🐹', '🐧', '🦉'];

function pickEmoji(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return EMOJI_POOL[Math.abs(h) % EMOJI_POOL.length];
}

/**
 * Push current player score to Firestore leaderboard whenever XP/level changes.
 * Throttled internally — only writes when something meaningful changed.
 */
export function useLeaderboardSync() {
  const { state } = useGame();
  const { data: session } = useSession();
  const { playerId, playerName } = usePlayer();
  const lastWriteRef = useRef<{ xp: number; level: number; totalSolved: number } | null>(null);

  useEffect(() => {
    if (!playerId) return;
    const last = lastWriteRef.current;
    const changed =
      !last ||
      last.xp !== state.xp ||
      last.level !== state.level ||
      last.totalSolved !== state.totalSolved;
    if (!changed) return;
    // Don't spam when guest at 0
    if (state.xp === 0 && !session?.user?.name) return;

    const id = session?.user?.email || playerId;
    const name = session?.user?.name || playerName || 'น้องเกสต์';
    const emoji = pickEmoji(id);

    upsertScore({
      id,
      name,
      emoji,
      level: state.level,
      xp: state.xp,
      totalSolved: state.totalSolved,
    }).catch(() => {});
    lastWriteRef.current = { xp: state.xp, level: state.level, totalSolved: state.totalSolved };
  }, [state.xp, state.level, state.totalSolved, playerId, playerName, session]);
}
