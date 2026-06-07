'use client';

import PracticeEngine from '@/components/PracticeEngine';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function PracticePage() {
  return (
    <main className="min-h-screen flex flex-col items-center px-4 pt-6 pb-12">
      <div className="w-full max-w-[520px] relative z-10 space-y-4">
        <header className="flex justify-between items-center">
          <Link
            href="/"
            className="kid-btn bg-white px-4 py-3 text-[#9b6dff]"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="font-display text-base">กลับ</span>
          </Link>
          <div className="text-right">
            <p className="font-display text-base text-[#2b1d57]">ฝึกฝีมือ</p>
            <p className="text-xs text-[#2b1d57]/60">Free Practice</p>
          </div>
        </header>

        <section>
          <PracticeEngine />
        </section>
      </div>
    </main>
  );
}
