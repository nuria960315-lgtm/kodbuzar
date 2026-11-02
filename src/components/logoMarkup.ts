// 3D shisha qulf + shisha yuldozlar. Bu modul ham ilova (React), ham ikonka/splash
// generatori (node, scripts/make-assets.mjs) tomonidan ishlatiladi, shuning uchun
// faqat oddiy TypeScript (type annotationlar) ishlatilgan.

export interface Palette {
  p: string;
  p2: string;
  pd: string;
}

/** Ilovada rang mavzudan olinadi, ikonkada qat'iy ranglar beriladi. */
export const themePalette: Palette = { p: 'var(--p)', p2: 'var(--p2)', pd: 'var(--p)' };
export const oceanPalette: Palette = { p: '#1d5cff', p2: '#52a9ff', pd: '#0a2fb8' };

const stop = (o: number, color: string, op = 1) =>
  `<stop offset="${o}" style="stop-color:${color};stop-opacity:${op}"/>`;

const starPoints = (cx: number, cy: number, R: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = ((-90 + i * 36) * Math.PI) / 180;
    const rad = i % 2 ? r : R;
    return `${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`;
  }).join(' ');

/** Umumiy gradientlar va soya filtrlari. */
export function defs(id: string, c: Palette): string {
  return `<defs>
    <linearGradient id="${id}body" x1="0.05" y1="0" x2="0.85" y2="1">${stop(0, c.p2)}${stop(0.5, c.p)}${stop(1, c.pd)}</linearGradient>
    <linearGradient id="${id}metal" x1="0" y1="0" x2="1" y2="0">${stop(0, '#8e9bbd')}${stop(0.22, '#ffffff')}${stop(0.5, '#cdd6ee')}${stop(0.78, '#ffffff')}${stop(1, '#8b98bb')}</linearGradient>
    <linearGradient id="${id}hi" x1="0" y1="0" x2="0" y2="1">${stop(0, '#ffffff', 0.8)}${stop(1, '#ffffff', 0)}</linearGradient>
    <radialGradient id="${id}glow" cx="0.5" cy="1.05" r="0.75">${stop(0, '#ffffff', 0.38)}${stop(1, '#ffffff', 0)}</radialGradient>
    <linearGradient id="${id}check" x1="0" y1="0" x2="1" y2="1">${stop(0, '#ffffff')}${stop(1, '#d9e5ff')}</linearGradient>
    <linearGradient id="${id}star" x1="0.1" y1="0" x2="0.9" y2="1">${stop(0, '#ffffff', 0.95)}${stop(0.45, c.p2, 0.82)}${stop(1, c.p, 0.9)}</linearGradient>
    <filter id="${id}sh" x="-40%" y="-30%" width="180%" height="190%"><feDropShadow dx="0" dy="5" stdDeviation="3.6" flood-color="#0a1f8a" flood-opacity="0.38"/></filter>
    <filter id="${id}ss" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="2.5" stdDeviation="2" flood-color="#0a1f8a" flood-opacity="0.3"/></filter>
  </defs>`;
}

/** Shisha yuldoz: oq hoshiyali, yumaloq uchli, yaltiroq. cx, cy markaz, R tashqi radius. */
export function star(id: string, cx: number, cy: number, R: number, cls = ''): string {
  const w = R * 0.42;
  const outer = starPoints(cx, cy, R * 0.74, R * 0.38);
  const gloss = starPoints(cx - R * 0.1, cy - R * 0.14, R * 0.4, R * 0.2);
  return `<g class="${cls}" filter="url(#${id}ss)">
    <polygon points="${outer}" fill="none" stroke="#fff" stroke-opacity="0.9" stroke-width="${(w + 1.6).toFixed(2)}" stroke-linejoin="round"/>
    <polygon points="${outer}" fill="url(#${id}star)" stroke="url(#${id}star)" stroke-width="${w.toFixed(2)}" stroke-linejoin="round"/>
    <polygon points="${gloss}" fill="#fff" fill-opacity="0.55" stroke="#fff" stroke-opacity="0.55" stroke-width="${(R * 0.1).toFixed(2)}" stroke-linejoin="round"/>
  </g>`;
}

/** Qulf (120x120 koordinatada, markaz x=60). withCheck: ichida oq galochka. */
export function lock(id: string, withCheck: boolean): string {
  return `<g filter="url(#${id}sh)">
    <path d="M42 57 V42 a18 18 0 0 1 36 0 V57" fill="none" stroke="url(#${id}metal)" stroke-width="9.5" stroke-linecap="round"/>
    <path d="M45.4 56 V42 a14.6 14.6 0 0 1 14.6-14.6" fill="none" stroke="#fff" stroke-opacity="0.85" stroke-width="2.2" stroke-linecap="round"/>
    <rect x="29" y="53" width="62" height="52" rx="16" fill="url(#${id}body)"/>
    <rect x="29" y="53" width="62" height="52" rx="16" fill="url(#${id}glow)"/>
    <rect x="32.5" y="56" width="55" height="24" rx="12.5" fill="url(#${id}hi)"/>
    <rect x="29.6" y="53.6" width="60.8" height="50.8" rx="15.4" fill="none" stroke="#fff" stroke-opacity="0.6" stroke-width="1.3"/>
    <ellipse cx="41" cy="65" rx="6.5" ry="2.8" transform="rotate(-24 41 65)" fill="#fff" fill-opacity="0.85"/>
    ${
      withCheck
        ? `<path d="M45 81 L56 92 L77 69" fill="none" stroke="#0a1f8a" stroke-opacity="0.28" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 2.2)"/>
    <path d="M45 81 L56 92 L77 69" fill="none" stroke="url(#${id}check)" stroke-width="8.6" stroke-linecap="round" stroke-linejoin="round"/>`
        : `<circle cx="60" cy="76" r="5.4" fill="#fff" fill-opacity="0.92"/><rect x="57.8" y="77" width="4.4" height="12" rx="2.2" fill="#fff" fill-opacity="0.92"/>`
    }
  </g>`;
}

/** To'liq logotip: qulf + galochka + uchta yuldoz (viewBox 0 0 120 120). */
export function logoMarkup(id: string, c: Palette): string {
  return `${defs(id, c)}${lock(id, true)}
    ${star(id, 98, 27, 14, 'lg-star s1')}
    ${star(id, 18, 47, 9, 'lg-star s2')}
    ${star(id, 103, 83, 7.5, 'lg-star s3')}`;
}

/** Faqat qulf (fon bezagi). viewBox 0 0 120 120. */
export function lockMarkup(id: string, c: Palette): string {
  return `${defs(id, c)}${lock(id, false)}`;
}

/** Faqat yuldoz (fon bezagi). viewBox 0 0 100 100. */
export function starMarkup(id: string, c: Palette): string {
  return `${defs(id, c)}${star(id, 50, 50, 50)}`;
}
