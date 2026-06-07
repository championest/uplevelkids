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

const AURA_GRADIENT: Record<string, string> = {
  aura_rainbow: 'radial-gradient(circle, rgba(255,210,63,0.6) 0%, rgba(255,111,181,0.4) 40%, transparent 70%)',
  aura_sparkle: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,210,63,0.45) 35%, transparent 70%)',
  aura_fire:    'radial-gradient(circle, rgba(255,154,60,0.75) 0%, rgba(255,90,106,0.5) 40%, transparent 70%)',
  aura_ice:     'radial-gradient(circle, rgba(195,235,255,0.85) 0%, rgba(76,201,255,0.45) 40%, transparent 70%)',
  aura_storm:   'radial-gradient(circle, rgba(255,210,63,0.8) 0%, rgba(155,109,255,0.5) 40%, transparent 70%)',
  aura_galaxy:  'radial-gradient(circle, rgba(155,109,255,0.75) 0%, rgba(76,201,255,0.5) 40%, transparent 70%)',
  aura_blossom: 'radial-gradient(circle, rgba(255,182,213,0.8) 0%, rgba(255,111,181,0.5) 40%, transparent 70%)',
};

const FRAME_BORDER: Record<string, string> = {
  frame_basic:   '#ffd23f',
  frame_silver:  '#cbd5e1',
  frame_gold:    '#ff9a3c',
  frame_diamond: '#7cd1ff',
  frame_neon:    '#9b6dff',
};

export default function AvatarVisual({ size = 'md', className }: AvatarVisualProps) {
  const { state } = useGame();
  const px = SIZE_MAP[size];

  const hatEmoji = getEmoji(state.equipped.hat);
  const faceEmoji = getEmoji(state.equipped.face);
  const topEmoji = getEmoji(state.equipped.top);
  const insEmoji = getEmoji(state.equipped.instrument);
  const accEmoji = getEmoji(state.equipped.accessory);
  const petEmoji = getEmoji(state.equipped.pet);
  const auraId = state.equipped.aura;
  const auraGradient = auraId ? AURA_GRADIENT[auraId] : null;
  const frameColor = state.equipped.frame ? FRAME_BORDER[state.equipped.frame] : null;

  return (
    <div
      className={cn('relative inline-block shrink-0', className)}
      style={{ width: px, height: px }}
    >
      {/* Aura halo */}
      {auraGradient && (
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-[-18%] rounded-full pointer-events-none z-0"
          style={{ background: auraGradient }}
        />
      )}

      {/* Frame ring */}
      {frameColor && (
        <div
          className="absolute inset-[-6%] rounded-full pointer-events-none z-[5]"
          style={{
            border: `${Math.max(3, px * 0.04)}px solid ${frameColor}`,
            boxShadow: `0 0 ${px * 0.1}px ${frameColor}80`,
          }}
        />
      )}

      {/* Mascot body */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <Mascot mood="happy" size={px} />
      </div>

      {/* Face overlay — covers mascot face area with chosen expression */}
      {faceEmoji && (
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute z-20 leading-none select-none flex items-center justify-center"
          style={{
            fontSize: px * 0.42,
            top: px * 0.2,
            left: '50%',
            transform: 'translateX(-50%)',
            filter: 'drop-shadow(0 1px 2px rgba(43,29,87,0.15))',
          }}
        >
          {faceEmoji}
        </motion.div>
      )}

      {/* Top / outfit — centered on the body */}
      {topEmoji && !faceEmoji && (
        <div
          className="absolute z-20 leading-none select-none"
          style={{
            fontSize: px * 0.32,
            bottom: px * 0.05,
            left: '50%',
            transform: 'translateX(-50%)',
            filter: 'drop-shadow(0 1px 2px rgba(43,29,87,0.15))',
          }}
        >
          {topEmoji}
        </div>
      )}

      {/* Hat — on top of head */}
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

      {/* Accessory — small badge top-right */}
      {accEmoji && (
        <div
          className="absolute z-30 leading-none select-none flex items-center justify-center bg-white rounded-full border-2 border-white shadow"
          style={{
            width: px * 0.32,
            height: px * 0.32,
            right: -px * 0.05,
            top: -px * 0.05,
            fontSize: px * 0.22,
          }}
        >
          {accEmoji}
        </div>
      )}

      {/* Instrument — bottom-left badge */}
      {insEmoji && (
        <motion.div
          animate={{ rotate: [-3, 3, -3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute z-30 leading-none select-none flex items-center justify-center"
          style={{
            width: px * 0.4,
            height: px * 0.4,
            left: -px * 0.08,
            bottom: -px * 0.08,
            fontSize: px * 0.32,
            filter: 'drop-shadow(0 2px 3px rgba(43,29,87,0.25))',
          }}
        >
          {insEmoji}
        </motion.div>
      )}

      {/* Pet — bottom-right framed badge */}
      {petEmoji && (
        <motion.div
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute z-30 leading-none select-none flex items-center justify-center bg-white rounded-2xl border-2 border-white shadow"
          style={{
            width: px * 0.4,
            height: px * 0.4,
            right: -px * 0.05,
            bottom: -px * 0.05,
            fontSize: px * 0.26,
          }}
        >
          {petEmoji}
        </motion.div>
      )}
    </div>
  );
}
