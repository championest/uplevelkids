'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ChevronLeft, Trophy, Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGame } from '@/lib/GameContext';
import { usePlayer } from '@/lib/usePlayer';
import { subscribeTop, LeaderboardDoc } from '@/lib/leaderboard';
import Mascot from '@/components/Mascot';

interface Entry {
  id: string;
  name: string;
  level: number;
  xp: number;
  emoji: string;
}

const MOCK_LEADERBOARD: Entry[] = [
  { id: 'mock-1', name: 'นัตตี้', level: 42, xp: 21000, emoji: '🐱' },
  { id: 'mock-2', name: 'บีมบ้าพลัง', level: 38, xp: 19000, emoji: '🚀' },
  { id: 'mock-3', name: 'พริ้ม', level: 35, xp: 17500, emoji: '🌸' },
  { id: 'mock-4', name: 'ก๊อต', level: 31, xp: 15500, emoji: '⚡' },
  { id: 'mock-5', name: 'ลูกตาล', level: 28, xp: 14000, emoji: '🍯' },
  { id: 'mock-6', name: 'จิงเกิ้ลเบลล์', level: 25, xp: 12500, emoji: '🎄' },
  { id: 'mock-7', name: 'น้องหมีพู', level: 22, xp: 11000, emoji: '🐻' },
];

const PODIUM_COLORS = ['#ffd23f', '#cbd5e1', '#ff9a3c'];

