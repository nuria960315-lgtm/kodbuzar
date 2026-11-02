import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { getSettings } from './storage';

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (!getSettings().sound) return null;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.12, slideTo?: number) {
  const a = ac();
  if (!a) return;
  const t0 = a.currentTime + start;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(a.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

export const vibrate = (ms: number | number[]) => {
  if (!getSettings().vibrate) return;
  try {
    if (Capacitor.isNativePlatform()) {
      // iOS WebView navigator.vibrate ni qo'llamaydi, shuning uchun native haptics
      const strong = Array.isArray(ms) || ms >= 20;
      void Haptics.impact({ style: strong ? ImpactStyle.Medium : ImpactStyle.Light }).catch(() => undefined);
      return;
    }
    navigator.vibrate?.(ms);
  } catch {
    /* qo'llab-quvvatlanmaydi */
  }
};

export const sfx = {
  tap: () => {
    tone(620, 0, 0.07, 'sine', 0.08);
    vibrate(8);
  },
  tick: () => {
    tone(1100, 0, 0.03, 'triangle', 0.05);
    vibrate(4);
  },
  send: () => tone(380, 0, 0.12, 'sine', 0.1, 760),
  good: (n: number) => {
    for (let i = 0; i < n; i++) tone(520 + i * 180, i * 0.09, 0.2, 'sine', 0.12);
    vibrate(20);
  },
  bad: () => {
    tone(260, 0, 0.22, 'sawtooth', 0.06, 130);
    vibrate([30, 40, 30]);
  },
  unlock: () => {
    tone(700, 0, 0.1, 'triangle', 0.1);
    tone(1050, 0.08, 0.16, 'triangle', 0.1);
  },
  win: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.3, 'sine', 0.13));
    vibrate([40, 30, 80]);
  },
  lose: () => {
    [392, 330, 262].forEach((f, i) => tone(f, i * 0.16, 0.3, 'triangle', 0.1));
  },
};
