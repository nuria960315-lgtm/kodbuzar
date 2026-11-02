import { useSyncExternalStore } from 'react';
import type { Code, Difficulty } from '../game/logic';
import type { Mode, RoundRecord } from '../game/match';

export type ThemeId = 'ocean' | 'violet' | 'sunset';
export type Lang = 'uz' | 'ru' | 'en';

/** Qurilma tiliga qarab boshlang'ich til; boshqa tillar uchun o'zbekcha. */
export function detectLang(): Lang {
  try {
    const l = (navigator.language || '').toLowerCase();
    if (l.startsWith('ru')) return 'ru';
    if (l.startsWith('en')) return 'en';
  } catch {
    /* til aniqlanmadi */
  }
  return 'uz';
}

export interface MatchRecord {
  id: string;
  date: number;
  mode: Mode;
  difficulty: Difficulty;
  names: [string, string];
  wins: [number, number];
  points: [number, number];
  winner: 0 | 1;
  rounds: RoundRecord[];
}

export interface Settings {
  theme: ThemeId;
  sound: boolean;
  vibrate: boolean;
  name: string;
  lang: Lang;
}

interface Store {
  settings: Settings;
  history: MatchRecord[];
}

const KEY = 'kodbuzar:v1';
const defaults: Store = {
  settings: { theme: 'ocean', sound: true, vibrate: true, name: '', lang: detectLang() },
  history: [],
};

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<Store>;
    const settings = { ...defaults.settings, ...parsed.settings };
    // eski versiyadagi standart ism endi tilga qarab ko'rsatiladi
    if (settings.name === "O'yinchi") settings.name = '';
    return {
      settings,
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return defaults;
  }
}

let state: Store = load();
const listeners = new Set<() => void>();

function commit(next: Store) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* xotira to'la yoki bloklangan: o'yin baribir ishlayveradi */
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useStore = () => useSyncExternalStore(subscribe, () => state);
export const getSettings = () => state.settings;
export const setSettings = (patch: Partial<Settings>) =>
  commit({ ...state, settings: { ...state.settings, ...patch } });
export const addMatch = (rec: MatchRecord) =>
  commit({ ...state, history: [rec, ...state.history].slice(0, 100) });
export const clearHistory = () => commit({ ...state, history: [] });

export const fmtCode = (c: Code) => c.join('');
