// Elim ustunlaridagi hamma raqam ko'k ustun ichida turganini turli telefon o'lchamlarida tekshiradi.
import puppeteer from 'puppeteer-core';

const URL = process.env.APP_URL || 'http://localhost:5173';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sizes = [[320, 568], [360, 640], [360, 780], [390, 844], [412, 915]];
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-sandbox'] });
let bad = 0;
for (const [w, h] of sizes) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('kodbuzar:v1', JSON.stringify({ settings: { theme: 'ocean', sound: false, vibrate: false, name: 'A', lang: 'ru' }, history: [] }));
  });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await sleep(2200);
  const click = (t) => page.evaluate((x) => [...document.querySelectorAll('button')].find((b) => b.textContent.includes(x))?.click(), t);
  await click('Против компьютера');
  await sleep(1300);
  await click('Начать игру');
  await sleep(4300);
  await click('Спрятать код');
  await sleep(2800);
  const r = await page.evaluate(() => {
    const cols = [...document.querySelectorAll('.elim .col')];
    const out = [];
    cols.forEach((col, ci) => {
      const cb = col.getBoundingClientRect();
      col.querySelectorAll('.cell:not(.ghost)').forEach((cell) => {
        const t = cell.querySelector('span');
        const b = (t || cell).getBoundingClientRect();
        if (b.top < cb.top - 0.5 || b.bottom > cb.bottom + 0.5) out.push(`col${ci} ${cell.textContent}: ${Math.round(b.top)}-${Math.round(b.bottom)} vs ${Math.round(cb.top)}-${Math.round(cb.bottom)}`);
      });
    });
    const sc = document.querySelector('.screen.board');
    return { cols: cols.length, out, font: getComputedStyle(document.querySelector('.elim .cell')).fontSize, scrolls: sc ? sc.scrollHeight - sc.clientHeight : null };
  });
  console.log(`${w}x${h}`, JSON.stringify(r));
  bad += r.out.length;
  await page.close();
}
await browser.close();
console.log(bad ? `XATO: ${bad} ta raqam tashqarida` : 'OK: hamma raqam ustun ichida');
