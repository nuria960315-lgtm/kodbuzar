import { motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import { sfx } from '../lib/sfx';
import { GlassLock, GlassStar, softSpring } from './ui';

const W = 292; // pill kengligi
const LENS = 82; // linza diametri
const PAD = 7;
const TRAVEL = W - LENS - PAD * 2;
const SLIDE = { delay: 0.6, duration: 0.8, ease: [0.65, 0, 0.35, 1] as const };

/**
 * Raund/o'yin boshlanishi: shisha pill ichida linza o'ngga sirpanadi,
 * orqasidan porlash yoqiladi (suyuq shisha "toggle" uslubida).
 */
export function RoundIntro({
  title,
  subtitle,
  onDone,
}: {
  title: string;
  subtitle: string;
  onDone: () => void;
}) {
  useEffect(() => {
    const t1 = setTimeout(() => sfx.send(), 500);
    const t2 = setTimeout(() => sfx.unlock(), 1350);
    const t3 = setTimeout(onDone, 2500);
    return () => [t1, t2, t3].forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sparks = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + Math.random() * 0.4;
        const d = 120 + Math.random() * 70;
        return { x: Math.cos(a) * d * 1.25, y: Math.sin(a) * d * 0.7, s: 18 + Math.random() * 22, r: Math.random() * 80 - 40 };
      }),
    [],
  );

  return (
    <motion.div
      className="overlay intro"
      style={{ zIndex: 45 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      onClick={onDone}
    >
      <motion.div
        className="intro-stage"
        exit={{ scale: 1.18, filter: 'blur(10px)', transition: { duration: 0.4 } }}
      >
        <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ delay: 1.35, duration: 0.55 }}>
          <motion.div
            className="intro-pill glass"
            style={{ width: W }}
            initial={{ opacity: 0, scale: 0.55, rotateX: 60, y: 50 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
            transition={softSpring}
          >
            <div className="intro-clip">
              <motion.div
                className="intro-glow"
                initial={{ width: LENS + PAD * 2 }}
                animate={{ width: W }}
                transition={SLIDE}
              />
            </div>
            <motion.span
              className="intro-label"
              initial={{ color: '#7b86aa' }}
              animate={{ color: '#ffffff' }}
              transition={{ delay: 1.0, duration: 0.3 }}
            >
              {title}
            </motion.span>
            <motion.div
              className="intro-lens"
              initial={{ x: 0, scaleX: 1 }}
              animate={{ x: TRAVEL, scaleX: [1, 1.34, 1] }}
              transition={{ x: SLIDE, scaleX: { ...SLIDE, times: [0, 0.5, 1] } }}
            >
              <GlassLock size={46} />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="caption"
          style={{ fontWeight: 800, fontSize: 15, textAlign: 'center' }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.4 }}
        >
          {subtitle}
        </motion.div>

        {sparks.map((s, i) => (
          <motion.span
            key={i}
            style={{ position: 'absolute', left: '50%', top: 48, marginLeft: -s.s / 2, marginTop: -s.s / 2, pointerEvents: 'none' }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 }}
            animate={{ x: s.x, y: s.y, scale: [0, 1.1, 0.7], opacity: [0, 1, 0], rotate: s.r }}
            transition={{ delay: 1.4, duration: 1, ease: 'easeOut' }}
          >
            <GlassStar size={s.s} />
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
}
