import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Difficulty } from '../game/logic';
import { newMatch, type Match, type Mode } from '../game/match';
import { Btn, Icon, Segmented, TopBar, softSpring } from '../components/ui';
import { useT } from '../lib/i18n';
import { getSettings, setSettings } from '../lib/storage';

export default function Setup({ mode, onStart, onBack }: { mode: Mode; onStart: (m: Match) => void; onBack: () => void }) {
  const t = useT();
  const [diff, setDiff] = useState<Difficulty>('medium');
  const [a, setA] = useState(getSettings().name);
  const [b, setB] = useState('');

  const levels: { id: Difficulty; label: string; hint: string }[] = [
    { id: 'easy', label: t('easy'), hint: t('easyHint') },
    { id: 'medium', label: t('medium'), hint: t('mediumHint') },
    { id: 'hard', label: t('hard'), hint: t('hardHint') },
  ];

  // bo'sh ism = standart ism; u tilga qarab o'yin ichida ko'rsatiladi
  const start = () => {
    if (mode === 'bot') setSettings({ name: a.trim() });
    onStart(newMatch(mode, diff, [a.trim(), mode === 'bot' ? '' : b.trim()]));
  };

  return (
    <div className="screen">
      <TopBar title={mode === 'bot' ? t('vsComputer') : t('twoPlayers')} onBack={onBack} />
      <div className="col grow scroll" style={{ gap: 22, paddingTop: 22 }}>
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={softSpring}>
          <div className="label">{mode === 'bot' ? t('yourName') : t('player1Label')}</div>
          <input
            className="field glass"
            value={a}
            maxLength={14}
            onChange={(e) => setA(e.target.value)}
            placeholder={mode === 'bot' ? t('player') : t('player1')}
          />
        </motion.div>

        {mode === 'duo' ? (
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...softSpring, delay: 0.08 }}>
            <div className="label">{t('player2Label')}</div>
            <input className="field glass" value={b} maxLength={14} onChange={(e) => setB(e.target.value)} placeholder={t('player2')} />
          </motion.div>
        ) : (
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...softSpring, delay: 0.08 }}>
            <div className="label">{t('difficulty')}</div>
            <Segmented items={levels} value={diff} onChange={setDiff} />
            <p className="caption" style={{ margin: '12px 8px 0' }}>{levels.find((l) => l.id === diff)?.hint}</p>
          </motion.div>
        )}

        <motion.div
          className="glass card"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...softSpring, delay: 0.16 }}
        >
          <div className="step" style={{ alignItems: 'center' }}>
            <span className="num"><Icon name="trophy" size={18} /></span>
            <div className="caption" style={{ color: 'var(--ink)' }}>
              <b>{t('setupInfoB')}</b> {t('setupInfo')}
            </div>
          </div>
        </motion.div>
      </div>
      <Btn arrow onClick={start}>{t('startGame')}</Btn>
    </div>
  );
}
