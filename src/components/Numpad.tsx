'use client';

import { motion } from 'framer-motion';
import { Delete, CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { playTap } from '@/lib/sounds';

interface NumpadProps {
  onInput: (val: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  className?: string;
}

const KEY_COLORS: Record<string, string> = {
  '1': '#ff6fb5', '2': '#ff9a3c', '3': '#ffd23f',
  '4': '#5ddc7e', '5': '#4cc9ff', '6': '#9b6dff',
  '7': '#ff5a6a', '8': '#ff9a3c', '9': '#5ddc7e',
  '0': '#4cc9ff',
};

export default function Numpad({ onInput, onDelete, onSubmit, className }: NumpadProps) {
  const rows = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
  ];

  const handle = (k: string) => { playTap(); onInput(k); };

  return (
    <div className={cn('grid grid-cols-3 gap-3 w-full max-w-[360px]', className)}>
      {rows.flat().map((key) => (
        <motion.button
          key={key}
          whileTap={{ scale: 0.9 }}
          onClick={() => handle(key)}
          type="button"
          className="kid-btn h-20 text-3xl font-display text-white"
          style={{ background: KEY_COLORS[key] }}
        >
          {key}
        </motion.button>
      ))}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => { playTap(); onDelete(); }}
        type="button"
        aria-label="Delete"
        className="kid-btn h-20 text-white"
        style={{ background: '#ff5a6a' }}
      >
        <Delete className="w-8 h-8" />
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => handle('0')}
        type="button"
        className="kid-btn h-20 text-3xl font-display text-white"
        style={{ background: KEY_COLORS['0'] }}
      >
        0
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => { playTap(); onSubmit(); }}
        type="button"
        aria-label="Submit"
        className="kid-btn h-20 text-white"
        style={{ background: '#5ddc7e' }}
      >
        <CornerDownLeft className="w-8 h-8" />
      </motion.button>
    </div>
  );
}
