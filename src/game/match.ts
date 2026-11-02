import {
  MATCH_BONUS,
  hitsOf,
  isValidCode,
  roundPoints,
  type Code,
  type Difficulty,
  type Guess,
} from './logic';

export type Mode = 'bot' | 'duo';
export type Idx = 0 | 1;
export type Phase = 'secret' | 'handoff' | 'play' | 'turnEnd' | 'roundEnd' | 'matchEnd';

export const WINS_NEEDED = 2;
export const MAX_ROUNDS = 3;

export interface RoundRecord {
  secrets: [Code, Code];
  winner: Idx;
  guesses: [number, number];
  points: [number, number];
}

export interface Match {
  mode: Mode;
  difficulty: Difficulty;
  names: [string, string];
  round: number;
  starter: Idx;
  turn: Idx;
  /** Telefon hozir kimning qo'lida (1v1 uchun). */
  holder: Idx;
  phase: Phase;
  /** Maxfiy kod kiritilayotgan o'yinchi. */
  secretFor: Idx;
  /** 'handoff' fazasida telefon kimga berilishi kerak va keyin nima bo'ladi. */
  handoffTo: Idx;
  after: 'secret' | 'play';
  /** secrets[i] — i-o'yinchining o'z maxfiy kodi. */
  secrets: [Code | null, Code | null];
  /** guesses[i] — i-o'yinchining raqib kodiga qilgan taxminlari. */
  guesses: [Guess[], Guess[]];
  /** Qo'lda qizil belgilangan raqamlar: manual[i][ustun][raqam]. */
  manual: [boolean[][], boolean[][]];
  wins: [number, number];
  points: [number, number];
  rounds: RoundRecord[];
  roundPointsGiven: [number, number];
  winner: Idx | null;
}

export type Action =
  | { type: 'SECRET'; player: Idx; code: Code; botCode?: Code }
  | { type: 'GUESS'; code: Code }
  | { type: 'READY' }
  | { type: 'NEXT_TURN' }
  | { type: 'NEXT_ROUND' }
  | { type: 'TOGGLE_NOTE'; player: Idx; col: number; digit: number };

const emptyNotes = () => [0, 1, 2].map(() => Array<boolean>(10).fill(false));

export function newMatch(mode: Mode, difficulty: Difficulty, names: [string, string]): Match {
  return {
    mode,
    difficulty,
    names,
    round: 1,
    starter: 0,
    turn: 0,
    holder: 0,
    phase: 'secret',
    secretFor: 0,
    handoffTo: 0,
    after: 'secret',
    secrets: [null, null],
    guesses: [[], []],
    manual: [emptyNotes(), emptyNotes()],
    wins: [0, 0],
    points: [0, 0],
    rounds: [],
    roundPointsGiven: [0, 0],
    winner: null,
  };
}

/** 1v1 da telefon boshqa o'yinchiga o'tishi kerak bo'lsa, "uzatish" ekranini qo'yadi. */
function route(m: Match, target: Idx, after: 'secret' | 'play'): Match {
  if (m.mode === 'duo' && m.holder !== target) {
    return { ...m, phase: 'handoff', handoffTo: target, after };
  }
  return { ...m, phase: after, holder: target };
}

export function reduce(m: Match, a: Action): Match {
  switch (a.type) {
    case 'SECRET': {
      if (m.phase !== 'secret' || a.player !== m.secretFor || !isValidCode(a.code)) return m;
      const secrets: [Code | null, Code | null] = [...m.secrets];
      secrets[a.player] = a.code;
      if (m.mode === 'bot') {
        if (!a.botCode || !isValidCode(a.botCode)) return m;
        secrets[1] = a.botCode;
        return { ...m, secrets, phase: 'play', turn: m.starter, holder: 0 };
      }
      if (a.player === 0) {
        return route({ ...m, secrets, secretFor: 1 }, 1, 'secret');
      }
      return route({ ...m, secrets, turn: m.starter }, m.starter, 'play');
    }

    case 'READY':
      if (m.phase !== 'handoff') return m;
      return { ...m, phase: m.after, holder: m.handoffTo };

    case 'GUESS': {
      if (m.phase !== 'play' || !isValidCode(a.code)) return m;
      const target = m.secrets[(1 - m.turn) as Idx];
      if (!target) return m;
      const hits = hitsOf(target, a.code);
      const guesses: [Guess[], Guess[]] = [[...m.guesses[0]], [...m.guesses[1]]];
      guesses[m.turn] = [...guesses[m.turn], { code: a.code, hits }];
      if (hits === 3) return finishRound({ ...m, guesses });
      if (m.mode === 'bot') return { ...m, guesses, turn: (1 - m.turn) as Idx };
      return { ...m, guesses, phase: 'turnEnd' };
    }

    case 'NEXT_TURN': {
      if (m.phase !== 'turnEnd') return m;
      const next = (1 - m.turn) as Idx;
      return route({ ...m, turn: next }, next, 'play');
    }

    case 'NEXT_ROUND': {
      if (m.phase !== 'roundEnd') return m;
      const decided = m.wins[0] >= WINS_NEEDED || m.wins[1] >= WINS_NEEDED || m.round >= MAX_ROUNDS;
      if (decided) {
        const winner: Idx = m.wins[0] > m.wins[1] ? 0 : 1;
        const points: [number, number] = [...m.points];
        points[winner] += MATCH_BONUS;
        return { ...m, phase: 'matchEnd', winner, points };
      }
      const starter = (1 - m.starter) as Idx;
      const fresh: Match = {
        ...m,
        round: m.round + 1,
        starter,
        turn: starter,
        secretFor: 0,
        secrets: [null, null],
        guesses: [[], []],
        manual: [emptyNotes(), emptyNotes()],
        roundPointsGiven: [0, 0],
      };
      return route(fresh, 0, 'secret');
    }

    case 'TOGGLE_NOTE': {
      const manual: [boolean[][], boolean[][]] = [
        m.manual[0].map((c) => [...c]),
        m.manual[1].map((c) => [...c]),
      ];
      manual[a.player][a.col][a.digit] = !manual[a.player][a.col][a.digit];
      return { ...m, manual };
    }
  }
}

function finishRound(m: Match): Match {
  const winner = m.turn;
  const pts = roundPoints(m.guesses[winner].length);
  const wins: [number, number] = [...m.wins];
  const points: [number, number] = [...m.points];
  wins[winner]++;
  points[winner] += pts;
  const given: [number, number] = [0, 0];
  given[winner] = pts;
  const record: RoundRecord = {
    secrets: [m.secrets[0] as Code, m.secrets[1] as Code],
    winner,
    guesses: [m.guesses[0].length, m.guesses[1].length],
    points: given,
  };
  return {
    ...m,
    phase: 'roundEnd',
    wins,
    points,
    roundPointsGiven: given,
    rounds: [...m.rounds, record],
  };
}
