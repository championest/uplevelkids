'use client';

import { motion } from 'framer-motion';
import { useGame } from '@/lib/GameContext';
import { SHOP_ITEMS } from '@/lib/rpg';
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

function getEmoji(id: string | null): string | null {
  if (!id) return null;
  return SHOP_ITEMS.find((i) => i.id === id)?.image ?? null;
}

export default function AvatarVisual({ size = 'md', className }: AvatarVisualProps) {
  const { state } = useGame();
  const px = SIZE_MAP[size];

  const hatEmoji = getEmoji(state.equipped.hat);
  const auraEmoji = getEmoji(state.equipped.aura);
  const petEmoji = getEmoji(state.equipped.pet);

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: px, height: px }}
    >
      {/* Aura — orbiting sparkle emoji (matches illustrated style, not blur gradient) */}
      {auraEmoji && (
        <>
          {[0, 1, 2, 3].map((i) => (
            <motion.span
              key={i}
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear', delay: i * -1.5 }}
              className="absolute inset-0 z-0 pointer-events-none"
              style={{ transformOrigin: 'center' }}
            >
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2 select-none"
                style={{ fontSize: px * 0.18, transform: `translate(-50%, -10%) rotate(${i * 90}deg)` }}
              >
                {auraEmoji}
              </span>
            </motion.span>
          ))}
        </>
      )}

      {/* Mascot body */}
      <Mascot mood="happy" size={px} className="relative z-10" />

      {/* Hat — emoji sits on top of head */}
      {hatEmoji && (
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute z-30 leading-none drop-shadow-lg select-none"
          style={{
            fontSize: px * 0.45,
            top: -px * 0.05,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {hatEmoji}
        </motion.div>
      )}

      {/* Pet — emoji sits at bottom-right inside avatar bounds */}
      {petEmoji && (
        <motion.div
          animate={{ x: [0, 3, 0], y: [0, -2, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute z-30 leading-none select-none flex items-center justify-center bg-white rounded-2xl border-2 border-white shadow"
          style={{
            width: px * 0.4,
            height: px * 0.4,
            right: -px * 0.02,
            bottom: -px * 0.02,
            fontSize: px * 0.26,
          }}
        >
          {petEmoji}
        </motion.div>
      )}
    </div>
  );
}
