import { describe, expect, it } from 'vitest';
import {
  ALL_CODES,
  botGuess,
  consistentCodes,
  eliminatedFromGuesses,
  hitsOf,
  isValidCode,
  roundPoints,
  type Code,
  type Difficulty,
  type Guess,
} from './logic';

describe('logic', () => {
  it('900 ta kod bor va hech biri 0 bilan boshlanmaydi', () => {
    expect(ALL_CODES).toHaveLength(900);
    expect(ALL_CODES.every((c) => c[0] !== 0)).toBe(true);
  });

  it('0 o\'rtada va oxirida kelishi mumkin, boshida emas', () => {
    expect(isValidCode([1, 0, 0])).toBe(true);
    expect(isValidCode([0, 8, 9])).toBe(false);
    expect(isValidCode([0, 0, 1])).toBe(false);
  });

  it('faqat o\'z ustunidagi mos raqamlar sanaladi', () => {
    expect(hitsOf([4, 5, 6], [4, 5, 6])).toBe(3);
    expect(hitsOf([4, 5, 6], [5, 6, 4])).toBe(0);
    expect(hitsOf([2, 5, 3], [4, 5, 6])).toBe(1);
  });

  it('0 natijali taxmin raqamlarni ustunlardan chiqaradi', () => {
    const el = eliminatedFromGuesses([
      { code: [1, 2, 3], hits: 0 },
      { code: [4, 5, 6], hits: 1 },
    ]);
    expect(el[0][1]).toBe(true);
    expect(el[1][2]).toBe(true);
    expect(el[2][3]).toBe(true);
    expect(el[0][4]).toBe(false);
  });

  it.each<Difficulty>(['easy', 'medium', 'hard'])('kompyuter (%s) kodni topadi', (d) => {
    const secrets: Code[] = [[1, 0, 0], [9, 9, 9], [4, 0, 7], [2, 5, 0]];
    for (const secret of secrets) {
      const history: Guess[] = [];
      let found = 0;
      for (let i = 1; i <= 60 && !found; i++) {
        const g = botGuess(d, history);
        expect(isValidCode(g)).toBe(true);
        const hits = hitsOf(secret, g);
        history.push({ code: g, hits });
        if (hits === 3) found = i;
      }
      expect(found).toBeGreaterThan(0);
      expect(consistentCodes(history)).toContainEqual(secret);
    }
  });

  it('qiyin rejim o\'rtacha tez topadi', () => {
    let total = 0;
    const n = 25;
    for (let k = 0; k < n; k++) {
      const secret = ALL_CODES[Math.floor(Math.random() * 900)];
      const history: Guess[] = [];
      for (;;) {
        const g = botGuess('hard', history);
        const hits = hitsOf(secret, g);
        history.push({ code: g, hits });
        if (hits === 3) break;
      }
      total += history.length;
    }
    // 900 ta kod, har taxmin 0-3 oralig'ida javob beradi: ~9 ta taxmin nazariy chegaraga yaqin
    expect(total / n).toBeLessThan(12);
  });

  it('ochko tezlikka qarab oshadi', () => {
    expect(roundPoints(3)).toBe(170);
    expect(roundPoints(12)).toBe(100);
  });
});
