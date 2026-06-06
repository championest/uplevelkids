'use client';

import PracticeEngine from '@/components/PracticeEngine';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function PracticePage() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 font-['Plus_Jakarta_Sans'] selection:bg-cyan-500/30 overflow-hidden flex flex-col items-center justify-center p-4">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.06),transparent_80%)]" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-[500px] relative z-10 space-y-6">
        <header className="flex justify-between items-center px-2">
          <Link
            href="/"
            className="p-3 bg-slate-900/80 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="text-right">
            <p className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.4em]">Free Mode</p>
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">No login required</p>
          </div>
        </header>

        <section className="animate-in fade-in zoom-in-95 duration-700 fill-mode-both">
          <PracticeEngine />
        </section>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.15; transform: scale(1.1); }
        }
        .animate-pulse {
          animation: pulse 8s infinite ease-in-out;
        }
      `}</style>
    </main>
  );
}
