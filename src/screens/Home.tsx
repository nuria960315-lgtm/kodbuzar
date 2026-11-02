import { motion } from 'framer-motion';
import { Btn, Icon, LangSwitch, Logo, softSpring, spring, type IconName } from '../components/ui';
import { useT, type Key } from '../lib/i18n';
import { sfx } from '../lib/sfx';
import { useStore } from '../lib/storage';

interface Props {
  onPlay: (mode: 'bot' | 'duo') => void;
  onNav: (s: 'how' | 'history' | 'settings') => void;
}

const nav: { id: 'how' | 'history' | 'settings'; label: Key; icon: IconName }[] = [
  { id: 'how', label: 'rules', icon: 'book' },
  { id: 'history', label: 'history', icon: 'trophy' },
  { id: 'settings', label: 'settings', icon: 'gear' },
];

export default function Home({ onPlay, onNav }: Props) {
  const { history } = useStore();
  const t = useT();
  const wins = history.filter((h) => h.mode === 'duo' || h.winner === 0).length;
  const best = history.reduce((a, h) => Math.max(a, h.points[0], h.mode === 'duo' ? h.points[1] : 0), 0);

  return (
    <div className="screen" style={{ justifyContent: 'space-between' }}>
      <motion.div
        style={{ position: 'absolute', top: 'calc(var(--sat) + 14px)', right: 18, zIndex: 3 }}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.5 }}
      >
        <LangSwitch />
      </motion.div>

      <div className="col" style={{ alignItems: 'center', flex: 1, justifyContent: 'center', gap: 6 }}>
        <motion.div
          initial={{ scale: 0.4, rotate: -25, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ ...softSpring, delay: 0.1 }}
        >
          <motion.div
            className="glass"
            animate={{ y: [0, -12, 0], rotateZ: [0, 2, 0, -2, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            whileTap={{ scale: 0.9, rotate: 8 }}
            onClick={() => sfx.unlock()}
            style={{ width: 'clamp(150px, 26dvh, 210px)', aspectRatio: '1', borderRadius: '30%', display: 'grid', placeItems: 'center' }}
          >
            <Logo size={158} />
          </motion.div>
        </motion.div>

        <motion.h1
          className="h1"
          style={{ fontSize: 42, letterSpacing: 1, marginTop: 28 }}
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...spring, delay: 0.3 }}
        >
          KODBUZAR
        </motion.h1>
        <motion.div className="sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          {t('tagline')}
        </motion.div>

        {history.length > 0 && (
          <motion.div
            className="row"
            style={{ gap: 10, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <span className="tag">{t('gamesN', { n: history.length })}</span>
            <span className="tag win">{t('winsN', { n: wins })}</span>
            <span className="tag">{t('bestN', { n: best })}</span>
          </motion.div>
        )}
      </div>

      <motion.div
        className="col"
        style={{ gap: 12 }}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...softSpring, delay: 0.4 }}
      >
        <Btn arrow onClick={() => onPlay('bot')}>
          <Icon name="robot" /> {t('vsComputer')}
        </Btn>
        <Btn variant="ghost" onClick={() => onPlay('duo')}>
          <Icon name="users" /> {t('twoPlayers')}
        </Btn>

        <div className="row" style={{ justifyContent: 'center', gap: 22, marginTop: 8 }}>
          {nav.map((n, i) => (
            <motion.button
              key={n.id}
              className="col"
              style={{ alignItems: 'center', gap: 6 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ ...spring, delay: 0.6 + i * 0.08 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                sfx.tap();
                onNav(n.id);
              }}
            >
              <span className="icon-btn glass" style={{ width: 56, height: 56 }}>
                <Icon name={n.icon} size={24} />
              </span>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)' }}>{t(n.label)}</span>
            </motion.button>
          ))}
        </div>

        <div className="sub" style={{ textAlign: 'center', fontSize: 10, letterSpacing: 4, marginTop: 6 }}>
          {t('footer')}
        </div>
      </motion.div>
    </div>
  );
}
