// Play Market: 512x512 ikonka va 1024x500 banner (feature graphic), 3 tilda.
// Matn Manrope shriftidan (OFL) yo'llarga aylantiriladi, shuning uchun tizim shriftiga bog'liq emas.
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import opentype from 'opentype.js';
import sharp from 'sharp';
import { defs, lock, star, oceanPalette } from '../src/components/logoMarkup.ts';

const dir = 'node_modules/@fontsource/manrope/files';
const load = (script, w) => {
  const b = readFileSync(`${dir}/manrope-${script}-${w}-normal.woff`);
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};
const fonts = {
  800: [load('latin', 800), load('cyrillic', 800)],
  700: [load('latin', 700), load('cyrillic', 700)],
};

/** Matnni SVG yo'liga aylantiradi; bo'lmagan harfni ikkinchi shriftdan oladi. */
function textPath(text, x, y, size, weight = 800, spacing = 0) {
  let cx = x;
  const d = [];
  for (const ch of text) {
    const font = fonts[weight].find((f) => f.charToGlyph(ch).index !== 0) ?? fonts[weight][0];
    const g = font.charToGlyph(ch);
    d.push(g.getPath(cx, y, size).toPathData(2));
    cx += (g.advanceWidth * size) / font.unitsPerEm + spacing;
  }
  return { d: d.join(' '), width: cx - x - spacing };
}

/** Maksimal kenglikka sig'maguncha shriftni kichraytiradi. */
function fit(text, x, y, size, weight, maxW, spacing = 0) {
  let s = size;
  let t = textPath(text, x, y, s, weight, spacing);
  while (t.width > maxW && s > 12) {
    s -= 1;
    t = textPath(text, x, y, s, weight, spacing);
  }
  return t;
}

const c = oceanPalette;
const id = 'f';
const W = 1024;
const H = 500;

const logoAt = (cx, cy, size) => `
  <g transform="translate(${cx - size / 2} ${cy - size / 2}) scale(${size / 120})">
    ${lock(id, true)}${star(id, 98, 27, 14)}${star(id, 18, 47, 9)}${star(id, 103, 83, 7.5)}
  </g>`;

const pill = (x, y, code, hits) => {
  const w = 156;
  const h = 52;
  const good = hits > 0;
  const digits = textPath(code, x + 20, y + 36, 28, 800, 3);
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="26" fill="url(#pillG)" stroke="#fff" stroke-opacity="0.55" stroke-width="1.5"/>
    <rect x="${x + 8}" y="${y + 3}" width="${w - 16}" height="20" rx="10" fill="#fff" fill-opacity="0.16"/>
    <path d="${digits.d}" fill="#fff"/>
    <circle cx="${x + w - 26}" cy="${y + h / 2}" r="21" fill="url(#${good ? 'okG' : 'noG'})" stroke="#fff" stroke-opacity="0.85" stroke-width="2"/>
    <path d="${textPath(String(hits), x + w - 26 - 7, y + h / 2 + 9, 25, 800).d}" fill="#fff"/>`;
};

const T = {
  uz: { tag: '3 xonali kodni top', sub: "Mantiq o'yini · Kompyuterga qarshi yoki 1v1" },
  ru: { tag: 'Угадай трёхзначный код', sub: 'Логическая игра · Против ПК или вдвоём' },
  en: { tag: 'Crack the 3-digit code', sub: 'Logic puzzle · Vs computer or 2 players' },
};

function banner(lang) {
  const t = T[lang];
  const title = fit('KODBUZAR', 64, 196, 96, 800, 540, 2);
  const tag = fit(t.tag, 64, 262, 40, 800, 540);
  const sub = fit(t.sub, 64, 308, 22, 700, 540);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    ${defs(id, c)}
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f9ff"/><stop offset="0.6" stop-color="#dfe9ff"/><stop offset="1" stop-color="#c6d8ff"/></linearGradient>
      <linearGradient id="tg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#52a9ff"/><stop offset="1" stop-color="#1d5cff"/></linearGradient>
      <linearGradient id="pillG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#52a9ff"/><stop offset="1" stop-color="#1d5cff"/></linearGradient>
      <radialGradient id="okG" cx="0.35" cy="0.25" r="0.8"><stop offset="0" stop-color="#5ff0a4"/><stop offset="1" stop-color="#00c46a"/></radialGradient>
      <radialGradient id="noG" cx="0.35" cy="0.25" r="0.8"><stop offset="0" stop-color="#ff8a8a"/><stop offset="1" stop-color="#ff3b4a"/></radialGradient>
      <filter id="blur"><feGaussianBlur stdDeviation="46"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <g filter="url(#blur)" opacity="0.95">
      <circle cx="120" cy="60" r="150" fill="#b6d0ff"/>
      <circle cx="900" cy="470" r="170" fill="#d9ccff"/>
      <circle cx="560" cy="520" r="130" fill="#bff0ff"/>
    </g>
    ${logoAt(815, 252, 450)}
    ${star(id, 612, 70, 26)}${star(id, 960, 450, 20)}${star(id, 575, 430, 14)}
    <path d="${title.d}" fill="url(#tg)"/>
    <path d="${tag.d}" fill="#0b1030"/>
    <path d="${sub.d}" fill="#6a7498"/>
    ${pill(64, 366, '407', 1)}${pill(240, 366, '123', 0)}${pill(416, 366, '982', 3)}
  </svg>`;
}

for (const lang of ['uz', 'ru', 'en']) {
  mkdirSync(`store/${lang}`, { recursive: true });
  // Play bannerda alfa kanal bo'lmasligi kerak
  await sharp(Buffer.from(banner(lang)), { density: 72 }).flatten({ background: '#ffffff' }).png().toFile(`store/${lang}/feature-graphic-1024x500.png`);
  console.log('banner', lang);
}

// 512x512 ikonka (to'liq kvadrat, Google o'zi yumaloqlaydi)
await sharp('assets/icon-only.png').resize(512, 512).png().toFile('store/icon-512.png');
copyFileSync('store/icon-512.png', 'store/en/icon-512.png');
console.log('icon 512');
