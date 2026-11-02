export type Code = [number, number, number];
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Guess {
  code: Code;
  hits: number;
}

/** Barcha mumkin kodlar: birinchi raqam 1-9, qolgan ikkitasi 0-9 (900 ta). */
export const ALL_CODES: Code[] = (() => {
  const out: Code[] = [];
  for (let a = 1; a <= 9; a++)
    for (let b = 0; b <= 9; b++) for (let c = 0; c <= 9; c++) out.push([a, b, c]);
  return out;
})();

export const isValidCode = (c: Code) =>
  c[0] >= 1 && c[0] <= 9 && c.every((d) => Number.isInteger(d) && d >= 0 && d <= 9);

export const codeKey = (c: Code) => c.join('');

export const randomCode = (): Code => ALL_CODES[Math.floor(Math.random() * ALL_CODES.length)];

/** Taxmin va maxfiy kodning o'z ustuni bo'yicha nechta raqami mos kelishi. */
export const hitsOf = (secret: Code, guess: Code): number =>
  (secret[0] === guess[0] ? 1 : 0) + (secret[1] === guess[1] ? 1 : 0) + (secret[2] === guess[2] ? 1 : 0);

/** Qaysi ustunda qaysi raqamlar "chiqib ketgani": 0 natija bergan taxminlardan. */
export function eliminatedFromGuesses(guesses: Guess[]): boolean[][] {
  const out = [0, 1, 2].map(() => Array<boolean>(10).fill(false));
  for (const g of guesses) if (g.hits === 0) g.code.forEach((d, i) => (out[i][d] = true));
  return out;
}

/** Hozirgi taxminlarga zid kelmaydigan kodlar. */
export function consistentCodes(history: Guess[]): Code[] {
  return ALL_CODES.filter((c) => history.every((g) => hitsOf(c, g.code) === g.hits));
}

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/** Eng yomon holatda qoladigan nomzodlar sonini kamaytiradigan taxmin. */
function bestSplit(cands: Code[]): Code {
  if (cands.length <= 2) return cands[0];
  const isCand = new Set(cands.map(codeKey));
  let best = cands[0];
  let bestScore = Infinity;
  for (const g of ALL_CODES) {
    const buckets = [0, 0, 0, 0];
    for (const c of cands) buckets[hitsOf(c, g)]++;
    const score = buckets.reduce((s, b) => s + b * b, 0) + (isCand.has(codeKey(g)) ? 0 : 0.5);
    if (score < bestScore) {
      bestScore = score;
      best = g;
    }
  }
  return best;
}

/** Kompyuterning keyingi taxmini. */
export function botGuess(difficulty: Difficulty, history: Guess[]): Code {
  const tried = new Set(history.map((g) => codeKey(g.code)));
  const cands = consistentCodes(history).filter((c) => !tried.has(codeKey(c)));
  const pool = cands.length ? cands : ALL_CODES.filter((c) => !tried.has(codeKey(c)));
  if (difficulty === 'hard') return history.length === 0 ? randomCode() : bestSplit(pool);
  // o'rta: ko'pincha mantiqli, ba'zan xato qiladi; oson: ko'pincha tasodifiy
  const logical = difficulty === 'medium' ? 0.65 : 0.35;
  return Math.random() < logical ? pick(pool) : pick(ALL_CODES.filter((c) => !tried.has(codeKey(c))));
}

/** Raund g'olibi uchun ochko: 100 + tezlik bonusi. */
export const roundPoints = (guessCount: number) => 100 + Math.max(0, 10 - guessCount) * 10;
export const MATCH_BONUS = 50;
