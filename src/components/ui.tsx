import {
  animate,
  AnimatePresence,
  motion,
  type HTMLMotionProps,
} from 'framer-motion';
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Code } from '../game/logic';
import { LANGS, useT } from '../lib/i18n';
import { sfx } from '../lib/sfx';
import { setSettings, useStore } from '../lib/storage';
import { logoMarkup, lockMarkup, starMarkup, themePalette } from './logoMarkup';

export const spring = { type: 'spring', stiffness: 420, damping: 26 } as const;
export const softSpring = { type: 'spring', stiffness: 160, damping: 20 } as const;

/* ---------- shisha qulf, yuldoz va logotip ---------- */
const cleanId = (raw: string) => raw.replace(/:/g, '');

export function GlassLock({ size = 120 }: { size?: number }) {
  const id = cleanId(useId());
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      style={{ overflow: 'visible' }}
      dangerouslySetInnerHTML={{ __html: lockMarkup(id, themePalette) }}
    />
  );
}

export function GlassStar({ size = 40 }: { size?: number }) {
  const id = cleanId(useId());
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ overflow: 'visible' }}
      dangerouslySetInnerHTML={{ __html: starMarkup(id, themePalette) }}
    />
  );
}

export function Logo({ size = 150 }: { size?: number }) {
  const id = cleanId(useId());
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      style={{ overflow: 'visible' }}
      dangerouslySetInnerHTML={{ __html: logoMarkup(id, themePalette) }}
    />
  );
}

/* ---------- fon ---------- */
const floaters: {
  kind: 'lock' | 'star';
  size: number;
  pos: React.CSSProperties;
  rot: number;
  dur: number;
}[] = [
  { kind: 'lock', size: 170, pos: { left: -52, top: -26 }, rot: -18, dur: 9 },
  { kind: 'lock', size: 118, pos: { right: -38, top: '44%' }, rot: 16, dur: 11 },
  { kind: 'lock', size: 150, pos: { right: -42, bottom: -34 }, rot: -14, dur: 10 },
  { kind: 'star', size: 44, pos: { right: 34, top: 92 }, rot: 12, dur: 6 },
  { kind: 'star', size: 28, pos: { left: 26, top: '36%' }, rot: -10, dur: 7 },
  { kind: 'star', size: 36, pos: { left: '44%', bottom: 96 }, rot: 18, dur: 8 },
  { kind: 'star', size: 24, pos: { left: '68%', top: 28 }, rot: -16, dur: 5.5 },
  { kind: 'star', size: 32, pos: { left: 16, bottom: 150 }, rot: 8, dur: 6.5 },
];

