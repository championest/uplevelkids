'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { SpeedRating } from '@/lib/speed';

interface Props {
  rating: SpeedRating | null;
}

export default function SpeedPop({ rating }: Props) {
  return (
    <AnimatePresence>
      {rating && (
        <motion.div
          key={rating.ms + '-' + rating.tier}
          initial={{ scale: 0.3, opacity: 0, y: 30, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
          exit={{ scale: 1.3, opacity: 0, y: -30 }}
          transition={{ type: 'spring', stiffness: 320, damping: 16 }}
          className="absolute z-30 pointer-events-none top-2 left-1/2 -translate-x-1/2"
        >
          <div
            className="px-5 py-2 rounded-full border-4 border-white shadow-[0_6px_0_rgba(0,0,0,0.12)] font-display text-lg flex items-center gap-2"
            style={{ background: rating.color, color: rating.tier === 'god' ? '#2b1d57' : '#fff' }}
          >
            <span className="text-2xl">{rating.emoji}</span>
            <span>{rating.label}</span>
            <span className="text-xs opacity-80 tabular-nums">{(rating.ms / 1000).toFixed(1)}s</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
