'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onSnapshot } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { ChevronLeft, Copy, Check, Users, Swords, Crown, Loader2, Timer, Flame, Trophy } from 'lucide-react';
import { usePlayer } from '@/lib/usePlayer';
import {
  roomDoc,
  Room,
  setReady,
  startRoom,
  updateProgress,
  finishPlayer,
  setRoomFinished,
  leaveRoom,
} from '@/lib/rooms';
import { cn } from '@/lib/utils';
import Numpad from '@/components/Numpad';
import Mascot, { MascotMood } from '@/components/Mascot';
import Confetti from '@/components/Confetti';
import { playCorrect, playWrong, playStreak, playLevelUp } from '@/lib/sounds';

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const { playerId, playerName } = usePlayer();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const [problemIdx, setProblemIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const [mood, setMood] = useState<MascotMood>('happy');
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  useEffect(() => {
    if (!playerId) return;
    const unsub = onSnapshot(
      roomDoc(code),
      (snap) => {
        if (!snap.exists()) {
          setError('ไม่เจอห้องนี้');
          setLoading(false);
          return;
        }
        setRoom(snap.data() as Room);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [code, playerId]);

  const inRoom = !!(room && playerId && room.players[playerId]);
  const isHost = !!(room && playerId && room.hostId === playerId);
  const players = room ? Object.entries(room.players) : [];
  const opponent = players.find(([id]) => id !== playerId);
  const me = players.find(([id]) => id === playerId);
  const allReady = players.length === 2 && players.every(([, p]) => p.ready);

  useEffect(() => {
    if (room?.status === 'playing' && timeLeft === 0 && !finished) {
      setTimeLeft(room.settings.durationSec);
    }
  }, [room?.status, room?.settings.durationSec, timeLeft, finished]);

  useEffect(() => {
    if (room?.status !== 'playing' || finished) return;
    if (timeLeft <= 0) {
      setFinished(true);
      finishPlayer(code, playerId).catch(() => {});
      return;
    }
    const t = setInterval(() => setTimeLeft((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [room?.status, timeLeft, finished, code, playerId]);

  useEffect(() => {
    if (!room || !isHost) return;
    if (room.status !== 'playing') return;
    const ps = Object.values(room.players);
    if (ps.length === 2 && ps.every((p) => p.finishedAt !== null)) {
      setRoomFinished(code).catch(() => {});
    }
  }, [room, isHost, code]);

  const progressKey = `${correct}-${incorrect}-${bestStreak}`;
  useEffect(() => {
    if (!inRoom || room?.status !== 'playing' || finished) return;
    updateProgress(code, playerId, correct, incorrect, bestStreak).catch(() => {});
  }, [progressKey, code, playerId, inRoom, room?.status, finished, correct, incorrect, bestStreak]);

  const currentProblem = room?.problems?.[problemIdx];
  const nextProblem = room?.problems?.[problemIdx + 1];

  const submit = useCallback(() => {
    if (!currentProblem || userAnswer === '' || finished) return;
    const isCorrect = parseInt(userAnswer) === currentProblem.answer;
    if (isCorrect) {
      setCorrect((c) => c + 1);
      setStreak((s) => {
        const n = s + 1;
        setBestStreak((b) => Math.max(b, n));
        if (n >= 3 && n % 5 === 0) {
          setConfettiTrigger((t) => t + 1);
          playLevelUp();
          setMood('cheer');
          setTimeout(() => setMood('happy'), 1000);
        } else {
          playStreak(n);
          setMood('cheer');
          setTimeout(() => setMood('happy'), 400);
        }
        return n;
      });
      playCorrect();
      setFeedback('correct');
      setUserAnswer('');
      setProblemIdx((i) => {
        const next = i + 1;
        if (room && next >= room.problems.length) {
          setFinished(true);
          finishPlayer(code, playerId).catch(() => {});
        }
        return next;
      });
    } else {
      setIncorrect((i) => i + 1);
      setStreak(0);
      setFeedback('incorrect');
      playWrong();
      setMood('sad');
      setTimeout(() => setMood('think'), 500);
    }
    setTimeout(() => setFeedback(null), 350);
  }, [currentProblem, userAnswer, finished, room, code, playerId]);

  const handleInput = useCallback((v: string) => {
    setUserAnswer((p) => (p.length >= 6 ? p : p + v));
  }, []);
  const handleDelete = useCallback(() => setUserAnswer((p) => p.slice(0, -1)), []);

  useEffect(() => {
    if (room?.status !== 'playing' || finished) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') { e.preventDefault(); handleInput(e.key); }
      else if (e.key === 'Backspace') { e.preventDefault(); handleDelete(); }
      else if (e.key === 'Enter') { e.preventDefault(); submit(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [room?.status, finished, handleInput, handleDelete, submit]);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleLeave = async () => {
    if (inRoom) await leaveRoom(code, playerId).catch(() => {});
    router.push('/lobby');
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#9b6dff]" />
      </main>
    );
  }

  if (error || !room) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 gap-4">
        <Mascot mood="sad" size={120} />
        <p className="font-display text-2xl text-[#2b1d57]">{error || 'ไม่เจอห้องนี้'}</p>
        <Link href="/lobby" className="kid-btn px-6 py-3 text-white" style={{ background: 'linear-gradient(160deg, #ff6fb5, #9b6dff)' }}>กลับไป Lobby</Link>
      </main>
    );
  }

  if (!inRoom) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 gap-4">
        <Mascot mood="think" size={120} />
        <p className="font-display text-2xl text-[#2b1d57]">หนูไม่ได้อยู่ในห้องนี้</p>
        <Link href="/lobby" className="kid-btn px-6 py-3 text-white" style={{ background: 'linear-gradient(160deg, #4cc9ff, #5ddc7e)' }}>กลับไป Lobby</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 pt-6 pb-12">
      <Confetti trigger={confettiTrigger} />
      <div className="w-full max-w-[520px] relative z-10 space-y-4">
        <header className="flex items-center justify-between">
          <button onClick={handleLeave} className="kid-btn bg-white px-4 py-3 text-[#9b6dff]">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 bg-white/90 rounded-full px-4 py-2 border-4 border-white shadow">
            <span className="text-xs font-bold text-[#2b1d57]/60">รหัส</span>
            <span className="font-display text-xl text-[#9b6dff] tracking-[0.2em]">{code}</span>
            <button onClick={copyCode} className="ml-1 text-[#2b1d57]/50 hover:text-[#9b6dff]">
              {copied ? <Check className="w-4 h-4 text-[#5ddc7e]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Waiting room */}
        {room.status === 'waiting' && (
          <div className="space-y-4">
            <div className="kid-card p-5 text-center">
              <Users className="w-10 h-10 text-[#9b6dff] mx-auto" />
              <h1 className="font-display text-2xl text-[#2b1d57] mt-2">ห้องรอ</h1>
              <p className="text-sm text-[#2b1d57]/60 mt-1">
                {players.length}/2 คน · {room.problems.length} ข้อ · {formatTime(room.settings.durationSec)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[0, 1].map((slot) => {
                const p = players[slot];
                const slotId = p?.[0];
                const slotData = p?.[1];
                const isMe = slotId === playerId;
                const isHostSlot = slotId === room.hostId;
                return (
                  <div
                    key={slot}
                    className={cn(
                      'rounded-3xl border-4 transition-all min-h-[140px] p-4 flex flex-col items-center justify-center text-center',
                      p
                        ? slotData?.ready
                          ? 'bg-[#5ddc7e]/20 border-[#5ddc7e]'
                          : 'bg-white border-white'
                        : 'bg-white/40 border-dashed border-white/80'
                    )}
                  >
                    {p ? (
                      <>
                        {isHostSlot && <Crown className="w-5 h-5 text-[#ffd23f] mb-1" />}
                        <p className="font-display text-base text-[#2b1d57]">{slotData?.name}</p>
                        <p className="text-[10px] font-bold text-[#2b1d57]/50 uppercase mt-1">
                          {isMe ? 'หนู' : 'คู่แข่ง'}
                        </p>
                        <p className={cn('text-xs font-bold uppercase mt-1', slotData?.ready ? 'text-[#5ddc7e]' : 'text-[#2b1d57]/40')}>
                          {slotData?.ready ? 'พร้อม ✓' : 'ยังไม่พร้อม'}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-3xl">⏳</p>
                        <p className="text-xs font-bold text-[#2b1d57]/40 mt-1">รอเพื่อน...</p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {me && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setReady(code, playerId, !me[1].ready)}
                className={cn(
                  'kid-btn w-full py-4 text-xl font-display',
                  me[1].ready ? 'bg-white text-[#2b1d57]/60' : 'text-white'
                )}
                style={!me[1].ready ? { background: 'linear-gradient(160deg, #5ddc7e, #4cc9ff)' } : undefined}
              >
                {me[1].ready ? 'ยกเลิก' : 'พร้อม ✓'}
              </motion.button>
            )}

            {isHost && (
              <motion.button
                whileTap={allReady ? { scale: 0.97 } : {}}
                onClick={() => allReady && startRoom(code)}
                disabled={!allReady}
                className={cn(
                  'kid-btn w-full py-4 text-xl font-display gap-3',
                  allReady ? 'text-white' : 'bg-white/60 text-[#2b1d57]/30 cursor-not-allowed'
                )}
                style={allReady ? { background: 'linear-gradient(160deg, #ff6fb5, #ff9a3c)' } : undefined}
              >
                <Swords className="w-6 h-6" />
                {allReady ? 'เริ่มดวล!' : players.length < 2 ? 'รอเพื่อน...' : 'รอทุกคนพร้อม'}
              </motion.button>
            )}

            <div className="text-center kid-card p-4">
              <p className="text-xs font-bold text-[#2b1d57]/60 mb-1">แชร์รหัสนี้ให้เพื่อน</p>
              <button onClick={copyCode} className="font-display text-4xl text-[#9b6dff] tracking-[0.3em]">
                {code}
              </button>
            </div>
          </div>
        )}

        {/* Playing */}
        {room.status === 'playing' && !finished && (
          <div className="space-y-3">
            {/* Live scoreboard */}
            <div className="grid grid-cols-2 gap-3">
              {[me, opponent].map((p, idx) => {
                if (!p) return <div key={idx} />;
                const [, data] = p;
                const isMe = idx === 0;
                return (
                  <div
                    key={idx}
                    className={cn(
                      'p-3 rounded-3xl border-4',
                      isMe ? 'bg-[#9b6dff]/15 border-[#9b6dff]' : 'bg-[#4cc9ff]/15 border-[#4cc9ff]'
                    )}
                  >
                    <p className="text-xs font-bold text-[#2b1d57]/60">
                      {isMe ? 'หนู' : data?.name || 'คู่แข่ง'}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className={cn('font-display text-3xl tabular-nums', isMe ? 'text-[#9b6dff]' : 'text-[#4cc9ff]')}>
                        {data?.correct ?? 0}
                      </span>
                      <span className="text-xs text-[#2b1d57]/40">/ {room.problems.length}</span>
                    </div>
                    {data?.finishedAt && <p className="text-[10px] font-bold text-[#5ddc7e] uppercase mt-1">เสร็จแล้ว ✓</p>}
                  </div>
                );
              })}
            </div>

            {/* Timer + streak */}
            <div className="flex justify-between items-center bg-white/80 rounded-full px-4 py-2 border-4 border-white">
              <div className="flex items-center gap-2">
                <Timer className={cn('w-5 h-5', timeLeft < 10 ? 'text-[#ff5a6a]' : 'text-[#4cc9ff]')} />
                <span className={cn('font-display text-lg tabular-nums', timeLeft < 10 ? 'text-[#ff5a6a] kid-shake' : 'text-[#2b1d57]')}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className={cn('w-5 h-5', streak > 0 ? 'text-[#ff9a3c]' : 'text-[#2b1d57]/30')} />
                <span className={cn('font-display text-lg', streak > 0 ? 'text-[#ff9a3c]' : 'text-[#2b1d57]/40')}>x{streak}</span>
              </div>
            </div>

            {/* Problem */}
            <div className="kid-card p-5 flex flex-col items-center gap-4">
              <Mascot mood={mood} size={80} />
              <div className="flex flex-col items-center">
                <motion.div
                  key={currentProblem?.id}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-display text-6xl text-[#2b1d57] tabular-nums tracking-tight"
                >
                  {currentProblem?.question}
                </motion.div>
                {nextProblem && (
                  <div className="font-display text-base text-[#2b1d57]/25 tabular-nums mt-1">
                    ถัดไป · {nextProblem.question}
                  </div>
                )}
              </div>

              <div
                className={cn(
                  'w-full bg-white border-4 rounded-3xl py-5 text-5xl font-display text-center min-h-[5rem] flex items-center justify-center',
                  feedback === 'correct' ? 'border-[#5ddc7e] text-[#5ddc7e] kid-pop' :
                  feedback === 'incorrect' ? 'border-[#ff5a6a] text-[#ff5a6a] kid-shake' :
                  'border-[#9b6dff]/30 text-[#2b1d57]'
                )}
              >
                {userAnswer || <span className="text-[#2b1d57]/20">?</span>}
              </div>

              <Numpad onInput={handleInput} onDelete={handleDelete} onSubmit={submit} />
            </div>
          </div>
        )}

        {/* Finished */}
        {(finished || room.status === 'finished') && (
          <div className="space-y-4">
            <div className="kid-card p-5 text-center">
              <Mascot mood="cheer" size={110} />
              <Trophy className="w-12 h-12 text-[#ffd23f] mx-auto mt-2 kid-bounce" />
              <h2 className="font-display text-3xl text-[#2b1d57] mt-2">
                {room.status === 'finished' ? 'จบดวล!' : 'รอคู่แข่ง...'}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[me, opponent].map((p, idx) => {
                if (!p) return <div key={idx} />;
                const [, data] = p;
                const isMe = idx === 0;
                const myScore = me?.[1].correct ?? 0;
                const oppScore = opponent?.[1].correct ?? 0;
                const isWinner = room.status === 'finished' && ((isMe && myScore > oppScore) || (!isMe && oppScore > myScore));
                const isTie = room.status === 'finished' && myScore === oppScore;
                return (
                  <div
                    key={idx}
                    className={cn(
                      'p-4 rounded-3xl border-4 text-center',
                      isWinner ? 'bg-[#ffd23f]/20 border-[#ffd23f]' :
                      isMe ? 'bg-[#9b6dff]/15 border-[#9b6dff]' :
                      'bg-[#4cc9ff]/15 border-[#4cc9ff]'
                    )}
                  >
                    {isWinner && <Crown className="w-7 h-7 text-[#ffd23f] mx-auto mb-1" />}
                    {isTie && <p className="text-xs font-bold text-[#ff9a3c] uppercase mb-1">เสมอ</p>}
                    <p className="text-xs font-bold text-[#2b1d57]/60">
                      {isMe ? 'หนู' : data?.name}
                    </p>
                    <p className="font-display text-4xl text-[#2b1d57] tabular-nums">{data?.correct ?? 0}</p>
                    <p className="text-[10px] font-bold text-[#2b1d57]/60 mt-1">
                      ผิด {data?.incorrect ?? 0} · ติดสุด {data?.bestStreak ?? 0}
                    </p>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleLeave}
              className="kid-btn w-full py-4 text-xl font-display text-white gap-3"
              style={{ background: 'linear-gradient(160deg, #4cc9ff, #5ddc7e)' }}
            >
              กลับ Lobby
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
