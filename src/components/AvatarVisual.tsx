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

// Aura visuals — each aura id maps to a colored halo gradient
const AURA_GRADIENT: Record<string, string> = {
  aura_1: 'radial-gradient(circle, rgba(255,210,63,0.55) 0%, rgba(255,111,181,0.35) 40%, transparent 70%)',
  aura_2: 'radial-gradient(circle, rgba(155,109,255,0.55) 0%, rgba(76,201,255,0.35) 40%, transparent 70%)',
};

export default function AvatarVisual({ size = 'md', className }: AvatarVisualProps) {
  const { state } = useGame();
  const px = SIZE_MAP[size];

  const hatEmoji = getEmoji(state.equipped.hat);
  const auraId = state.equipped.aura;
  const auraGradient = auraId ? AURA_GRADIENT[auraId] : null;
  const petEmoji = getEmoji(state.equipped.pet);

  return (
    <div
      className={cn('relative inline-block shrink-0', className)}
      style={{ width: px, height: px }}
    >
      {/* Aura — soft circular halo behind the mascot */}
      {auraGradient && (
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-[-18%] rounded-full pointer-events-none z-0"
          style={{ background: auraGradient }}
        />
      )}

      {/* Mascot body — anchored centered */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <Mascot mood="happy" size={px} />
      </div>

      {/* Hat — sits on top of head, centered horizontally */}
      {hatEmoji && (
        <div
          className="absolute z-30 pointer-events-none"
          style={{
            top: -px * 0.18,
            left: '50%',
            width: px * 0.55,
            height: px * 0.55,
            marginLeft: -(px * 0.55) / 2,
          }}
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full h-full flex items-center justify-center select-none"
            style={{ fontSize: px * 0.45, lineHeight: 1, filter: 'drop-shadow(0 3px 4px rgba(43,29,87,0.25))' }}
          >
            {hatEmoji}
          </motion.div>
        </div>
      )}

      {/* Pet — small framed badge at bottom-right of avatar */}
      {petEmoji && (
        <div
          className="absolute z-30 pointer-events-none"
          style={{
            width: px * 0.4,
            height: px * 0.4,
            right: -px * 0.05,
            bottom: -px * 0.05,
          }}
        >
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full h-full bg-white rounded-2xl border-2 border-white shadow flex items-center justify-center select-none"
            style={{ fontSize: px * 0.26, lineHeight: 1 }}
          >
            {petEmoji}
          </motion.div>
        </div>
      )}
    </div>
  );
}
