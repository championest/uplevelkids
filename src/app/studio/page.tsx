'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { generateProblem, Operation, DifficultyLevel } from '@/lib/math';
import TimedEngine from '@/components/TimedEngine';

const OPS: Operation[] = ['addition', 'subtraction', 'multiplication', 'division'];

function makeStudioProblem() {
  const op = OPS[Math.floor(Math.random() * OPS.length)];
  if (op === 'multiplication' || op === 'division') {
    const t = 2 + Math.floor(Math.random() * 11);
    return generateProblem(op, 'table-1-12', [t]);
  }
  const diff: DifficultyLevel = Math.random() < 0.4 ? '2-digit' : '1-digit';
  return generateProblem(op, diff);
}

export default function StudioPage() {
  return (
    <main className="min-h-screen flex flex-col items-center px-4 pt-6 pb-12">
      <div className="w-full max-w-[520px] relative z-10 space-y-4">
        <header className="flex justify-between items-center">
          <Link href="/" className="kid-btn bg-white px-4 py-3 text-[#9b6dff]">
            <ChevronLeft className="w-6 h-6" />
            <span className="font-display text-base">กลับ</span>
          </Link>
          <div className="text-right">
            <p className="font-display text-base text-[#2b1d57]">หอฝึก</p>
            <p className="text-xs text-[#2b1d57]/60">Dojo · วัดเรทตอบ</p>
          </div>
        </header>

        <TimedEngine
          mode="studio"
          durationSec={60}
          buildProblem={makeStudioProblem}
          title="หอฝึก 1 นาที"
          metaLine="ทุกแบบโจทย์ · เร็วเท่าไรยิ่งดี"
          gradient="linear-gradient(160deg, #4cc9ff, #5ddc7e)"
        />
      </div>
    </main>
  );
}
