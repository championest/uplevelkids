'use client';

import { motion } from 'framer-motion';
import { User, Sparkles, Zap, Cat, Dog, Crown, GraduationCap } from 'lucide-react';
import { useGame } from '@/lib/GameContext';
import { cn } from '@/lib/utils';

interface AvatarVisualProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function AvatarVisual({ size = 'md', className }: AvatarVisualProps) {
  const { state } = useGame();
  
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  // Map item IDs to icons/visuals
  const getHatIcon = () => {
    switch (state.equipped.hat) {
      case 'hat_1': return <GraduationCap className={cn("text-indigo-400 drop-shadow-lg", iconSizes[size])} />;
      case 'hat_2': return <Crown className={cn("text-yellow-400 drop-shadow-lg", iconSizes[size])} />;
      default: return null;
    }
  };

  const getPetIcon = () => {
    switch (state.equipped.pet) {
      case 'pet_1': return <Dog className="w-1/2 h-1/2 text-orange-400" />;
      case 'pet_2': return <Cat className="w-1/2 h-1/2 text-slate-400" />;
      default: return null;
    }
  };

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      {/* Aura Effect */}
      {state.equipped.aura && (
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className={cn(
            "absolute inset-0 rounded-full blur-xl",
            state.equipped.aura === 'aura_1' ? "bg-cyan-500" : "bg-purple-500"
          )}
        />
      )}

      {/* Main Body */}
      <motion.div 
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className={cn(
          "relative z-10 rounded-3xl bg-slate-800 border-2 border-white/10 flex items-center justify-center shadow-2xl overflow-hidden",
          sizeClasses[size]
        )}
      >
        <User className={cn("text-slate-400", iconSizes[size])} />
        
        {/* Inner glow based on aura */}
        {state.equipped.aura && (
           <div className={cn(
             "absolute inset-0 opacity-20",
             state.equipped.aura === 'aura_1' ? "bg-cyan-400" : "bg-purple-400"
           )} />
        )}
      </motion.div>

      {/* Hat */}
      {state.equipped.hat && (
        <motion.div 
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[30%] z-20"
        >
          {getHatIcon()}
        </motion.div>
      )}

      {/* Pet */}
      {state.equipped.pet && (
        <motion.div
          animate={{ 
            x: [0, 5, 0],
            y: [0, -2, 0]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-[40%] -bottom-[10%] z-20 w-1/2 h-1/2 bg-slate-900 rounded-xl border border-white/10 flex items-center justify-center shadow-lg"
        >
          {getPetIcon()}
        </motion.div>
      )}
    </div>
  );
}
