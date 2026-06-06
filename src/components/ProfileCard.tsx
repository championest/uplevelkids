'use client';

import { motion } from 'framer-motion';
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
  const progress = (xpInLevel / XP_PER_LEVEL) * 100;

  return (
    <div className="flex items-center gap-4 bg-slate-900/90 px-4 py-2.5 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-xl relative group">
      {/* Avatar Pill */}
      <div className="relative shrink-0">
        {session?.user?.image ? (
          <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-lg relative group-hover:scale-110 transition-transform">
            <Image 
              src={session.user.image} 
              alt={session.user.name || 'User'} 
              width={48} 
              height={48}
              className="object-cover"
            />
          </div>
        ) : (
          <AvatarVisual size="sm" />
        )}
        <div className="absolute -bottom-1 -right-1 bg-white text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-lg border-2 border-slate-900 shadow-lg z-10">
          LV{state.level}
        </div>
      </div>
      
      {/* Stats Container */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-sm font-black tabular-nums text-white leading-none">{state.coins}</span>
          </div>
          <div className="flex flex-col w-20">
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.5)]"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] truncate max-w-[80px]">
             {session?.user?.name || 'Guest Cadet'}
           </span>
           <button 
             onClick={() => session ? signOut() : signIn('google')}
             className="p-1 hover:bg-white/10 rounded-md transition-colors"
             title={session ? "Sign Out" : "Sign In with Google"}
           >
             {session ? <LogOut className="w-3 h-3 text-red-400" /> : <LogIn className="w-3 h-3 text-green-400" />}
           </button>
        </div>
      </div>

      {/* Gloss Overlay */}
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
    </div>
  );
}
