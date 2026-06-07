'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, Coins, Upload, CheckCircle2, Loader2, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGame } from '@/lib/GameContext';
import { COIN_PACKS, PREMIUM_PASSES, CoinPack, PremiumPass } from '@/lib/payments/products';
import PaymentQR from '@/components/PaymentQR';
import Mascot from '@/components/Mascot';
import Confetti from '@/components/Confetti';

type Product = CoinPack | PremiumPass;

function isCoinPack(p: Product): p is CoinPack {
  return 'coins' in p;
}

type Step = 'pick' | 'pay' | 'verify' | 'done';

export default function RechargePage() {
  const { state, addCoins } = useGame();
  const [selected, setSelected] = useState<Product | null>(null);
  const [step, setStep] = useState<Step>('pick');
  const [slipFile, setSlipFile] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  const pick = (p: Product) => {
    setSelected(p);
    setStep('pay');
    setSlipFile(null);
    setError('');
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setError('ไฟล์ใหญ่เกิน 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === 'string') {
        setSlipFile(result);
        setError('');
      }
    };
    reader.readAsDataURL(f);
  };

  const verify = async () => {
    if (!selected || !slipFile) return;
    setBusy(true);
    setError('');
    setStep('verify');
    try {
      const resp = await fetch('/api/verify-slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slipImage: slipFile, amount: selected.priceTHB }),
      });
      const data = await resp.json();
      if (!data.success) {
        setError(data.error || 'ตรวจสลิปไม่ผ่าน · โอนซ้ำหรือยอดไม่ตรง');
        setStep('pay');
        return;
      }
      // Success — credit immediately client-side. (Production would verify server-side & write Firestore.)
      if (isCoinPack(selected)) {
        addCoins(selected.coins + selected.bonus);
      } else {
        // Premium pass: TODO server-side write. For now: mark coins-equivalent + flash done.
        addCoins(0);
      }
      setConfettiTrigger((t) => t + 1);
      setStep('done');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'เน็ตขัดข้อง · ลองใหม่');
      setStep('pay');
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setSelected(null);
    setStep('pick');
    setSlipFile(null);
    setError('');
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-4 pt-6 pb-16">
      <Confetti trigger={confettiTrigger} />
      <div className="w-full max-w-[520px] relative z-10 space-y-4">
        <header className="flex justify-between items-center">
          <Link href="/" className="kid-btn bg-white px-4 py-3 text-[#9b6dff]">
            <ChevronLeft className="w-6 h-6" />
            <span className="font-display text-base">กลับ</span>
          </Link>
          <div className="text-right">
            <p className="font-display text-base text-[#2b1d57]">เติมเหรียญ</p>
            <p className="text-xs text-[#2b1d57]/60">Top up · KSHOP</p>
          </div>
        </header>

        <div className="kid-card p-4 flex items-center gap-3">
          <Mascot mood="cheer" size={70} />
          <div className="flex-1">
            <p className="font-display text-xl text-[#2b1d57] leading-tight">ติดปีกให้ฮีโร่!</p>
            <p className="text-xs text-[#2b1d57]/60">ของแต่งตัวทุกชิ้นยังเก็บเองได้ฟรี · ไม่บังคับซื้อ</p>
          </div>
        </div>

        {step === 'pick' && (
          <>
            {/* Coin packs */}
            <section className="space-y-2">
              <h2 className="font-display text-lg text-[#2b1d57] ml-2">ถุงเหรียญ · Coin Packs</h2>
              <div className="grid grid-cols-2 gap-3">
                {COIN_PACKS.map((pack) => (
                  <motion.button
                    key={pack.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => pick(pack)}
                    className="kid-card p-3 text-left relative overflow-hidden"
                  >
                    {pack.highlight && (
                      <div className="absolute top-2 right-2 bg-[#ff5a6a] text-white text-[9px] font-display px-2 py-0.5 rounded-full border-2 border-white">
                        {pack.highlight}
                      </div>
                    )}
                    <div className="text-4xl">{pack.emoji}</div>
                    <p className="font-display text-base text-[#2b1d57] mt-1">{pack.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Coins className="w-4 h-4 text-[#ffd23f]" />
                      <span className="font-display text-lg text-[#2b1d57] tabular-nums">{(pack.coins + pack.bonus).toLocaleString()}</span>
                    </div>
                    {pack.bonus > 0 && (
                      <p className="text-[10px] font-bold text-[#5ddc7e]">+{pack.bonus.toLocaleString()} โบนัส</p>
                    )}
                    <p className="font-display text-lg text-[#9b6dff] mt-1">฿{pack.priceTHB}</p>
                  </motion.button>
                ))}
              </div>
            </section>

            {/* Hero Pass */}
            <section className="space-y-2">
              <h2 className="font-display text-lg text-[#2b1d57] ml-2 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-[#ffd23f]" />
                พาสนักผจญภัย · พรีเมียม
              </h2>
              <div className="space-y-3">
                {PREMIUM_PASSES.map((pass) => (
                  <motion.button
                    key={pass.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => pick(pass)}
                    className="kid-card p-4 text-left w-full overflow-hidden relative"
                    style={{ background: 'linear-gradient(160deg, #ffd6f5, #d5c9ff)' }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-5xl">{pass.emoji}</div>
                      <div className="flex-1">
                        <p className="font-display text-lg text-[#2b1d57]">{pass.name}</p>
                        <p className="font-display text-2xl text-[#9b6dff] mt-1">฿{pass.priceTHB}</p>
                        <ul className="mt-2 space-y-0.5">
                          {pass.perks.map((perk, i) => (
                            <li key={i} className="text-xs text-[#2b1d57]/80 flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#5ddc7e] shrink-0 mt-0.5" />
                              {perk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </section>

            {/* Trust badges */}
            <section className="kid-card p-3 grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-[#2b1d57]/70">
              <div className="space-y-1"><div className="text-xl">🛡️</div>ไม่บังคับซื้อ</div>
              <div className="space-y-1"><div className="text-xl">🚫</div>ไม่มีโฆษณา</div>
              <div className="space-y-1"><div className="text-xl">🤝</div>ผู้ปกครองดูแลได้</div>
            </section>
          </>
        )}

        {step === 'pay' && selected && (
          <div className="kid-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-[#2b1d57]">สแกนจ่าย</h2>
              <button onClick={reset} className="text-xs font-bold text-[#2b1d57]/50 underline">เปลี่ยน</button>
            </div>

            <div className="flex flex-col items-center gap-3">
              <PaymentQR amount={selected.priceTHB} size={220} />
              <p className="text-xs text-[#2b1d57]/60 text-center">เปิดแอป KShop / ธนาคารแล้วสแกน · ตรวจยอดให้ตรงก่อนโอน</p>
            </div>

            <div className="border-t-2 border-dashed border-[#9b6dff]/20 pt-3 space-y-2">
              <p className="font-display text-base text-[#2b1d57]">อัปโหลดสลิป</p>
              <label className="kid-btn w-full py-4 text-base font-display text-white gap-2 cursor-pointer flex-col" style={{ background: 'linear-gradient(160deg, #4cc9ff, #9b6dff)' }}>
                <Upload className="w-6 h-6" />
                {slipFile ? 'เลือกไฟล์อื่น' : 'เลือกรูปสลิป'}
                <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
              </label>

              {slipFile && (
                <div className="bg-white rounded-2xl p-2 border-4 border-white">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-16 rounded-xl bg-cover bg-center border-2 border-white" style={{ backgroundImage: `url(${slipFile})` }} />
                    <p className="font-display text-sm text-[#2b1d57] flex-1">พร้อมตรวจ</p>
                    <button onClick={() => setSlipFile(null)} className="p-1 text-[#ff5a6a]"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              )}

              {error && <p className="text-xs font-bold text-[#ff5a6a] text-center">{error}</p>}

              <motion.button
                whileTap={slipFile && !busy ? { scale: 0.97 } : {}}
                onClick={verify}
                disabled={!slipFile || busy}
                className={cn(
                  'kid-btn w-full py-4 text-xl font-display gap-2',
                  slipFile && !busy ? 'text-white' : 'bg-white/60 text-[#2b1d57]/30 cursor-not-allowed'
                )}
                style={slipFile && !busy ? { background: 'linear-gradient(160deg, #5ddc7e, #4cc9ff)' } : undefined}
              >
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> ยืนยันสลิป</>}
              </motion.button>
            </div>
          </div>
        )}

        {step === 'verify' && (
          <div className="kid-card p-8 flex flex-col items-center gap-3 text-center">
            <Mascot mood="think" size={100} />
            <Loader2 className="w-10 h-10 animate-spin text-[#9b6dff]" />
            <p className="font-display text-xl text-[#2b1d57]">กำลังตรวจสลิป...</p>
            <p className="text-xs text-[#2b1d57]/60">ใช้ SlipOK ตรวจของจริง · 5 วิ</p>
          </div>
        )}

        {step === 'done' && selected && (
          <div className="kid-card p-5 flex flex-col items-center gap-3 text-center">
            <Mascot mood="cheer" size={130} />
            <h2 className="font-display text-3xl text-[#2b1d57]">โอนสำเร็จ!</h2>
            {isCoinPack(selected) && (
              <div className="flex items-center gap-2 bg-[#ffd23f]/20 border-4 border-[#ffd23f] rounded-3xl px-5 py-3">
                <Coins className="w-7 h-7 text-[#ffd23f]" />
                <span className="font-display text-3xl text-[#2b1d57] tabular-nums">+{(selected.coins + selected.bonus).toLocaleString()}</span>
              </div>
            )}
            <p className="text-sm text-[#2b1d57]/60">เหรียญตอนนี้ · {state.coins.toLocaleString()}</p>

            <Link
              href="/"
              className="kid-btn w-full mt-3 py-4 text-xl font-display text-white"
              style={{ background: 'linear-gradient(160deg, #5ddc7e, #4cc9ff)' }}
            >
              กลับหน้าหลัก
            </Link>
            <button onClick={reset} className="text-sm font-bold text-[#2b1d57]/50 underline">ซื้ออีก</button>
          </div>
        )}
      </div>
    </main>
  );
}
