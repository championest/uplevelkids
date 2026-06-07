'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { buildKShopPayload } from '@/lib/payments/kshopQr';

interface Props {
  amount: number;
  size?: number;
}

export default function PaymentQR({ amount, size = 240 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const payload = buildKShopPayload(amount);
    QRCode.toCanvas(canvasRef.current, payload, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#2b1d57', light: '#ffffff' },
    }).catch(() => {});
  }, [amount, size]);

  return (
    <div
      className="bg-white rounded-3xl p-4 border-4 border-white shadow-[0_8px_0_rgba(155,109,255,0.3)] inline-block"
      style={{ minWidth: size + 32 }}
    >
      <div className="text-center mb-2">
        <p className="font-display text-xs text-[#9b6dff] tracking-widest">KSHOP / PROMPT PAY</p>
      </div>
      <canvas ref={canvasRef} width={size} height={size} className="rounded-2xl" />
      <div className="text-center mt-2">
        <p className="font-display text-xl text-[#2b1d57] tabular-nums">฿{amount.toFixed(2)}</p>
      </div>
    </div>
  );
}
