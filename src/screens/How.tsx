import { motion } from 'framer-motion';
import { GuessPill, Lock, TopBar, softSpring } from '../components/ui';
import { useT, type Key } from '../lib/i18n';

const steps: [Key, Key][] = [
  ['s1t', 's1d'],
  ['s2t', 's2d'],
  ['s3t', 's3d'],
  ['s4t', 's4d'],
  ['s5t', 's5d'],
];

export default function How({ onBack }: { onBack: () => void }) {
  const t = useT();
  return (
    <div className="screen">
      <TopBar title={t('rules')} onBack={onBack} />
      <div className="col grow scroll" style={{ gap: 14, paddingTop: 16, paddingBottom: 12 }}>
        <motion.div
          className="glass card"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={softSpring}
        >
          <div className="caption" style={{ fontWeight: 800, marginBottom: 10, textAlign: 'center' }}>
            {t('example')} <b style={{ color: 'var(--p)' }}>407</b>
          </div>
          <div className="locks" style={{ gridAutoRows: 54, marginBottom: 12 }}>
            {[4, 0, 7].map((d, i) => (
              <Lock key={i} digit={d} open index={i} />
            ))}
          </div>
          <div className="history" style={{ gridTemplateColumns: 'repeat(3, 1fr)', overflow: 'visible', padding: 0 }}>
            <GuessPill code={[4, 5, 6]} hits={1} />
            <GuessPill code={[1, 2, 3]} hits={0} />
            <GuessPill code={[4, 0, 7]} hits={3} />
          </div>
          <div className="caption" style={{ textAlign: 'center', marginTop: 8, fontSize: 12 }}>
            {t('exampleLine')}
          </div>
        </motion.div>

        {steps.map(([title, desc], i) => (
          <motion.div
            key={title}
            className="step"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ ...softSpring, delay: 0.15 + i * 0.08 }}
          >
            <span className="num">{i + 1}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{t(title)}</div>
              <div className="caption">{t(desc)}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
