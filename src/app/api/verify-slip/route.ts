import { NextRequest, NextResponse } from 'next/server';

// SlipOK API endpoint — same Up Level merchant account as guild/marketplace.
const SLIPOK_URL = 'https://api.slipok.com/api/line/apikey/58927';
const SLIPOK_API_KEY = process.env.SLIPOK_API_KEY || 'SLIPOKE2TSLQJ';

export async function POST(req: NextRequest) {
  try {
    const { slipImage, amount } = await req.json();

    if (!slipImage) {
      return NextResponse.json({ success: false, error: 'missing slipImage' }, { status: 400 });
    }

    const base64Data = slipImage.includes(',') ? slipImage.split(',').pop() : slipImage;

    const upstream = await fetch(SLIPOK_URL, {
      method: 'POST',
      headers: {
        'x-authorization': SLIPOK_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ files: base64Data, log: true, amount: amount || 0 }),
    });

    const rawText = await upstream.text();
    let result: Record<string, unknown> & { success?: boolean; data?: unknown; code?: number };
    try {
      result = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        { success: false, error: 'SlipOK returned non-JSON', details: rawText.slice(0, 500) },
        { status: 502 }
      );
    }

    // Treat duplicate-but-valid (1004/1012) as success — slip was authentic, just already submitted.
    if (!result.success && result.data && (result.code === 1004 || result.code === 1012)) {
      return NextResponse.json({ ...result, success: true, duplicate: true });
    }

    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
