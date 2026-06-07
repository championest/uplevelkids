'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, Plus, LogIn, Loader2, Swords } from 'lucide-react';
import { usePlayer } from '@/lib/usePlayer';
import { createRoom, joinRoom, RoomSettings } from '@/lib/rooms';
import { Operation, DifficultyLevel } from '@/lib/math';
import { cn } from '@/lib/utils';
import Mascot from '@/components/Mascot';

const TABLE_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const OP_INFO: { id: Operation; sym: string; th: string; color: string }[] = [
  { id: 'addition', sym: '+', th: 'บวก', color: '#5ddc7e' },
  { id: 'subtraction', sym: '−', th: 'ลบ', color: '#4cc9ff' },
  { id: 'multiplication', sym: '×', th: 'คูณ', color: '#ff6fb5' },
  { id: 'division', sym: '÷', th: 'หาร', color: '#ff9a3c' },
];

export default function LobbyPage() {
  const router = useRouter();
  const { playerId, playerName, setPlayerName } = usePlayer();
  const [mode, setMode] = useState<'idle' | 'create' | 'join'>('idle');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [op, setOp] = useState<Operation>('addition');
  const [diff, setDiff] = useState<DifficultyLevel>('1-digit');
  const [tables, setTables] = useState<number[]>([2, 3, 4, 5]);
  const [durationSec, setDurationSec] = useState(60);
  const [problemCount, setProblemCount] = useState(20);

  const [joinCode, setJoinCode] = useState('');

  const isMulDiv = op === 'multiplication' || op === 'division';

  const ensureName = (): string | null => {
    const n = playerName.trim();
    if (!n) {
      setError('ใส่ชื่อก่อนน้า');
      return null;
    }
    return n;
  };

  const handleCreate = async () => {
    setError('');
    const name = ensureName();
    if (!name) return;
    if (isMulDiv && tables.length === 0) {
      setError('เลือกแม่อย่างน้อย 1 แม่');
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'สร้างห้องไม่ได้');
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'เข้าห้องไม่ได้');
      setBusy(false);
    }
  };

  const toggleTable = (n: number) => {
    setTables((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n].sort((a, b) => a - b)));
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-4 pt-6 pb-16">
      <div className="w-full max-w-[520px] relative z-10 space-y-5">
        <header className="flex justify-between items-center">
          <Link href="/" className="kid-btn bg-white px-4 py-3 text-[#9b6dff]">
            <ChevronLeft className="w-6 h-6" />
            <span className="font-display text-base">กลับ</span>
          </Link>
          <div className="text-right">
            <p className="font-display text-base text-[#2b1d57]">ดวลเพื่อน</p>
            <p className="text-xs text-[#2b1d57]/60">Battle Online</p>
          </div>
        </header>

        <div className="kid-card p-4 flex items-center gap-3">
          <Mascot mood="wow" size={70} />
          <div className="flex-1">
            <p className="font-display text-xl text-[#2b1d57] leading-tight">ดวลกับเพื่อนเลย!</p>
            <p className="text-xs text-[#2b1d57]/60">2 คน แข่งคิดเลขแบบเรียลไทม์</p>
          </div>
        </div>

        {/* Name input */}
        <div className="kid-card p-4 space-y-2">
          <p className="font-display text-sm text-[#2b1d57]/70">ชื่อของหนู · Your Name</p>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="พิมพ์ชื่อ..."
            maxLength={20}
            className="w-full bg-white border-[3px] border-[#9b6dff]/30 rounded-2xl py-3 px-4 text-lg font-display text-[#2b1d57] outline-none focus:border-[#9b6dff]"
          />
        </div>

        {mode === 'idle' && (
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode('create')}
              className="kid-btn flex-col aspect-square text-white"
              style={{ background: 'linear-gradient(160deg, #ff6fb5, #9b6dff)' }}
            >
              <Plus className="w-10 h-10" strokeWidth={3} />
              <span className="font-display text-lg mt-1">สร้างห้อง</span>
              <span className="text-[10px] opacity-80">Host</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode('join')}
              className="kid-btn flex-col aspect-square text-white"
              style={{ background: 'linear-gradient(160deg, #4cc9ff, #5ddc7e)' }}
            >
              <LogIn className="w-10 h-10" strokeWidth={3} />
              <span className="font-display text-lg mt-1">เข้าห้อง</span>
              <span className="text-[10px] opacity-80">Join</span>
            </motion.button>
          </div>
        )}

        {mode === 'create' && (
          <div className="kid-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-[#2b1d57]">ตั้งค่าการดวล</h2>
              <button onClick={() => setMode('idle')} className="text-xs font-bold text-[#2b1d57]/50 underline">ยกเลิก</button>
            </div>

            <div className="space-y-2">
              <p className="font-display text-sm text-[#2b1d57]/70">แบบโจทย์</p>
              <div className="grid grid-cols-4 gap-2">
                {OP_INFO.map((o) => {
                  const active = op === o.id;
                  return (
                    <motion.button
                      key={o.id}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setOp(o.id)}
                      className={cn('kid-btn flex-col py-3 text-white', !active && 'opacity-50')}
                      style={{ background: o.color }}
                    >
                      <span className="font-display text-2xl leading-none">{o.sym}</span>
                      <span className="text-[10px] font-display mt-0.5">{o.th}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {!isMulDiv && (
              <div className="space-y-2">
                <p className="font-display text-sm text-[#2b1d57]/70">ระดับ</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['1-digit', '2-digit', '3-digit'] as DifficultyLevel[]).map((d) => {
                    const active = diff === d;
                    const labels: Record<string, string> = { '1-digit': 'ง่าย', '2-digit': 'กลาง', '3-digit': 'ยาก' };
                    return (
                      <motion.button
                        key={d}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setDiff(d)}
                        className={cn(
                          'kid-btn flex-col py-3 text-[#2b1d57]',
                          active ? 'bg-[#ffd23f]' : 'bg-white opacity-70'
                        )}
                      >
                        <span className="font-display text-base">{labels[d]}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {isMulDiv && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-display text-sm text-[#2b1d57]/70">แม่คูณ</p>
                  <div className="flex gap-2">
                    <button onClick={() => setTables([...TABLE_OPTIONS])} className="text-xs font-bold text-[#9b6dff]">ทั้งหมด</button>
                    <button onClick={() => setTables([])} className="text-xs font-bold text-[#2b1d57]/50">ล้าง</button>
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {TABLE_OPTIONS.map((n) => {
                    const on = tables.includes(n);
                    return (
                      <motion.button
                        key={n}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleTable(n)}
                        className={cn('kid-btn py-2 text-base font-display', on ? 'text-white' : 'bg-white text-[#2b1d57]/40')}
                        style={on ? { background: '#ff6fb5' } : undefined}
                      >
                        {n}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="font-display text-sm text-[#2b1d57]/70">เวลา</p>
              <div className="grid grid-cols-5 gap-2">
                {[30, 60, 120, 180, 300].map((s) => {
                  const active = durationSec === s;
                  return (
                    <motion.button
                      key={s}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setDurationSec(s)}
                      className={cn('kid-btn py-2 text-sm font-display', active ? 'text-white' : 'bg-white text-[#2b1d57]/40')}
                      style={active ? { background: '#4cc9ff' } : undefined}
                    >
                      {s < 60 ? `${s}s` : `${s / 60}m`}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-display text-sm text-[#2b1d57]/70">จำนวนข้อ</p>
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 30, 50].map((n) => {
                  const active = problemCount === n;
                  return (
                    <motion.button
                      key={n}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setProblemCount(n)}
                      className={cn('kid-btn py-2 font-display', active ? 'text-white' : 'bg-white text-[#2b1d57]/40')}
                      style={active ? { background: '#9b6dff' } : undefined}
                    >
                      {n}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {error && <p className="text-sm font-bold text-[#ff5a6a] text-center">{error}</p>}

            <motion.button
              whileTap={!busy ? { scale: 0.97 } : {}}
              onClick={handleCreate}
              disabled={busy}
              className={cn(
                'kid-btn w-full py-4 text-xl font-display gap-3',
                busy ? 'bg-white/60 text-[#2b1d57]/40' : 'text-white'
              )}
              style={!busy ? { background: 'linear-gradient(160deg, #ff6fb5, #9b6dff)' } : undefined}
            >
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Swords className="w-6 h-6" /> สร้างห้อง!</>}
            </motion.button>
          </div>
        )}

        {mode === 'join' && (
          <div className="kid-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-[#2b1d57]">รหัสห้อง</h2>
              <button onClick={() => setMode('idle')} className="text-xs font-bold text-[#2b1d57]/50 underline">ยกเลิก</button>
            </div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full bg-white border-[3px] border-[#9b6dff]/30 rounded-3xl py-5 px-4 text-4xl font-display text-center text-[#2b1d57] tracking-[0.3em] outline-none focus:border-[#9b6dff]"
            />
            {error && <p className="text-sm font-bold text-[#ff5a6a] text-center">{error}</p>}
            <motion.button
              whileTap={!busy ? { scale: 0.97 } : {}}
              onClick={handleJoin}
              disabled={busy}
              className={cn(
                'kid-btn w-full py-4 text-xl font-display gap-3',
                busy ? 'bg-white/60 text-[#2b1d57]/40' : 'text-white'
              )}
              style={!busy ? { background: 'linear-gradient(160deg, #4cc9ff, #5ddc7e)' } : undefined}
            >
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : 'เข้าห้อง!'}
            </motion.button>
          </div>
        )}
      </div>
    </main>
  );
}