export default function LeaderboardPage() {
  const { state } = useGame();
  const { data: session } = useSession();
  const { playerId, playerName } = usePlayer();
  const myId = session?.user?.email || playerId;

  const [live, setLive] = useState<LeaderboardDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    const unsub = subscribeTop(
      20,
      (rows) => {
        setLive(rows);
        setLoading(false);
      },
      (e) => {
        setErr(e.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // Merge live with mock if too few live entries
  const liveEntries: Entry[] = live.map((r) => ({
    id: r.id,
    name: r.name,
    level: r.level,
    xp: r.xp,
    emoji: r.emoji,
  }));
  const useMock = liveEntries.length < 3;
  const combined: Entry[] = useMock
    ? [...liveEntries, ...MOCK_LEADERBOARD].slice(0, 20)
    : liveEntries;
  combined.sort((a, b) => b.xp - a.xp);

  // Find my rank
  const myRankIdx = combined.findIndex((e) => e.id === myId);
  const myRank = myRankIdx >= 0 ? myRankIdx + 1 : combined.length + 1;

  const top3 = combined.slice(0, 3);
  const rest = combined.slice(3);

  return (
    <main className="min-h-screen flex flex-col items-center px-4 pt-6 pb-40">
      <div className="w-full max-w-[520px] relative z-10 space-y-5">
        <header className="flex justify-between items-center">
          <Link href="/" className="kid-btn bg-white px-4 py-3 text-[#9b6dff]">
            <ChevronLeft className="w-6 h-6" />
            <span className="font-display text-base">กลับ</span>
          </Link>
          <div className="text-right">
            <p className="font-display text-base text-[#2b1d57]">ตารางเทพ</p>
            <p className="text-xs text-[#2b1d57]/60">{useMock ? 'รวมเดโม' : 'Live'}</p>
          </div>
        </header>

        <div className="kid-card p-4 flex items-center gap-3">
          <Mascot mood="cheer" size={70} />
          <div className="flex-1">
            <p className="font-display text-xl text-[#2b1d57] leading-tight">เก็บ XP ไต่อันดับ!</p>
            <p className="text-xs text-[#2b1d57]/60">{loading ? 'กำลังโหลด...' : err ? 'ออฟไลน์ — แสดงเดโม' : 'อัพเดตทุก ๆ คนเล่น'}</p>
          </div>
        </div>

        {/* Top 3 podiums */}
        {top3.length === 3 && (
          <section className="kid-card p-5">
            <div className="flex items-end justify-center gap-3">
              <PodiumEntry rank={2} entry={top3[1]} color={PODIUM_COLORS[1]} heightPct={70} isMe={top3[1].id === myId} />
              <PodiumEntry rank={1} entry={top3[0]} color={PODIUM_COLORS[0]} heightPct={100} isCrown isMe={top3[0].id === myId} />
              <PodiumEntry rank={3} entry={top3[2]} color={PODIUM_COLORS[2]} heightPct={55} isMe={top3[2].id === myId} />
            </div>
          </section>
        )}

        {/* List */}
        <section className="space-y-2">
          {rest.map((player, idx) => {
            const isMe = player.id === myId;
            return (
              <div
                key={player.id}
                className={cn(
                  'kid-card p-3 flex items-center gap-3 transition-all',
                  isMe && 'border-[#ff6fb5] bg-[#ffd6f5]/60 shadow-[0_8px_0_rgba(255,111,181,0.35)]'
                )}
              >
                <span className="font-display text-base text-[#2b1d57]/40 w-6 text-center">{idx + 4}</span>
                <div className="w-11 h-11 bg-gradient-to-br from-[#ffd6f5] to-[#a5e8ff] rounded-2xl flex items-center justify-center text-2xl border-2 border-white">
                  {player.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-base text-[#2b1d57] truncate">
                    {player.name} {isMe && <span className="text-[10px] font-bold text-[#ff6fb5]">· หนู</span>}
                  </p>
                  <p className="text-[10px] font-bold text-[#9b6dff]">Lv {player.level}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-[#ffd23f] text-[#ffd23f]" />
                  <span className="font-display text-sm text-[#2b1d57] tabular-nums">{player.xp.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </section>
      </div>

      {/* Sticky "you" bar */}
      {myRankIdx < 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 z-20">
          <div
            className="rounded-[2rem] p-4 border-4 border-white shadow-[0_8px_0_rgba(155,109,255,0.4)] flex items-center justify-between"
            style={{ background: 'linear-gradient(160deg, #9b6dff, #ff6fb5)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/30 rounded-2xl flex items-center justify-center font-display text-white text-sm">
                #{myRank}
              </div>
              <div>
                <p className="font-display text-base text-white leading-tight">
                  {session?.user?.name || playerName || 'น้องเกสต์'}
                </p>
                <p className="text-[10px] font-bold text-white/80">Lv {state.level} · {state.xp.toLocaleString()} XP</p>
              </div>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 bg-white/25 rounded-full">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-xs font-bold text-white">น้องใหม่</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function PodiumEntry({
  rank,
  entry,
  color,
  heightPct,
  isCrown,
  isMe,
}: {
  rank: number;
  entry: Entry;
  color: string;
  heightPct: number;
  isCrown?: boolean;
  isMe?: boolean;
}) {
  return (
    <div className={cn('flex flex-col items-center gap-2', isCrown && '-translate-y-3')}>
      <div
        className={cn(
          'rounded-2xl flex items-center justify-center text-3xl border-4 shadow-lg relative',
          isCrown ? 'w-20 h-20' : 'w-16 h-16',
          isMe ? 'border-[#ff6fb5]' : 'border-white'
        )}
        style={{ background: `linear-gradient(160deg, #fff4b8, ${color})` }}
      >
        {entry.emoji}
        <div
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center font-display text-sm text-white border-2 border-white"
          style={{ background: color }}
        >
          {rank}
        </div>
        {isCrown && <Trophy className="absolute -top-7 w-7 h-7 text-[#ffd23f] kid-bounce" />}
      </div>
      <p className="font-display text-xs text-[#2b1d57] truncate max-w-[80px] text-center">
        {entry.name}{isMe && ' (หนู)'}
      </p>
      <div
        className="w-16 rounded-t-2xl border-x-4 border-t-4 border-white"
        style={{
          background: `linear-gradient(180deg, ${color}, transparent)`,
          height: `${heightPct}px`,
        }}
      />
    </div>
  );
}