export function Background() {
  return (
    <div className="bg" aria-hidden>
      <motion.div
        className="blob"
        style={{ width: 300, height: 300, left: -90, top: 120, background: 'var(--orb1)' }}
        animate={{ x: [0, 40, -10, 0], y: [0, 50, 20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="blob"
        style={{ width: 280, height: 280, right: -100, top: '42%', background: 'var(--orb3)' }}
        animate={{ x: [0, -50, 10, 0], y: [0, -40, 30, 0] }}
        transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="blob"
        style={{ width: 320, height: 320, left: '10%', bottom: -140, background: 'var(--orb2)' }}
        animate={{ x: [0, 60, -20, 0], y: [0, -30, 10, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      {floaters.map((f, i) => (
        <motion.div
          key={i}
          className="floater"
          style={{ ...f.pos, rotate: f.rot, opacity: f.kind === 'lock' ? 0.7 : 0.85 }}
          animate={{
            y: [0, i % 2 ? 14 : -14, 0],
            rotateY: [-16, 16, -16],
            rotateX: [6, -6, 6],
          }}
          transition={{ duration: f.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
        >
          {f.kind === 'lock' ? <GlassLock size={f.size} /> : <GlassStar size={f.size} />}
        </motion.div>
      ))}
    </div>
  );
}

/* ---------- tugma ---------- */
type BtnProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  variant?: 'primary' | 'ghost';
  arrow?: boolean;
  children: ReactNode;
};
export function Btn({ variant = 'primary', arrow, children, className = '', onClick, ...rest }: BtnProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.015 }}
      transition={spring}
      className={`btn ${variant} ${variant === 'ghost' ? 'glass' : ''} ${className}`}
      onClick={(e) => {
        sfx.tap();
        onClick?.(e);
      }}
      {...rest}
    >
      {variant === 'primary' && <span className="shine" />}
      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>{children}</span>
      {arrow && (
        <span className="arrow" style={{ position: 'absolute', right: 10, zIndex: 1 }}>
          <Icon name="arrow" size={18} />
        </span>
      )}
    </motion.button>
  );
}

export function IconBtn({ name, onClick, label }: { name: IconName; onClick?: () => void; label: string }) {
  return (
    <motion.button
      aria-label={label}
      className="icon-btn glass"
      whileTap={{ scale: 0.88 }}
      whileHover={{ scale: 1.06 }}
      transition={spring}
      onClick={() => {
        sfx.tap();
        onClick?.();
      }}
    >
      <Icon name={name} />
    </motion.button>
  );
}

/* ---------- ikonkalar ---------- */
export type IconName =
  | 'back'
  | 'arrow'
  | 'book'
  | 'trophy'
  | 'gear'
  | 'robot'
  | 'users'
  | 'dice'
  | 'sound'
  | 'mute'
  | 'close'
  | 'check';

export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'back':
      return (<svg {...p}><path d="M15 5l-7 7 7 7" /></svg>);
    case 'arrow':
      return (<svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
    case 'book':
      return (<svg {...p}><path d="M4 5.5A2.5 2.5 0 016.5 3H20v16H6.5A2.5 2.5 0 004 21.5v-16zM4 21.5A2.5 2.5 0 016.5 19H20" /></svg>);
    case 'trophy':
      return (<svg {...p}><path d="M8 4h8v6a4 4 0 01-8 0V4zM8 6H4v1a4 4 0 004 4M16 6h4v1a4 4 0 01-4 4M12 14v4M8 21h8M10 18h4" /></svg>);
    case 'gear':
      return (<svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /></svg>);
    case 'robot':
      return (<svg {...p}><rect x="4" y="8" width="16" height="12" rx="4" /><path d="M12 4v4M9 13v1M15 13v1M9 17h6" /><circle cx="12" cy="3.5" r="1" /></svg>);
    case 'users':
      return (<svg {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0113 0M16 4.6a3.5 3.5 0 010 6.8M18 14.2a6.5 6.5 0 013.5 5.8" /></svg>);
    case 'dice':
      return (<svg {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="4" /><circle cx="8.5" cy="8.5" r="1" fill="currentColor" /><circle cx="15.5" cy="8.5" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="8.5" cy="15.5" r="1" fill="currentColor" /><circle cx="15.5" cy="15.5" r="1" fill="currentColor" /></svg>);
    case 'sound':
      return (<svg {...p}><path d="M4 9.5v5h4l5 4v-13l-5 4H4zM16.5 9a4 4 0 010 6M19 6.5a8 8 0 010 11" /></svg>);
    case 'mute':
      return (<svg {...p}><path d="M4 9.5v5h4l5 4v-13l-5 4H4zM17 9.5l4 5M21 9.5l-4 5" /></svg>);
    case 'close':
      return (<svg {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>);
    case 'check':
      return (<svg {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>);
  }
}

/* ---------- qulf ---------- */
export function Lock({ digit, open, index = 0 }: { digit?: number; open: boolean; index?: number }) {
  const [showDigit, setShowDigit] = useState(false);
  useEffect(() => {
    if (!open) {
      setShowDigit(false);
      return;
    }
    const t = setTimeout(() => {
      setShowDigit(true);
      sfx.unlock();
    }, 420 + index * 200);
    return () => clearTimeout(t);
  }, [open, index]);

  const gid = useId().replace(/:/g, '');
  return (
    <motion.div
      className="lock"
      initial={{ rotateX: 40, y: 14, opacity: 0 }}
      animate={{ rotateX: 0, y: 0, opacity: 1 }}
      transition={{ ...softSpring, delay: index * 0.08 }}
      whileHover={{ rotateY: -8, rotateX: 6 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {showDigit && digit !== undefined ? (
          <motion.span
            key="d"
            className="digit"
            initial={{ scale: 0.2, rotate: -40, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 14 }}
          >
            {digit}
          </motion.span>
        ) : (
          <motion.svg
            key="l"
            viewBox="0 0 60 70"
            exit={{ scale: 0.4, opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="var(--lock-a)" />
                <stop offset="1" stopColor="var(--lock-b)" />
              </linearGradient>
            </defs>
            <motion.path
              d="M17 32 V22 a13 13 0 0 1 26 0 V32"
              fill="none"
              stroke="#fff"
              strokeWidth="6.5"
              strokeLinecap="round"
              style={{ transformBox: 'fill-box', originX: 1, originY: 1 }}
              animate={open ? { y: -9, rotate: 38 } : { y: 0, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 14 }}
            />
            <rect x="8" y="30" width="44" height="36" rx="8" fill={`url(#${gid})`} />
            <rect x="8" y="30" width="44" height="14" rx="8" fill="#fff" opacity="0.28" />
            <circle cx="30" cy="45" r="4.6" fill="#fff" />
            <rect x="28" y="46" width="4" height="10" rx="2" fill="#fff" />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ---------- baraban ---------- */
export function Drum({
  value,
  min,
  onChange,
  locked,
}: {
  value: number;
  min: number;
  onChange: (n: number) => void;
  locked?: boolean;
}) {
  const sc = useRef<HTMLDivElement>(null);
  const items = useMemo(() => Array.from({ length: 10 - min }, (_, i) => i + min), [min]);
  const lastIdx = useRef(value - min);
  const raf = useRef(0);

  const itemH = () => sc.current?.querySelector<HTMLElement>('.item')?.offsetHeight || 54;

  const paint = useCallback(() => {
    const el = sc.current;
    if (!el) return;
    const pos = el.scrollTop / itemH();
    el.querySelectorAll<HTMLElement>('.item').forEach((it, i) => {
      const d = i - pos;
      const a = Math.min(Math.abs(d), 2);
      it.style.transform = `perspective(260px) rotateX(${-d * 32}deg) scale(${1 - a * 0.16})`;
      it.style.opacity = String(1 - a * 0.4);
    });
  }, []);

  useLayoutEffect(() => {
    const el = sc.current;
    if (!el) return;
    el.scrollTop = (value - min) * itemH();
    lastIdx.current = value - min;
    paint();
    // faqat bir marta: keyingi o'zgarishlar quyidagi effektda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min]);

  // Barabanni aniq markazga o'zimiz aylantiramiz: brauzerning smooth scroll + snap
  // kombinatsiyasi ba'zan oraliq joyda to'xtab qoladi.
  const anim = useRef(0);
  const moving = useRef(false);
  const settle = useRef(0);
  const animateTo = useCallback(
    (idx: number, ms: number) => {
      const el = sc.current;
      if (!el) return;
      cancelAnimationFrame(anim.current);
      const from = el.scrollTop;
      const to = idx * itemH();
      moving.current = true;
      el.style.scrollSnapType = 'none';
      const t0 = performance.now();
      const step = (t: number) => {
        const k = Math.min(1, (t - t0) / ms);
        el.scrollTop = from + (to - from) * (1 - Math.pow(1 - k, 3));
        paint();
        if (k < 1) {
          anim.current = requestAnimationFrame(step);
        } else {
          el.scrollTop = to;
          el.style.scrollSnapType = '';
          moving.current = false;
          paint();
        }
      };
      anim.current = requestAnimationFrame(step);
    },
    [paint],
  );

  // tashqaridan o'zgarganda (masalan, tasodifiy tugma) barabanni buramiz
  useEffect(() => {
    if (value - min === lastIdx.current) return;
    lastIdx.current = value - min;
    animateTo(value - min, 650);
  }, [value, min, animateTo]);

  useEffect(
    () => () => {
      cancelAnimationFrame(anim.current);
      clearTimeout(settle.current);
    },
    [],
  );

  const onScroll = () => {
    if (moving.current) return;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      paint();
      const el = sc.current;
      if (!el) return;
      const h = itemH();
      const idx = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / h)));
      if (idx !== lastIdx.current) {
        lastIdx.current = idx;
        sfx.tick();
        onChange(items[idx]);
      }
      // sudralish tugagach, aniq markazga o'rnatamiz
      clearTimeout(settle.current);
      settle.current = window.setTimeout(() => {
        if (!drag.current && !moving.current && Math.abs(el.scrollTop - lastIdx.current * h) > 0.5) {
          animateTo(lastIdx.current, 160);
        }
      }, 140);
    });
  };

  const goto = (raw: number) => {
    const idx = Math.max(0, Math.min(items.length - 1, raw));
    if (idx !== lastIdx.current) {
      lastIdx.current = idx;
      sfx.tick();
      onChange(items[idx]);
    }
    animateTo(idx, 260);
  };

  // sichqoncha bilan sudrash (kompyuterda sinash uchun)
  const drag = useRef<{ y: number; top: number; moved: boolean } | null>(null);
  const down = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !sc.current) return;
    drag.current = { y: e.clientY, top: sc.current.scrollTop, moved: false };
    sc.current.style.scrollSnapType = 'none';
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || !sc.current) return;
    if (Math.abs(e.clientY - d.y) > 4) d.moved = true;
    sc.current.scrollTop = d.top - (e.clientY - d.y);
  };
  const up = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || !sc.current) return;
    const el = sc.current;
    const h = itemH();
    el.style.scrollSnapType = '';
    if (d.moved) {
      goto(Math.round(el.scrollTop / h));
    } else if (e.type === 'pointerup') {
      // pointer capture "click" ni scrollerga yo'naltiradi, shuning uchun bosilgan raqamni o'zimiz topamiz
      goto(Math.floor((el.scrollTop + e.clientY - el.getBoundingClientRect().top - h) / h));
    }
    drag.current = null;
  };

  return (
    <div
      className={`drum glass ${locked ? 'locked' : ''}`}
      tabIndex={0}
      role="spinbutton"
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={9}
      onKeyDown={(e) => {
        if (e.key === 'ArrowUp') (e.preventDefault(), goto(lastIdx.current - 1));
        if (e.key === 'ArrowDown') (e.preventDefault(), goto(lastIdx.current + 1));
      }}
    >
      <span className="frame" />
      <div
        className="scroller"
        ref={sc}
        onScroll={onScroll}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <div className="list">
          {items.map((n, i) => (
            <div
              key={n}
              className="item"
              onClick={() => goto(i)}
            >
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CodeInput({
  value,
  onChange,
  locked,
}: {
  value: Code;
  onChange: (c: Code) => void;
  locked?: boolean;
}) {
  const set = (i: number) => (n: number) => {
    const next = [...value] as Code;
    next[i] = n;
    onChange(next);
  };
  return (
    <div className="drums">
      {[0, 1, 2].map((i) => (
        <Drum key={i} value={value[i]} min={i === 0 ? 1 : 0} onChange={set(i)} locked={locked} />
      ))}
    </div>
  );
}

/* ---------- natija ---------- */
export function Orb({ hits, nonce = 0 }: { hits: number | null; nonce?: number }) {
  const cls = hits === null ? 'idle' : hits > 0 ? 'good' : 'bad';
  return (
    <div style={{ position: 'relative', width: 58, height: 58 }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={hits === null ? 'idle' : `h${nonce}`}
          className={`orb ${cls}`}
          initial={{ scale: 0.3, rotateY: 120, opacity: 0 }}
          animate={{ scale: 1, rotateY: 0, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 360, damping: 15 }}
          style={{ position: 'absolute', inset: 0, width: 'auto', height: 'auto' }}
        >
          {hits === null ? '?' : hits}
        </motion.div>
      </AnimatePresence>
      {hits !== null && (
        <motion.span
          key={`ring${nonce}`}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `3px solid ${hits > 0 ? 'var(--good)' : 'var(--bad)'}`,
            pointerEvents: 'none',
          }}
          initial={{ scale: 1, opacity: 0.9 }}
          animate={{ scale: 2.1, opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      )}
    </div>
  );
}

export function GuessPill({
  code,
  hits,
  revealed = true,
  fresh = false,
}: {
  code: Code;
  hits: number;
  revealed?: boolean;
  fresh?: boolean;
}) {
  return (
    <motion.div
      className="pill"
      layout
      initial={fresh ? { opacity: 0, scale: 0.6, y: -20 } : false}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={spring}
    >
      <span className="digs">
        {code.map((d, i) => (
          <motion.span
            key={i}
            initial={fresh ? { y: 14, opacity: 0, scale: 0.5 } : false}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ ...spring, delay: fresh ? 0.08 * i : 0 }}
          >
            {d}
          </motion.span>
        ))}
      </span>
      <motion.span
        className={`badge ${revealed ? (hits > 0 ? 'good' : 'bad') : 'idle'}`}
        animate={revealed ? { rotateY: [90, 0], scale: [0.6, 1.25, 1] } : { opacity: [0.5, 1, 0.5] }}
        transition={revealed ? { duration: 0.5 } : { duration: 0.9, repeat: Infinity }}
      >
        {revealed ? hits : '·'}
      </motion.span>
    </motion.div>
  );
}

/* ---------- chiqib ketgan raqamlar ---------- */
export function Elim({
  eliminated,
  manual,
  onToggle,
}: {
  eliminated: boolean[][];
  manual: boolean[][];
  onToggle?: (col: number, digit: number) => void;
}) {
  return (
    <div className="elim">
      {[0, 1, 2].map((c) => (
        <motion.div
          className="col"
          key={c}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...softSpring, delay: 0.1 + c * 0.07 }}
        >
          {Array.from({ length: 10 }, (_, k) => k).map((d) => {
            if (c === 0 && d === 0) return <span key={d} className="cell ghost" aria-hidden />;
            const auto = eliminated[c][d];
            const man = manual[c][d];
            const out = auto || man;
            return (
              <motion.button
                key={d}
                className={`cell ${out ? 'out' : ''} ${man && !auto ? 'manual' : ''}`}
                whileTap={{ scale: 0.7 }}
                onClick={() => {
                  if (auto) return;
                  sfx.tick();
                  onToggle?.(c, d);
                }}
              >
                <motion.span
                  animate={out ? { scale: [1, 1.8, 1.15], rotate: [0, -14, 0] } : { scale: 1 }}
                  transition={{ duration: 0.45 }}
                >
                  {d}
                </motion.span>
              </motion.button>
            );
          })}
        </motion.div>
      ))}
    </div>
  );
}

/* ---------- segment va tugma-almashtirgich ---------- */
export function Segmented<T extends string>({
  items,
  value,
  onChange,
}: {
  items: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const gid = useId();
  return (
    <div className="seg glass">
      {items.map((it) => (
        <button
          key={it.id}
          className={it.id === value ? 'on' : ''}
          onClick={() => {
            if (it.id !== value) {
              sfx.tap();
              onChange(it.id);
            }
          }}
        >
          {it.id === value && (
            <motion.span
              layoutId={gid}
              className="bubble"
              style={{ inset: 0, top: 0, bottom: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            />
          )}
          <span style={{ position: 'relative', zIndex: 1 }}>{it.label}</span>
        </button>
      ))}
    </div>
  );
}

export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <motion.button
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`switch ${on ? 'on' : ''}`}
      onClick={() => {
        onChange(!on);
        sfx.tap();
      }}
      whileTap="press"
    >
      <motion.span
        className="knob"
        animate={{ x: on ? 36 : 0 }}
        variants={{ press: { scaleX: 1.3 } }}
        transition={{ type: 'spring', stiffness: 500, damping: 24 }}
      />
    </motion.button>
  );
}

export function TopBar({ title, onBack, right }: { title: ReactNode; onBack?: () => void; right?: ReactNode }) {
  const t = useT();
  return (
    <div className="topbar">
      {onBack ? <IconBtn name="back" label={t('back')} onClick={onBack} /> : <span style={{ width: 46 }} />}
      <div className="title">{title}</div>
      {right ?? <span style={{ width: 46 }} />}
    </div>
  );
}

/* ---------- konfeti va hisoblagich ---------- */
export function Confetti({ count = 36 }: { count?: number }) {
  const parts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 520,
        y: -120 - Math.random() * 380,
        r: Math.random() * 720 - 360,
        s: 6 + Math.random() * 8,
        c: ['#ffd23f', '#00c46a', '#ff5a7a', '#52a9ff', '#b072ff', '#ff9f1c'][i % 6],
        d: Math.random() * 0.15,
        round: Math.random() > 0.5,
      })),
    [count],
  );
  return (
    <div style={{ position: 'absolute', left: '50%', top: '38%', pointerEvents: 'none', zIndex: 30 }}>
      {parts.map((p) => (
        <motion.span
          key={p.id}
          style={{
            position: 'absolute',
            width: p.s,
            height: p.s * (p.round ? 1 : 1.8),
            borderRadius: p.round ? '50%' : 2,
            background: p.c,
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 520], opacity: [1, 1, 0], rotate: p.r }}
          transition={{ duration: 2.1, delay: p.d, ease: 'easeOut', times: [0, 0.4, 1] }}
        />
      ))}
    </div>
  );
}

export function CountUp({ to, delay = 0 }: { to: number; delay?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const c = animate(0, to, { duration: 1, delay, ease: 'easeOut', onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [to, delay]);
  return <>{n}</>;
}

export function MiniCode({ code }: { code: Code }) {
  return (
    <span className="mini-code">
      {code.map((d, i) => (
        <span key={i}>{d}</span>
      ))}
    </span>
  );
}

/* ---------- til almashtirgich (UZ | RU | EN) ---------- */
export function LangSwitch() {
  const { settings } = useStore();
  const gid = useId();
  return (
    <div className="seg small glass">
      {LANGS.map((l) => (
        <button
          key={l.id}
          aria-label={l.name}
          className={l.id === settings.lang ? 'on' : ''}
          onClick={() => {
            if (l.id !== settings.lang) {
              sfx.tap();
              setSettings({ lang: l.id });
            }
          }}
        >
          {l.id === settings.lang && (
            <motion.span
              layoutId={gid}
              className="bubble"
              style={{ inset: 0, top: 0, bottom: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            />
          )}
          <span style={{ position: 'relative', zIndex: 1 }}>{l.short}</span>
        </button>
      ))}
    </div>
  );
}
