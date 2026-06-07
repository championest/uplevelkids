'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type MascotMood = 'happy' | 'cheer' | 'think' | 'sad' | 'wow';

interface MascotProps {
  mood?: MascotMood;
  size?: number;
  className?: string;
}

/**
 * Up Level Kids mascot — chibi blob "Bobo". Pure SVG so no asset deps.
 * Friendly round shape, big eyes, expressive mouth changes with mood.
 */
export default function Mascot({ mood = 'happy', size = 140, className }: MascotProps) {
  const eyes = {
    happy: { ry: 8, sparkle: true },
    cheer: { ry: 4, sparkle: true },
    think: { ry: 7, sparkle: false },
    sad: { ry: 5, sparkle: false },
    wow: { ry: 10, sparkle: true },
  }[mood];

  const mouthPath = {
    happy: 'M 55 75 Q 70 90 85 75',
    cheer: 'M 50 72 Q 70 100 90 72',
    think: 'M 60 80 Q 70 78 80 80',
    sad: 'M 55 86 Q 70 72 85 86',
    wow: 'M 70 78 m -8 0 a 8 8 0 1 0 16 0 a 8 8 0 1 0 -16 0',
  }[mood];

  return (
    <motion.div
      animate={mood === 'cheer' ? { y: [0, -14, 0], rotate: [0, -3, 3, 0] } : { y: [0, -6, 0] }}
      transition={{ duration: mood === 'cheer' ? 0.6 : 2.2, repeat: Infinity, ease: 'easeInOut' }}
      className={cn('inline-block', className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 140 140" width={size} height={size}>
        {/* Soft shadow under blob */}
        <ellipse cx="70" cy="128" rx="38" ry="6" fill="rgba(43,29,87,0.18)" />

        {/* Body */}
        <defs>
          <radialGradient id="bodyGrad" cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#fff4e8" />
            <stop offset="60%" stopColor="#ffd6a8" />
            <stop offset="100%" stopColor="#ff9a3c" />
          </radialGradient>
          <radialGradient id="cheekGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffb3d4" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffb3d4" stopOpacity="0" />
          </radialGradient>
        </defs>

        <path
          d="M 30 70 Q 30 25 70 25 Q 110 25 110 70 Q 110 115 70 115 Q 30 115 30 70 Z"
          fill="url(#bodyGrad)"
          stroke="#2b1d57"
          strokeWidth="3"
        />

        {/* Cheeks */}
        <ellipse cx="40" cy="80" rx="10" ry="7" fill="url(#cheekGrad)" />
        <ellipse cx="100" cy="80" rx="10" ry="7" fill="url(#cheekGrad)" />

        {/* Eyes */}
        <ellipse cx="52" cy="60" rx="6" ry={eyes.ry} fill="#2b1d57" />
        <ellipse cx="88" cy="60" rx="6" ry={eyes.ry} fill="#2b1d57" />
        {eyes.sparkle && (
          <>
            <circle cx="54" cy="56" r="2" fill="#fff" />
            <circle cx="90" cy="56" r="2" fill="#fff" />
          </>
        )}

        {/* Mouth */}
        <path d={mouthPath} stroke="#2b1d57" strokeWidth="3" fill={mood === 'cheer' ? '#ff5a6a' : 'none'} strokeLinecap="round" />

        {/* Tiny crown sparkle on wow */}
        {(mood === 'wow' || mood === 'cheer') && (
          <>
            <text x="22" y="32" fontSize="18" fill="#ffd23f">✦</text>
            <text x="108" y="36" fontSize="14" fill="#ff6fb5">✦</text>
          </>
        )}
      </svg>
    </motion.div>
  );
}
