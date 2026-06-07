'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { generateProblem, Operation, DifficultyLevel } from '@/lib/math';
import TimedEngine from '@/components/TimedEngine';
import { cn } from '@/lib/utils';

const OP_INFO: { id: Operation; sym: string; th: string; color: string }[] = [
  { id: 'addition', sym: '+', th: 'บวก', color: '#5ddc7e' },
  { id: 'subtraction', sym: '−', th: 'ลบ', color: '#4cc9ff' },
  { id: 'multiplication', sym: '×', th: 'คูณ', color: '#ff6fb5' },
  { id: 'division', sym: '÷', th: 'หาร', color: '#ff9a3c' },
];

export default function JammingPage() {
  const [op, setOp] = useState<Operation>('addition');
  const [diff, setDiff] = useState<DifficultyLevel>('1-digit');
  const [mode, setMode] = useState<'setup' | 'play'>('setup');

  const isMulDiv = op === 'multiplication' || op === 'division';

  if (mode === 'play') {
    return (
      <main className="min-h-screen flex flex-col items-center px-4 pt-6 pb-12">
        <div className="w-full max-w-[520px] relative z-10 space-y-4">
          <header className="flex justify-between items-center">
            <button onClick={() => setMode('setup')} className="kid-btn bg-white px-4 py-3 text-[#9b6dff]">
              <ChevronLeft className="w-6 h-6" />
              <span className="font-display text-base">ตั้งค่า</span>
            </button>
            <div className="text-right">
              <p className="font-display text-base text-[#2b1d57]">แจม</p>
              <p className="text-xs text-[#2b1d57]/60">Jamming · ไม่มีจับเวลา</p>
            </div>
          </header>

          <TimedEngine
            mode="jamming"
            durationSec={0}
            buildProblem={() => generateProblem(op, isMulDiv ? 'table-1-12' : diff)}
            title="แจมสบายๆ"
            metaLine={`${OP_INFO.find((o) => o.id === op)?.th} · ไม่มีจับเวลา`}
            gradient="linear-gradient(160deg, #5ddc7e, #ffd23f)"
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 pt-6 pb-12">
      <div className="w-full max-w-[520px] relative z-10 space-y-4">
        <header className="flex justify-between items-center">
          <Link href="/" className="kid-btn bg-white px-4 py-3 text-[#9b6dff]">
            <ChevronLeft className="w-6 h-6" />
            <span className="font-display text-base">กลับ</span>
          </Link>
          <div className="text-right">
            <p className="font-display text-base text-[#2b1d57]">แจม</p>
            <p className="text-xs text-[#2b1d57]/60">Jamming · ไม่มีจับเวลา</p>
          </div>
        </header>

        <div className="kid-card p-5 space-y-4">
          <h1 className="font-display text-2xl text-[#2b1d57]">เลือกแบบที่อยากซ้อม</h1>

          <div>
            <p className="font-display text-sm text-[#2b1d57]/70 mb-2">เครื่องหมาย</p>
            <div className="grid grid-cols-4 gap-2">
              {OP_INFO.map((o) => {
                const active = op === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => setOp(o.id)}
                    className={cn('kid-btn flex-col py-3 text-white', !active && 'opacity-50')}
                    style={{ background: o.color }}
                  >
                    <span className="font-display text-2xl leading-none">{o.sym}</span>
                    <span className="text-[10px] font-display mt-0.5">{o.th}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {!isMulDiv && (
            <div>
              <p className="font-display text-sm text-[#2b1d57]/70 mb-2">ระดับ</p>
              <div className="grid grid-cols-3 gap-2">
                {(['1-digit', '2-digit', '3-digit'] as DifficultyLevel[]).map((d) => {
                  const labels: Record<string, string> = { '1-digit': 'ง่าย', '2-digit': 'กลาง', '3-digit': 'ยาก' };
                  const active = diff === d;
                  return (
                    <button
                      key={d}
                      onClick={() => setDiff(d)}
                      className={cn('kid-btn flex-col py-3', active ? 'bg-[#ffd23f] text-[#2b1d57]' : 'bg-white text-[#2b1d57]/40')}
                    >
                      <span className="font-display text-base">{labels[d]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={() => setMode('play')}
            className="kid-btn w-full py-5 text-2xl font-display text-white"
            style={{ background: 'linear-gradient(160deg, #5ddc7e, #ffd23f)' }}
          >
            🎸 เริ่มแจม!
          </button>

          <p className="text-xs text-[#2b1d57]/60 text-center">โหมดสบาย · ไม่มีจับเวลา · ค่อยๆ คิด</p>
        </div>
      </div>
    </main>
  );
}
