import { describe, expect, it } from 'vitest';
import { reduce, newMatch, type Match } from './match';
import type { Code } from './logic';

const run = (m: Match, ...actions: Parameters<typeof reduce>[1][]) => actions.reduce(reduce, m);

describe('match', () => {
  it('kompyuterga qarshi: 2 raund yutgan o\'yinchi g\'olib, bonus qo\'shiladi', () => {
    let m = newMatch('bot', 'easy', ['Men', 'Kompyuter']);
    for (let r = 0; r < 2; r++) {
      m = run(m, { type: 'SECRET', player: 0, code: [5, 5, 5], botCode: [1, 2, 3] });
      expect(m.phase).toBe('play');
      // starter navbat bilan almashadi
      if (m.turn === 1) m = run(m, { type: 'GUESS', code: [9, 9, 9] });
      m = run(m, { type: 'GUESS', code: [1, 2, 3] });
      expect(m.phase).toBe('roundEnd');
      m = run(m, { type: 'NEXT_ROUND' });
    }
    expect(m.phase).toBe('matchEnd');
    expect(m.wins[0]).toBe(2);
    expect(m.winner).toBe(0);
    expect(m.points[0]).toBeGreaterThan(200);
  });

  it('1v1: telefon o\'tkaziladi va noto\'g\'ri taxmin o\'yinni tugatmaydi', () => {
    let m = newMatch('duo', 'easy', ['A', 'B']);
    m = run(m, { type: 'SECRET', player: 0, code: [1, 0, 0] });
    expect(m.phase).toBe('handoff');
    expect(m.handoffTo).toBe(1);
    m = run(m, { type: 'READY' });
    expect(m.phase).toBe('secret');
    expect(m.secretFor).toBe(1);
    m = run(m, { type: 'SECRET', player: 1, code: [2, 0, 0] });
    expect(m.phase).toBe('handoff'); // starter 0 ga qaytarish
    m = run(m, { type: 'READY' });
    expect(m.phase).toBe('play');
    expect(m.turn).toBe(0);
    m = run(m, { type: 'GUESS', code: [3, 3, 3] });
    expect(m.phase).toBe('turnEnd');
    m = run(m, { type: 'NEXT_TURN' }, { type: 'READY' });
    expect(m.turn).toBe(1);
    m = run(m, { type: 'GUESS', code: [1, 0, 0] as Code }); // B A ning kodini topdi
    expect(m.phase).toBe('roundEnd');
    expect(m.wins).toEqual([0, 1]);
  });

  it('noto\'g\'ri (0 bilan boshlanadigan) maxfiy kod rad etiladi', () => {
    const m = newMatch('duo', 'easy', ['A', 'B']);
    expect(run(m, { type: 'SECRET', player: 0, code: [0, 1, 2] })).toBe(m);
  });
});
