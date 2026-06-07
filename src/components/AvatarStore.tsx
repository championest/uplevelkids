'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/lib/GameContext';
import { SHOP_ITEMS, Item } from '@/lib/rpg';
import { ShoppingBag, Check, X, Coins } from 'lucide-react';
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
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="kid-btn px-6 py-3 text-white gap-2"
        style={{ background: 'linear-gradient(160deg, #ff6fb5, #9b6dff)' }}
      >
        <ShoppingBag className="w-5 h-5" />
        <span className="font-display text-base">ร้านค้า</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-[#2b1d57]/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 60 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 60 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="relative w-full max-w-[520px] kid-card overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div
                className="px-6 py-5 flex items-center justify-between"
                style={{ background: 'linear-gradient(160deg, #ffd6f5, #d5c9ff)' }}
              >
                <div>
                  <h2 className="font-display text-2xl text-[#2b1d57]">ร้านของแต่งตัว</h2>
                  <p className="text-xs text-[#2b1d57]/60">เลือกของให้น้อง Bobo</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-[#2b1d57] hover:bg-[#ff5a6a] hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 custom-scrollbar">
                {SHOP_ITEMS.map((item) => {
                  const isOwned = state.inventory.includes(item.id);
                  const isEquipped = Object.values(state.equipped).includes(item.id);
                  const canAfford = state.coins >= item.price;
                  return (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.01 }}
                      className={cn(
                        'p-4 rounded-3xl border-4 transition-all flex items-center justify-between gap-3',
                        isEquipped
                          ? 'bg-[#5ddc7e]/20 border-[#5ddc7e]'
                          : isOwned
                          ? 'bg-[#fff4b8] border-white'
                          : 'bg-white border-white'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#ffd6f5] to-[#a5e8ff] rounded-2xl flex items-center justify-center text-4xl border-2 border-white">
                          {item.image}
                        </div>
                        <div>
                          <h4 className="font-display text-base text-[#2b1d57]">{item.name}</h4>
                          <span className="inline-block px-2 py-0.5 bg-[#9b6dff]/20 rounded-full text-[10px] font-bold text-[#9b6dff] uppercase tracking-wider mt-1">
                            {item.category === 'hat' ? 'หมวก' : item.category === 'aura' ? 'ออร่า' : 'สัตว์เลี้ยง'}
                          </span>
                        </div>
                      </div>

                      <motion.button
                        whileTap={isOwned || canAfford ? { scale: 0.92 } : {}}
                        onClick={() => handleAction(item)}
                        disabled={!isOwned && !canAfford}
                        className={cn(
                          'kid-btn px-4 py-2 text-sm font-display gap-1',
                          isEquipped
                            ? 'bg-[#5ddc7e] text-white'
                            : isOwned
                            ? 'text-white'
                            : canAfford
                            ? 'bg-[#ffd23f] text-[#2b1d57]'
                            : 'bg-white text-[#2b1d57]/30 cursor-not-allowed'
                        )}
                        style={
                          isOwned && !isEquipped
                            ? { background: 'linear-gradient(160deg, #ff6fb5, #9b6dff)' }
                            : undefined
                        }
                      >
                        {isEquipped ? (
                          <Check className="w-4 h-4" />
                        ) : isOwned ? (
                          'ใส่'
                        ) : (
                          <>
                            <Coins className="w-4 h-4" />
                            {item.price}
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-white/60 border-t-4 border-white flex items-center justify-center gap-2">
                <Coins className="w-5 h-5 text-[#ffd23f]" />
                <span className="font-display text-sm text-[#2b1d57]">เหรียญ:</span>
                <span className="font-display text-xl text-[#2b1d57] tabular-nums">{state.coins}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(155, 109, 255, 0.4); border-radius: 10px; }
      `}</style>
    </>
  );
}
