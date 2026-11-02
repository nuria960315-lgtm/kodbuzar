// Ikonka va splash manba rasmlarini yaratadi: node scripts/make-assets.mjs
// So'ng: npx capacitor-assets generate --android --ios
// (Node 22.18+ da .ts ni to'g'ridan-to'g'ri import qiladi.)
import { mkdirSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { defs, lock, star, oceanPalette } from '../src/components/logoMarkup.ts';

mkdirSync('assets', { recursive: true });
const c = oceanPalette;
const id = 'k';

/** 120x120 logotip (qulf + 3 yuldoz), markazi (cx, cy), kengligi size piksel. */
const logoAt = (cx, cy, size) => `
  <g transform="translate(${cx - size / 2} ${cy - size / 2}) scale(${size / 120})">
    ${lock(id, true)}
    ${star(id, 98, 27, 14)}${star(id, 18, 47, 9)}${star(id, 103, 83, 7.5)}
  </g>`;

const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    ${defs(id, c)}
    <defs>
      <linearGradient id="bgL" x1="0.1" y1="0" x2="0.9" y2="1"><stop offset="0" stop-color="#f4f8ff"/><stop offset="0.6" stop-color="#dbe7ff"/><stop offset="1" stop-color="#c3d6ff"/></linearGradient>
      <filter id="blur"><feGaussianBlur stdDeviation="90"/></filter>
    </defs>${body}</svg>`;

const lightBg = (S) => `
  <rect width="${S}" height="${S}" fill="url(#bgL)"/>
  <g filter="url(#blur)" opacity="0.9">
    <circle cx="${S * 0.18}" cy="${S * 0.2}" r="${S * 0.2}" fill="#b6d0ff"/>
    <circle cx="${S * 0.85}" cy="${S * 0.6}" r="${S * 0.17}" fill="#d9ccff"/>
    <circle cx="${S * 0.4}" cy="${S * 0.95}" r="${S * 0.2}" fill="#bff0ff"/>
  </g>`;

const iconOnly = svg(1024, 1024, `${lightBg(1024)}${logoAt(512, 520, 800)}`);
const iconBg = svg(1024, 1024, lightBg(1024));
const iconFg = svg(1024, 1024, logoAt(512, 520, 580));

const S = 2732;
const splash = svg(
  S,
  S,
  `${lightBg(S)}
   ${star(id, 380, 520, 150)}${star(id, 2330, 400, 110)}${star(id, 2260, 2250, 170)}${star(id, 470, 2150, 100)}${star(id, 1980, 1550, 70)}
   ${logoAt(S / 2, S / 2, 1300)}`,
);

const out = [
  ['assets/icon-only.png', iconOnly, 1024],
  ['assets/icon-background.png', iconBg, 1024],
  ['assets/icon-foreground.png', iconFg, 1024],
  ['assets/splash.png', splash, S],
  ['assets/splash-dark.png', splash, S],
];
for (const [file, markup, size] of out) {
  await sharp(Buffer.from(markup), { density: 72 }).resize(size, size).png().toFile(file);
  console.log('yozildi', file);
}
writeFileSync('assets/icon.svg', iconOnly);
