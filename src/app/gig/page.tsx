'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { generateProblem } from '@/lib/math';
import TimedEngine from '@/components/TimedEngine';

const TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function makeGigProblem() {
  const t = TABLES[Math.floor(Math.random() * TABLES.length)];
  return generateProblem('multiplication', 'table-1-12', [t]);
}

export default function GigPage() {
  return (
    <main className="min-h-screen flex flex-col items-center px-4 pt-6 pb-12">
      <div className="w-full max-w-[520px] relative z-10 space-y-4">
        <header className="flex justify-between items-center">
          <Link href="/" className="kid-btn bg-white px-4 py-3 text-[#9b6dff]">
            <ChevronLeft className="w-6 h-6" />
            <span className="font-display text-base">กลับ</span>
          </Link>
          <div className="text-right">
            <p className="font-display text-base text-[#2b1d57]">ภารกิจใหญ่</p>
            <p className="text-xs text-[#2b1d57]/60">Boss Quest · 100 ข้อ 5 นาที</p>
          </div>
        </header>

        <TimedEngine
          mode="gig"
          durationSec={300}
          problemLimit={100}
          buildProblem={makeGigProblem}
          title="ปราบบอสมังกร"
          metaLine="100 ข้อ × ทุกแม่ · 5 นาที"
          gradient="linear-gradient(160deg, #ffd23f, #ff9a3c)"
        />
      </div>
    </main>
  );
}
