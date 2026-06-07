'use client';

import { useGame } from '@/lib/GameContext';
import { getXpInCurrentLevel, XP_PER_LEVEL } from '@/lib/rpg';
import { Coins, LogIn, LogOut } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';
import AvatarVisual from './AvatarVisual';

export default function ProfileCard() {
  const { state } = useGame();
  const { data: session } = useSession();

  const xpInLevel = getXpInCurrentLevel(state.xp);
  const progress = Math.min(100, (xpInLevel / XP_PER_LEVEL) * 100);

  return (
    <div className="flex items-center gap-3 bg-white/90 px-3 py-2 rounded-[2rem] border-4 border-white shadow-[0_6px_0_rgba(155,109,255,0.3)]">
      <div className="relative shrink-0">
        {session?.user?.image ? (
          <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-[#9b6dff]">
            <Image src={session.user.image} alt={session.user.name || 'User'} width={44} height={44} className="object-cover" />
          </div>
        ) : (
          <AvatarVisual size="sm" />
        )}
        <div className="absolute -bottom-1 -right-1 bg-[#ffd23f] text-[#2b1d57] text-[9px] font-display px-1.5 py-0.5 rounded-lg border-2 border-white shadow">
          Lv{state.level}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Coins className="w-3.5 h-3.5 text-[#ffd23f]" />
          <span className="font-display text-sm text-[#2b1d57] tabular-nums leading-none">{state.coins}</span>
          <div className="w-16 h-2 bg-white rounded-full overflow-hidden border border-[#9b6dff]/20">
            <div
              className="h-full bg-gradient-to-r from-[#ff6fb5] via-[#ffd23f] to-[#5ddc7e] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-[#2b1d57]/60 truncate max-w-[80px]">
            {session?.user?.name || 'น้องเกสต์'}
          </span>
          <button
            onClick={() => (session ? signOut() : signIn('google'))}
            className="p-0.5 hover:bg-[#9b6dff]/10 rounded-md transition-colors"
            title={session ? 'Sign Out' : 'Sign In'}
          >
            {session ? <LogOut className="w-3 h-3 text-[#ff5a6a]" /> : <LogIn className="w-3 h-3 text-[#5ddc7e]" />}
          </button>
        </div>
      </div>
    </div>
  );
}
