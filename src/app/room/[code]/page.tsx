'use client';

import { useEffect, useState, useCallback, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
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

  // local play state
  const [problemIdx, setProblemIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);

  // Subscribe to room
  useEffect(() => {
    if (!playerId) return;
    const unsub = onSnapshot(
      roomDoc(code),
      (snap) => {
        if (!snap.exists()) {
          setError('ห้องไม่พบ');
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

  // Init timer when status flips to playing
  useEffect(() => {
    if (room?.status === 'playing' && timeLeft === 0 && !finished) {
      setTimeLeft(room.settings.durationSec);
    }
  }, [room?.status, room?.settings.durationSec, timeLeft, finished]);

  // Countdown
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

  // Detect both finished → mark room finished (host writes)
  useEffect(() => {
    if (!room || !isHost) return;
    if (room.status !== 'playing') return;
    const ps = Object.values(room.players);
    if (ps.length === 2 && ps.every((p) => p.finishedAt !== null)) {
      setRoomFinished(code).catch(() => {});
    }
  }, [room, isHost, code]);

  // Push progress to firestore on change (throttle: only on correct/incorrect change)
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
        return n;
      });
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
    }
    setTimeout(() => setFeedback(null), 400);
  }, [currentProblem, userAnswer, finished, room, code, playerId]);

  const handleInput = useCallback((v: string) => {
    setUserAnswer((p) => (p.length >= 6 ? p : p + v));
  }, []);
  const handleDelete = useCallback(() => setUserAnswer((p) => p.slice(0, -1)), []);

  // keyboard
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
      <main className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </main>
    );
  }

  if (error || !room) {
    return (
      <main className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white p-6 gap-4">
        <p className="text-lg font-black uppercase italic text-red-400">{error || 'ห้องไม่พบ'}</p>
        <Link href="/lobby" className="px-6 py-3 bg-white text-slate-950 rounded-2xl font-black uppercase text-sm">Back to Lobby</Link>
      </main>
    );
  }

  if (!inRoom) {
    return (
      <main className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white p-6 gap-4">
        <p className="text-lg font-black uppercase italic">คุณไม่อยู่ในห้องนี้</p>
        <Link href={`/lobby`} className="px-6 py-3 bg-white text-slate-950 rounded-2xl font-black uppercase text-sm">Go to Lobby</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 font-['Plus_Jakarta_Sans'] p-4">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.08),transparent_80%)]" />
      </div>

      <div className="w-full max-w-[500px] mx-auto relative z-10 space-y-5 pt-4 pb-12">
        <header className="flex items-center justify-between">
          <button onClick={handleLeave} className="p-3 bg-slate-900/80 border border-white/10 rounded-2xl text-slate-400 hover:text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Room</span>
            <span className="text-xl font-black text-white tracking-[0.2em]">{code}</span>
            <button onClick={copyCode} className="ml-1 text-slate-500 hover:text-white">
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Waiting room */}
        {room.status === 'waiting' && (
          <div className="space-y-5">
            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 text-center space-y-3">
              <Users className="w-12 h-12 text-purple-400 mx-auto" />
              <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">Waiting Room</h1>
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em]">
                {players.length}/2 players · {room.problems.length} problems · {formatTime(room.settings.durationSec)}
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
                      'p-5 rounded-3xl border-2 transition-all min-h-[120px] flex flex-col items-center justify-center text-center',
                      p
                        ? slotData?.ready
                          ? 'bg-green-500/10 border-green-500/40'
                          : 'bg-slate-900/60 border-white/10'
                        : 'bg-slate-900/30 border-dashed border-white/10'
                    )}
                  >
                    {p ? (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          {isHostSlot && <Crown className="w-4 h-4 text-yellow-400" />}
                          <p className="text-sm font-black uppercase tracking-tight text-white">{slotData?.name}</p>
                        </div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                          {isMe ? 'YOU' : 'OPPONENT'}
                        </p>
                        <p className={cn('text-[10px] font-black uppercase tracking-widest', slotData?.ready ? 'text-green-400' : 'text-slate-600')}>
                          {slotData?.ready ? 'READY ✓' : 'NOT READY'}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Empty Slot</p>
                        <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">รอผู้เล่น...</p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {me && (
              <button
                onClick={() => setReady(code, playerId, !me[1].ready)}
                className={cn(
                  'w-full py-4 rounded-2xl text-lg font-black uppercase italic tracking-widest transition-all',
                  me[1].ready
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-purple-500 text-white shadow-[0_6px_0_rgb(126,34,206)] active:shadow-none active:translate-y-[6px]'
                )}
              >
                {me[1].ready ? 'CANCEL READY' : 'READY ✓'}
              </button>
            )}

            {isHost && (
              <button
                onClick={() => allReady && startRoom(code)}
                disabled={!allReady}
                className={cn(
                  'w-full py-4 rounded-2xl text-lg font-black uppercase italic tracking-widest transition-all flex items-center justify-center gap-3',
                  allReady
                    ? 'bg-white text-slate-950 shadow-[0_6px_0_rgb(226,232,240)] active:shadow-none active:translate-y-[6px]'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                )}
              >
                <Swords className="w-5 h-5" />
                {allReady ? 'START BATTLE' : players.length < 2 ? 'รอผู้เล่นที่ 2' : 'รอทุกคน Ready'}
              </button>
            )}

            <div className="text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Share Code</p>
              <button onClick={copyCode} className="text-4xl font-black text-purple-400 tracking-[0.3em] hover:text-white transition-colors">
                {code}
              </button>
            </div>
          </div>
        )}

        {/* Playing */}
        {room.status === 'playing' && !finished && (
          <div className="space-y-4">
            {/* Opponent + my live scoreboard */}
            <div className="grid grid-cols-2 gap-3">
              {[me, opponent].map((p, idx) => {
                if (!p) return <div key={idx} />;
                const [, data] = p;
                const isMe = idx === 0;
                return (
                  <div
                    key={idx}
                    className={cn(
                      'p-3 rounded-2xl border-2',
                      isMe ? 'bg-purple-500/15 border-purple-500/40' : 'bg-cyan-500/10 border-cyan-500/30'
                    )}
                  >
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      {isMe ? 'YOU' : data?.name || 'OPPONENT'}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className={cn('text-2xl font-black tabular-nums', isMe ? 'text-purple-300' : 'text-cyan-300')}>
                        {data?.correct ?? 0}
                      </span>
                      <span className="text-[10px] font-black text-slate-500">/ {room.problems.length}</span>
                    </div>
                    {data?.finishedAt && <p className="text-[9px] font-black text-green-400 uppercase mt-1">FINISHED ✓</p>}
                  </div>
                );
              })}
            </div>

            {/* Timer + streak */}
            <div className="flex justify-between items-center bg-slate-900/40 border border-white/10 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Timer className={cn('w-4 h-4', timeLeft < 10 ? 'text-red-400' : 'text-cyan-400')} />
                <span className={cn('text-lg font-black tabular-nums', timeLeft < 10 ? 'text-red-400' : 'text-white')}>{formatTime(timeLeft)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className={cn('w-4 h-4', streak > 0 ? 'text-orange-400' : 'text-slate-600')} />
                <span className={cn('text-lg font-black italic', streak > 0 ? 'text-orange-400' : 'text-slate-600')}>x{streak}</span>
              </div>
            </div>

            {/* Problem */}
            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 flex flex-col items-center gap-5">
              <motion.div
                key={currentProblem?.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl font-black text-white tracking-tighter h-16 flex items-center"
              >
                {currentProblem?.question}
              </motion.div>

              <div
                className={cn(
                  'w-full bg-slate-950/80 border-[4px] rounded-3xl py-5 text-5xl font-black text-center transition-all min-h-[5rem] flex items-center justify-center',
                  feedback === 'correct' ? 'border-green-400 text-green-400' :
                  feedback === 'incorrect' ? 'border-red-500 text-red-500 animate-shake' :
                  'border-slate-800 text-white'
                )}
              >
                {userAnswer || <span className="text-slate-700">?</span>}
              </div>

              <Numpad onInput={handleInput} onDelete={handleDelete} onSubmit={submit} />

              {nextProblem && (
                <div className="flex items-center justify-center gap-3 opacity-50">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Next</span>
                  <span className="text-xl font-black text-slate-400">{nextProblem.question}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Finished (mine or both) */}
        {(finished || room.status === 'finished') && (
          <div className="space-y-5">
            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 text-center">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-3 animate-bounce" />
              <h2 className="text-3xl font-black uppercase italic text-white">
                {room.status === 'finished' ? 'BATTLE OVER' : 'WAITING OPPONENT'}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[me, opponent].map((p, idx) => {
                if (!p) return <div key={idx} />;
                const [, data] = p;
                const isMe = idx === 0;
                const myScore = me?.[1].correct ?? 0;
                const oppScore = opponent?.[1].correct ?? 0;
                const isWinner = room.status === 'finished' && (
                  (isMe && myScore > oppScore) || (!isMe && oppScore > myScore)
                );
                const isTie = room.status === 'finished' && myScore === oppScore;
                return (
                  <div
                    key={idx}
                    className={cn(
                      'p-5 rounded-3xl border-2 text-center',
                      isWinner ? 'bg-yellow-500/15 border-yellow-500/50' :
                      isMe ? 'bg-purple-500/10 border-purple-500/30' :
                      'bg-cyan-500/10 border-cyan-500/30'
                    )}
                  >
                    {isWinner && <Crown className="w-6 h-6 text-yellow-400 mx-auto mb-2" />}
                    {isTie && <p className="text-[9px] font-black text-yellow-400 uppercase mb-2">TIE</p>}
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      {isMe ? 'YOU' : data?.name}
                    </p>
                    <p className="text-4xl font-black text-white tabular-nums">{data?.correct ?? 0}</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">
                      Wrong {data?.incorrect ?? 0} · Best Streak {data?.bestStreak ?? 0}
                    </p>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleLeave}
              className="w-full py-4 bg-white text-slate-950 rounded-2xl text-lg font-black uppercase italic tracking-widest shadow-[0_6px_0_rgb(226,232,240)] active:shadow-none active:translate-y-[6px]"
            >
              BACK TO LOBBY
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 2; }
      `}</style>
    </main>
  );
}
