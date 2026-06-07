'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ConfettiProps {
  trigger: number;
  count?: number;
}

const COLORS = ['#ff6fb5', '#ffd23f', '#5ddc7e', '#4cc9ff', '#9b6dff', '#ff9a3c'];
const SHAPES = ['●', '★', '♥', '◆', '✦'];

export default function Confetti({ trigger, count = 28 }: ConfettiProps) {
  const [pieces, setPieces] = useState<{ id: number; x: number; rot: number; color: string; shape: string; delay: number; drift: number }[]>([]);

  useEffect(() => {
    if (trigger === 0) return;
    const next = Array.from({ length: count }, (_, i) => ({
      id: trigger * 1000 + i,
      x: Math.random() * 100,
      rot: Math.random() * 720 - 360,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      delay: Math.random() * 0.2,
      drift: (Math.random() - 0.5) * 60,
    }));
    setPieces(next);
    const t = setTimeout(() => setPieces([]), 1800);
    return () => clearTimeout(t);
  }, [trigger, count]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <AnimatePresence>
        {pieces.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: -40, x: `${p.x}vw`, rotate: 0, opacity: 1 }}
            animate={{ y: '110vh', x: `calc(${p.x}vw + ${p.drift}px)`, rotate: p.rot, opacity: [1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, delay: p.delay, ease: 'easeIn' }}
            className="absolute text-3xl font-bold"
            style={{ color: p.color, textShadow: '0 2px 0 rgba(0,0,0,0.15)' }}
          >
            {p.shape}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
