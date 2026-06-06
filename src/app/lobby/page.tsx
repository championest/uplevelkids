'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Plus, LogIn, Users, Swords, Loader2 } from 'lucide-react';
import { usePlayer } from '@/lib/usePlayer';
import { createRoom, joinRoom, RoomSettings } from '@/lib/rooms';
import { Operation, DifficultyLevel } from '@/lib/math';
import { cn } from '@/lib/utils';

const TABLE_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function LobbyPage() {
  const router = useRouter();
  const { playerId, playerName, setPlayerName } = usePlayer();
  const [mode, setMode] = useState<'idle' | 'create' | 'join'>('idle');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Create settings
  const [op, setOp] = useState<Operation>('addition');
  const [diff, setDiff] = useState<DifficultyLevel>('1-digit');
  const [tables, setTables] = useState<number[]>([2, 3, 4, 5]);
  const [durationSec, setDurationSec] = useState(60);
  const [problemCount, setProblemCount] = useState(20);

  // Join
  const [joinCode, setJoinCode] = useState('');

  const isMulDiv = op === 'multiplication' || op === 'division';

  const ensureName = (): string | null => {
    const n = playerName.trim();
    if (!n) {
      setError('ใส่ชื่อก่อน');
      return null;
    }
    return n;
  };

  const handleCreate = async () => {
    setError('');
    const name = ensureName();
    if (!name) return;
    if (isMulDiv && tables.length === 0) {
      setError('เลือกแม่อย่างน้อย 1 ตัว');
      return;
    }
    setBusy(true);
    try {
      const settings: RoomSettings = {
        operation: op,
        difficulty: isMulDiv ? '1-digit' : diff,
        tables: isMulDiv ? tables : undefined,
        durationSec,
        problemCount,
      };
      const code = await createRoom(playerId, name, settings);
      router.push(`/room/${code}`);
    } catch (e: any) {
      setError(e?.message || 'สร้างห้องไม่ได้');
      setBusy(false);
    }
  };

  const handleJoin = async () => {
    setError('');
    const name = ensureName();
    if (!name) return;
    const code = joinCode.trim();
    if (code.length !== 6) {
      setError('รหัสห้อง 6 หลัก');
      return;
    }
    setBusy(true);
    try {
      await joinRoom(code, playerId, name);
      router.push(`/room/${code}`);
    } catch (e: any) {
      setError(e?.message || 'เข้าห้องไม่ได้');
      setBusy(false);
    }
  };

  const toggleTable = (n: number) => {
    setTables((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n].sort((a, b) => a - b)));
  };

  const operations: { id: Operation; label: string }[] = [
    { id: 'addition', label: '+' },
    { id: 'subtraction', label: '−' },
    { id: 'multiplication', label: '×' },
    { id: 'division', label: '÷' },
  ];

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 font-['Plus_Jakarta_Sans'] p-4">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.08),transparent_80%)]" />
      </div>

      <div className="w-full max-w-[500px] mx-auto relative z-10 space-y-6 pt-4 pb-12">
        <header className="flex items-center gap-4">
          <Link
            href="/"
            className="p-3 bg-slate-900/80 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">LOBBY</h1>
            <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.4em]">2-Player Math Battle</p>
          </div>
        </header>

        {/* Name input */}
        <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-5 space-y-2">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Your Name</p>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="พิมพ์ชื่อ..."
            maxLength={20}
            className="w-full bg-slate-950/80 border-2 border-slate-800 rounded-2xl py-3 px-4 text-lg font-black text-white outline-none focus:border-purple-500/50"
          />
        </div>

        {mode === 'idle' && (
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => setMode('create')}
              className="group relative bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 flex items-center justify-between hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-purple-500 shadow-lg shadow-purple-500/40 flex items-center justify-center text-white">
                  <Plus className="w-7 h-7" />
                </div>
                <div className="text-left">
                  <p className="text-xl font-black uppercase italic tracking-tight text-white">สร้างห้อง</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Host a battle</p>
                </div>
              </div>
              <Swords className="w-5 h-5 text-slate-600 group-hover:text-white" />
            </button>

            <button
              onClick={() => setMode('join')}
              className="group relative bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 flex items-center justify-between hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500 shadow-lg shadow-cyan-500/40 flex items-center justify-center text-white">
                  <LogIn className="w-7 h-7" />
                </div>
                <div className="text-left">
                  <p className="text-xl font-black uppercase italic tracking-tight text-white">เข้าห้อง</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Join with code</p>
                </div>
              </div>
              <Users className="w-5 h-5 text-slate-600 group-hover:text-white" />
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Settings</h2>
              <button onClick={() => setMode('idle')} className="text-[10px] font-black text-slate-500 uppercase hover:text-white">Cancel</button>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Operation</p>
              <div className="grid grid-cols-4 gap-2">
                {operations.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setOp(o.id)}
                    className={cn(
                      'py-3 rounded-2xl border-b-4 text-2xl font-black transition-all',
                      op === o.id ? 'bg-purple-500 border-purple-700 text-white' : 'bg-slate-800 border-slate-950 text-slate-500'
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {!isMulDiv && (
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Difficulty</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['1-digit', '2-digit', '3-digit'] as DifficultyLevel[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDiff(d)}
                      className={cn(
                        'py-3 rounded-2xl border-b-4 text-[10px] font-black uppercase tracking-widest transition-all',
                        diff === d ? 'bg-indigo-500 border-indigo-700 text-white' : 'bg-slate-800 border-slate-950 text-slate-500'
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isMulDiv && (
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Tables</p>
                  <div className="flex gap-2">
                    <button onClick={() => setTables([...TABLE_OPTIONS])} className="text-[9px] font-black text-purple-400 uppercase">All</button>
                    <button onClick={() => setTables([])} className="text-[9px] font-black text-slate-500 uppercase">Clear</button>
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {TABLE_OPTIONS.map((n) => {
                    const on = tables.includes(n);
                    return (
                      <button
                        key={n}
                        onClick={() => toggleTable(n)}
                        className={cn(
                          'py-3 rounded-xl font-black text-base border-b-4 transition-all',
                          on ? 'bg-indigo-500 border-indigo-700 text-white' : 'bg-slate-800 border-slate-950 text-slate-500'
                        )}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Time</p>
              <div className="grid grid-cols-5 gap-2">
                {[30, 60, 120, 180, 300].map((s) => (
                  <button
                    key={s}
                    onClick={() => setDurationSec(s)}
                    className={cn(
                      'py-3 rounded-xl border-b-4 text-xs font-black uppercase transition-all',
                      durationSec === s ? 'bg-yellow-500 border-yellow-700 text-slate-950' : 'bg-slate-800 border-slate-950 text-slate-500'
                    )}
                  >
                    {s < 60 ? `${s}s` : `${s / 60}m`}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Problems</p>
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 30, 50].map((n) => (
                  <button
                    key={n}
                    onClick={() => setProblemCount(n)}
                    className={cn(
                      'py-3 rounded-xl border-b-4 text-sm font-black uppercase transition-all',
                      problemCount === n ? 'bg-cyan-500 border-cyan-700 text-white' : 'bg-slate-800 border-slate-950 text-slate-500'
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-[11px] font-black text-red-400 text-center">{error}</p>}

            <button
              onClick={handleCreate}
              disabled={busy}
              className={cn(
                'w-full py-4 rounded-2xl text-lg font-black uppercase italic tracking-widest transition-all flex items-center justify-center gap-3',
                busy ? 'bg-slate-800 text-slate-600' : 'bg-white text-slate-950 shadow-[0_6px_0_rgb(226,232,240)] active:shadow-none active:translate-y-[6px]'
              )}
            >
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : 'CREATE ROOM'}
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Room Code</h2>
              <button onClick={() => setMode('idle')} className="text-[10px] font-black text-slate-500 uppercase hover:text-white">Cancel</button>
            </div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit"
              className="w-full bg-slate-950/80 border-2 border-slate-800 rounded-2xl py-5 px-4 text-3xl font-black text-center text-white tracking-[0.5em] outline-none focus:border-cyan-500/50"
            />

            {error && <p className="text-[11px] font-black text-red-400 text-center">{error}</p>}

            <button
              onClick={handleJoin}
              disabled={busy}
              className={cn(
                'w-full py-4 rounded-2xl text-lg font-black uppercase italic tracking-widest transition-all flex items-center justify-center gap-3',
                busy ? 'bg-slate-800 text-slate-600' : 'bg-white text-slate-950 shadow-[0_6px_0_rgb(226,232,240)] active:shadow-none active:translate-y-[6px]'
              )}
            >
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : 'JOIN'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
