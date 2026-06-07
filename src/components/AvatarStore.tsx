'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/lib/GameContext';
import { SHOP_ITEMS, Item, ItemSlot, SLOT_LABEL, RARITY_META } from '@/lib/rpg';
import { ShoppingBag, Check, X, Coins, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const SLOT_ORDER: ItemSlot[] = ['hat', 'face', 'top', 'instrument', 'accessory', 'aura', 'pet', 'frame'];

export default function AvatarStore() {
  const { state, buyItem, equipItem } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<ItemSlot>('hat');

  const handleAction = (item: Item) => {
    if (state.inventory.includes(item.id)) {
      equipItem(item.id);
    } else {
      buyItem(item.id);
    }
  };

  const grouped = useMemo(() => {
    const m: Record<ItemSlot, Item[]> = {
      hat: [], face: [], top: [], instrument: [], accessory: [], aura: [], pet: [], frame: [],
    };
    for (const it of SHOP_ITEMS) m[it.category].push(it);
    return m;
  }, []);

  const items = grouped[activeSlot];

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="kid-btn px-5 py-2.5 text-white gap-2"
        style={{ background: 'linear-gradient(160deg, #ff6fb5, #9b6dff)' }}
      >
        <ShoppingBag className="w-4 h-4" />
        <span className="font-display text-sm">ร้านค้า</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3">
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
              className="relative w-full max-w-[540px] kid-card overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ background: 'linear-gradient(160deg, #ffd6f5, #d5c9ff)' }}
              >
                <div>
                  <h2 className="font-display text-2xl text-[#2b1d57]">ร้านของแต่งตัว</h2>
                  <p className="text-xs text-[#2b1d57]/60">แต่งฮีโร่ของหนู · {SHOP_ITEMS.length} ชิ้น</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-[#2b1d57] hover:bg-[#ff5a6a] hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Slot tabs */}
              <div className="flex gap-1.5 overflow-x-auto px-3 py-3 bg-white/50 border-b-2 border-white scrollbar-thin">
                {SLOT_ORDER.map((slot) => {
                  const isActive = slot === activeSlot;
                  const equipped = state.equipped[slot];
                  return (
                    <button
                      key={slot}
                      onClick={() => setActiveSlot(slot)}
                      className={cn(
                        'shrink-0 flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-2xl border-[3px] transition-all',
                        isActive ? 'bg-[#9b6dff] border-[#9b6dff] text-white' : 'bg-white border-white text-[#2b1d57]/60'
                      )}
                    >
                      <span className="text-xl leading-none">{SLOT_LABEL[slot].emoji}</span>
                      <span className="text-[10px] font-display leading-none">{SLOT_LABEL[slot].th}</span>
                      {equipped && (
                        <span className={cn('text-[8px] mt-0.5', isActive ? 'text-white/80' : 'text-[#5ddc7e]')}>●</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Items grid */}
              <div className="flex-1 overflow-y-auto px-4 py-3 grid grid-cols-2 gap-3 custom-scrollbar">
                {items.map((item) => {
                  const isOwned = state.inventory.includes(item.id);
                  const isEquipped = Object.values(state.equipped).includes(item.id);
                  const canAfford = state.coins >= item.price;
                  const rarity = item.rarity ?? 'common';
                  const rmeta = RARITY_META[rarity];
                  return (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      className={cn(
                        'p-3 rounded-3xl border-4 transition-all flex flex-col items-center gap-1.5',
                        isEquipped
                          ? 'bg-[#5ddc7e]/20 border-[#5ddc7e]'
                          : isOwned
                          ? 'bg-white border-white'
                          : 'bg-white/80 border-white'
                      )}
                    >
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border-2 border-white"
                        style={{ background: rmeta.bg }}
                      >
                        {item.image}
                      </div>
                      <h4 className="font-display text-xs text-[#2b1d57] text-center leading-tight">{item.name}</h4>
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider rounded-full px-1.5 py-0.5 text-white"
                        style={{ background: rmeta.color }}
                      >
                        {rmeta.th}
                      </span>

                      <motion.button
                        whileTap={isOwned || canAfford ? { scale: 0.92 } : {}}
                        onClick={() => handleAction(item)}
                        disabled={!isOwned && !canAfford}
                        className={cn(
                          'kid-btn w-full px-2 py-1.5 text-xs font-display gap-1 mt-1',
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
                          <><Check className="w-3 h-3" /> ใส่อยู่</>
                        ) : isOwned ? (
                          'ใส่'
                        ) : canAfford ? (
                          <><Coins className="w-3 h-3" /> {item.price}</>
                        ) : (
                          <><Lock className="w-3 h-3" /> {item.price}</>
                        )}
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-white/60 border-t-4 border-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-[#ffd23f]" />
                  <span className="font-display text-sm text-[#2b1d57]">เหรียญ:</span>
                  <span className="font-display text-xl text-[#2b1d57] tabular-nums">{state.coins}</span>
                </div>
                <a
                  href="/shop/recharge"
                  className="kid-btn px-3 py-1.5 text-xs font-display text-white"
                  style={{ background: 'linear-gradient(160deg, #5ddc7e, #4cc9ff)' }}
                >
                  เติมเหรียญ
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(155, 109, 255, 0.4); border-radius: 10px; }
        .scrollbar-thin::-webkit-scrollbar { height: 4px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(155, 109, 255, 0.3); border-radius: 10px; }
      `}</style>
    </>
  );
}
