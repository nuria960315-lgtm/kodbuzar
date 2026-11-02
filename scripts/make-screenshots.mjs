// Play Market skrinshotlari: haqiqiy ilovadan, 3 tilda, 1080x1920.
// Ishlatish: dev serverni (npm run dev -- --port 5173) yoqing, so'ng node scripts/make-screenshots.mjs
import { mkdirSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = process.env.APP_URL || 'http://localhost:5173';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Tugmalarni matni bo'yicha topish uchun: har tildagi yozuvlar
const L = {
  uz: { vs: 'Kompyuterga qarshi', start: "O'yinni boshlash", seal: 'Kodni yashirish', rules: 'Qoidalar', history: 'Tarix', settings: 'Sozlamalar', name: 'Aziz' },
  ru: { vs: 'Против компьютера', start: 'Начать игру', seal: 'Спрятать код', rules: 'Правила', history: 'История', settings: 'Настройки', name: 'Азиз' },
  en: { vs: 'Vs computer', start: 'Start game', seal: 'Hide the code', rules: 'Rules', history: 'History', settings: 'Settings', name: 'Aziz' },
};

const rec = (id, ago, name, diff, wins, pts, winner, rounds) => ({
  id,
  date: Date.now() - ago,
  mode: 'bot',
  difficulty: diff,
  names: [name, ''],
  wins,
  points: pts,
  winner,
  rounds,
});
const R = (s0, s1, w, g0, g1, p) => ({ secrets: [s0, s1], winner: w, guesses: [g0, g1], points: p });

const seedHistory = (name) => [
  rec('a1', 3600e3, name, 'hard', [2, 1], [470, 190], 0, [
    R([4, 0, 7], [2, 5, 1], 0, 6, 7, [140, 0]),
    R([9, 9, 3], [1, 8, 0], 1, 8, 5, [0, 150]),
    R([6, 1, 2], [3, 3, 7], 0, 4, 5, [160, 0]),
  ]),
  rec('a2', 26 * 3600e3, name, 'medium', [2, 0], [420, 0], 0, [
    R([1, 2, 3], [4, 5, 7], 0, 1, 2, [190, 0]),
    R([7, 0, 4], [9, 1, 0], 0, 2, 3, [180, 0]),
  ]),
  rec('a3', 50 * 3600e3, name, 'easy', [1, 2], [210, 300], 1, [
    R([5, 5, 0], [2, 4, 8], 1, 9, 4, [0, 160]),
    R([3, 1, 6], [8, 2, 2], 0, 3, 8, [170, 0]),
    R([2, 9, 9], [1, 0, 5], 1, 7, 5, [0, 140]),
  ]),
];

async function clickText(page, text) {
  const ok = await page.evaluate((t) => {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim().includes(t));
    if (b) b.click();
    return !!b;
  }, text);
  if (!ok) throw new Error('tugma topilmadi: ' + text);
}

const lang = process.argv[2];
const langs = lang ? [lang] : ['uz', 'ru', 'en'];
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });

for (const lg of langs) {
  const dir = `store/${lg}`;
  mkdirSync(dir, { recursive: true });
  const shot = (page, name) => page.screenshot({ path: `${dir}/${name}.png` });
  const T = L[lg];

  const open = async (theme = 'ocean') => {
    const page = await browser.newPage();
    await page.setViewport({ width: 360, height: 640, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    await page.evaluateOnNewDocument(
      (settings, history) => {
        if (!sessionStorage.getItem('seeded')) {
          localStorage.setItem('kodbuzar:v1', JSON.stringify({ settings, history }));
          sessionStorage.setItem('seeded', '1');
        }
      },
      { theme, sound: true, vibrate: true, name: T.name, lang: lg },
      seedHistory(T.name),
    );
    await page.goto(URL, { waitUntil: 'networkidle0' });
    await sleep(2600);
    return page;
  };

  // 1) Bosh sahifa
  let page = await open();
  await shot(page, 'phone-01-home');

  // 2) Boshlanish animatsiyasi (shisha linza sirpanganda)
  await clickText(page, T.vs);
  await sleep(1400);
  await clickText(page, T.start);
  await sleep(1750);
  await shot(page, 'phone-02-intro');

  // 3) Maxfiy kod tanlash
  await sleep(1500);
  await page.evaluate(() => [...document.querySelectorAll('button.icon-btn')].pop()?.click());
  await sleep(1200);
  await shot(page, 'phone-03-secret');

  // 4) O'yin doskasi: bir nechta taxmin
  await clickText(page, T.seal);
  await sleep(2600);
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const turnMine = async () => {
      await sleep(400);
      for (let i = 0; i < 300; i++) {
        const m = window.__kb.m;
        if (m.phase === 'play' && m.turn === 0) return;
        await sleep(100);
      }
    };
    const other = (d, lo, k = 1) => lo + ((d - lo + k) % (10 - lo));
    const S = () => window.__kb.m.secrets[1];
    const zero = (k) => {
      const s = S();
      return [other(s[0], 1, k), other(s[1], 0, k), other(s[2], 0, k)];
    };
    const withHit = (idxs, k) => {
      const s = S();
      const z = zero(k);
      idxs.forEach((i) => (z[i] = s[i]));
      return z;
    };
    const plan = [zero(1), withHit([0], 1), withHit([1], 2), withHit([0, 2], 1), zero(3)];
    await turnMine();
    for (const code of plan) {
      window.__kb.dispatch({ type: 'GUESS', code });
      await turnMine();
    }
    await sleep(900);
  });
  await shot(page, 'phone-04-board');

  // 5) Raund g'alabasi (konfeti)
  await page.evaluate(() => window.__kb.dispatch({ type: 'GUESS', code: window.__kb.m.secrets[1] }));
  await page.waitForSelector('.overlay .sheet', { timeout: 12000 });
  await sleep(1650);
  await shot(page, 'phone-05-win');
  await page.close();

  // 6) Tarix, 7) Qoidalar, 8) Mavzular (Sozlamalar, Quyosh mavzusi)
  page = await open();
  await clickText(page, T.history);
  await sleep(1700);
  await page.evaluate(() => document.querySelector('.hist-item')?.click());
  await sleep(900);
  await shot(page, 'phone-06-history');
  await page.close();

  page = await open('violet');
  await clickText(page, T.rules);
  await sleep(2200);
  await shot(page, 'phone-07-rules');
  await page.close();

  page = await open('sunset');
  await clickText(page, T.settings);
  await sleep(1800);
  await shot(page, 'phone-08-themes');
  await page.close();

  console.log(lg, 'tayyor');
}
await browser.close();
