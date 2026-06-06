'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/lib/GameContext';
import { SHOP_ITEMS, Item } from '@/lib/rpg';
import { ShoppingBag, Check, Star, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AvatarStore() {
  const { state, buyItem, equipItem } = useGame();
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (item: Item) => {
    if (state.inventory.includes(item.id)) {
      equipItem(item.id);
    } else {
      buyItem(item.id);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="group relative flex items-center gap-3 bg-indigo-500 hover:bg-indigo-400 px-6 py-3 rounded-full border-b-[6px] border-indigo-700 active:border-b-0 active:translate-y-1 transition-all shadow-[0_15px_30px_rgba(99,102,241,0.3)] overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <ShoppingBag className="w-5 h-5 text-white drop-shadow-md" />
        <span className="font-black text-white uppercase tracking-widest text-xs">Armory</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 100 }}
              className="relative w-full max-w-[540px] bg-slate-900 border-[8px] border-indigo-500 rounded-[4rem] shadow-[0_0_100px_rgba(99,102,241,0.3)] overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Shop Header */}
              <div className="px-10 py-10 border-b border-white/5 flex items-center justify-between bg-slate-800/30">
                <div className="space-y-1">
                   <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                      <h2 className="text-4xl font-black uppercase italic text-white tracking-tighter font-['Plus_Jakarta_Sans']">EMPORIUM</h2>
                   </div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Upgrade Tactical Profile</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="w-12 h-12 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all group">
                   <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              {/* Shop Grid */}
              <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 custom-scrollbar">
                {SHOP_ITEMS.map((item) => {
                  const isOwned = state.inventory.includes(item.id);
                  const isEquipped = Object.values(state.equipped).includes(item.id);
                  const canAfford = state.coins >= item.price;

                  return (
                    <motion.div
                      key={item.id}
                      whileHover={{ x: 6, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                      className={cn(
                        "p-6 rounded-[2.5rem] border-b-[8px] transition-all flex items-center justify-between gap-6",
                        isEquipped ? "bg-indigo-500/20 border-indigo-500 ring-2 ring-indigo-500/50" : 
                        isOwned ? "bg-slate-800 border-slate-950" : 
                        "bg-slate-950/40 border-slate-950 hover:border-slate-800"
                      )}
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center text-5xl shadow-inner border border-white/5 relative group-hover:scale-110 transition-transform">
                          {item.image}
                          {isEquipped && <div className="absolute inset-0 bg-indigo-500/10 rounded-3xl animate-pulse" />}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black text-white text-lg uppercase tracking-tight">{item.name}</h4>
                          <span className="inline-block px-3 py-1 bg-white/5 rounded-full text-[9px] uppercase tracking-widest text-slate-500 font-black">
                            {item.category}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAction(item)}
                        disabled={!isOwned && !canAfford}
                        className={cn(
                          "px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all border-b-[6px] active:border-b-0 active:translate-y-1 shadow-xl",
                          isEquipped ? "bg-green-500 border-green-700 text-white" :
                          isOwned ? "bg-indigo-600 border-indigo-800 text-white" :
                          canAfford ? "bg-white text-slate-950 border-slate-300" :
                          "bg-slate-700 border-slate-800 text-slate-500 cursor-not-allowed shadow-none grayscale"
                        )}
                      >
                        {isEquipped ? (
                          <Check className="w-5 h-5 stroke-[4]" />
                        ) : isOwned ? (
                          "EQUIP"
                        ) : (
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 fill-current text-yellow-500" />
                            {item.price}
                          </div>
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Shop Footer */}
              <div className="p-8 bg-slate-800/30 border-t border-white/5 flex items-center justify-center gap-4">
                 <div className="bg-slate-950/80 px-8 py-3 rounded-full border border-white/10 flex items-center gap-3">
                    <Star className="w-4 h-4 fill-current text-yellow-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Balance: <span className="text-white text-base">{state.coins}</span></span>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.5); }
      `}</style>
    </>
  );
}
