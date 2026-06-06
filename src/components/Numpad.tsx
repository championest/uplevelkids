'use client';

import { motion } from 'framer-motion';
import { Delete, CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NumpadProps {
  onInput: (val: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  className?: string;
}

export default function Numpad({ onInput, onDelete, onSubmit, className }: NumpadProps) {
  // Real numpad layout: 7-8-9 top → 1-2-3 bottom, last row: del / 0 / enter
  const rows = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
  ];

  const keyBtn = 'h-16 bg-slate-800/50 hover:bg-slate-700/50 text-white text-2xl font-black rounded-2xl border border-white/5 shadow-lg flex items-center justify-center transition-colors';
  const actionBtn = 'h-16 rounded-2xl border shadow-lg flex items-center justify-center transition-colors';

  return (
    <div className={cn('grid grid-cols-3 gap-3 w-full max-w-[320px]', className)}>
      {rows.flat().map((key) => (
        <motion.button
          key={key}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onInput(key)}
          className={keyBtn}
          type="button"
        >
          {key}
        </motion.button>
      ))}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onDelete}
        className={cn(actionBtn, 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/20')}
        type="button"
        aria-label="Delete"
      >
        <Delete className="w-6 h-6" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onInput('0')}
        className={keyBtn}
        type="button"
      >
        0
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onSubmit}
        className={cn(actionBtn, 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/20')}
        type="button"
        aria-label="Submit"
      >
        <CornerDownLeft className="w-6 h-6" />
      </motion.button>
    </div>
  );
}
