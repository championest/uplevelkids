'use client';

import { motion } from 'framer-motion';
import { Cat, Dog, Crown, GraduationCap } from 'lucide-react';
import { useGame } from '@/lib/GameContext';
import { cn } from '@/lib/utils';
import Mascot from './Mascot';

interface AvatarVisualProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  sm: 40,
  md: 64,
  lg: 96,
  xl: 130,
};

export default function AvatarVisual({ size = 'md', className }: AvatarVisualProps) {
  const { state } = useGame();
  const px = SIZE_MAP[size];

  const getHatIcon = () => {
    switch (state.equipped.hat) {
      case 'hat_1': return <GraduationCap className="w-full h-full text-[#9b6dff]" strokeWidth={2.5} />;
      case 'hat_2': return <Crown className="w-full h-full text-[#ffd23f] fill-[#ffd23f]" strokeWidth={2} />;
      default: return null;
    }
  };

  const getPetIcon = () => {
    switch (state.equipped.pet) {
      case 'pet_1': return <Dog className="w-3/4 h-3/4 text-[#ff9a3c]" strokeWidth={2.5} />;
      case 'pet_2': return <Cat className="w-3/4 h-3/4 text-[#9b6dff]" strokeWidth={2.5} />;
      default: return null;
    }
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: px, height: px }}>
      {/* Aura */}
      {state.equipped.aura && (
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className={cn(
            'absolute inset-0 rounded-full blur-xl',
            state.equipped.aura === 'aura_1' ? 'bg-gradient-to-tr from-[#ff6fb5] via-[#ffd23f] to-[#5ddc7e]' : 'bg-gradient-to-tr from-[#9b6dff] to-[#4cc9ff]'
          )}
        />
      )}

      {/* Mascot body */}
      <Mascot mood="happy" size={px} className="relative z-10" />

      {/* Hat — sits on top of the head, within bounds so overflow-hidden parents don't clip it */}
      {state.equipped.hat && (
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center drop-shadow-lg"
          style={{ width: px * 0.55, height: px * 0.4 }}
        >
          {getHatIcon()}
        </motion.div>
      )}

      {/* Pet — bottom-right corner, fully inside avatar box */}
      {state.equipped.pet && (
        <motion.div
          animate={{ x: [0, 3, 0], y: [0, -2, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-0 bottom-0 z-30 bg-white rounded-2xl border-2 border-white shadow flex items-center justify-center"
          style={{ width: px * 0.38, height: px * 0.38 }}
        >
          {getPetIcon()}
        </motion.div>
      )}
    </div>
  );
}
