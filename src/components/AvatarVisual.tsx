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
      case 'hat_1': return <GraduationCap className="w-1/2 h-1/2 text-[#9b6dff]" />;
      case 'hat_2': return <Crown className="w-1/2 h-1/2 text-[#ffd23f]" />;
      default: return null;
    }
  };

  const getPetIcon = () => {
    switch (state.equipped.pet) {
      case 'pet_1': return <Dog className="w-1/2 h-1/2 text-[#ff9a3c]" />;
      case 'pet_2': return <Cat className="w-1/2 h-1/2 text-[#9b6dff]" />;
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

      {/* Hat */}
      {state.equipped.hat && (
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-[18%] z-20 flex items-center justify-center"
          style={{ width: px * 0.55, height: px * 0.55 }}
        >
          {getHatIcon()}
        </motion.div>
      )}

      {/* Pet */}
      {state.equipped.pet && (
        <motion.div
          animate={{ x: [0, 4, 0], y: [0, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-[20%] -bottom-[6%] z-20 bg-white rounded-2xl border-2 border-white shadow flex items-center justify-center"
          style={{ width: px * 0.45, height: px * 0.45 }}
        >
          {getPetIcon()}
        </motion.div>
      )}
    </div>
  );
}
