'use client';

let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const W = window as Window & { webkitAudioContext?: typeof AudioContext };
    const AC = window.AudioContext || W.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

function tone(freq: number, durationMs: number, type: OscillatorType = 'sine', gain = 0.18, startOffset = 0) {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + startOffset;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + durationMs / 1000);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + durationMs / 1000);
}

export function playCorrect() {
  tone(660, 90, 'triangle', 0.18, 0);
  tone(880, 140, 'triangle', 0.18, 0.07);
}

export function playWrong() {
  tone(200, 180, 'sawtooth', 0.12, 0);
  tone(150, 200, 'sawtooth', 0.1, 0.06);
}

export function playTap() {
  tone(520, 50, 'sine', 0.08, 0);
}

export function playCoin() {
  tone(880, 70, 'triangle', 0.18, 0);
  tone(1320, 90, 'triangle', 0.18, 0.05);
}

export function playLevelUp() {
  tone(523, 120, 'triangle', 0.2, 0);
  tone(659, 120, 'triangle', 0.2, 0.1);
  tone(784, 120, 'triangle', 0.2, 0.2);
  tone(1047, 220, 'triangle', 0.2, 0.3);
}

export function playStreak(streak: number) {
  const base = 660 + Math.min(streak, 12) * 30;
  tone(base, 90, 'triangle', 0.18, 0);
  tone(base * 1.5, 140, 'triangle', 0.18, 0.07);
}

export function setMuted(m: boolean) { muted = m; }
export function isMuted() { return muted; }
