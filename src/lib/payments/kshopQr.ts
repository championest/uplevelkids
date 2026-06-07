// KShop / PromptPay dynamic-amount QR generator (EMVCo merchant payload).
// Ported from up-level-leaderboard/assets/kshop-qr.js — same merchant TLV so
// payments land in the same Up Level account, and SlipOK verification matches.

const KSHOP_MERCHANT_TLV =
  '30810016A00000067701011201150107536000315010214KB0000020931520320KPS004KB00000209315231690016A00000067701011301030040214KB0000020931520420KPS004KB000002093152';

function crc16(s: string): string {
  let crc = 0xffff;
  for (let i = 0; i < s.length; i++) {
    crc ^= s.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/** Build EMVCo payload with Tag 54 (amount) so each QR is unique per amount. */
export function buildKShopPayload(amount: number): string {
  const amt = Number(amount).toFixed(2);
  const amtField = '54' + String(amt.length).padStart(2, '0') + amt;
  const payload = '000201010212' + KSHOP_MERCHANT_TLV + '5303764' + amtField + '5802TH6304';
  return payload + crc16(payload);
}
