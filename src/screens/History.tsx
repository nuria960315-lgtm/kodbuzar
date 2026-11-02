import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Btn, Icon, MiniCode, TopBar, softSpring, spring } from '../components/ui';
import { useT, type TFn } from '../lib/i18n';
import { clearHistory, useStore, type MatchRecord } from '../lib/storage';

function dateText(t: number) {
  const d = new Date(t);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} · ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Yozuvdagi ism bo'sh bo'lsa yoki kompyuter bo'lsa, joriy tilda ko'rsatiladi. */
const nameOf = (rec: MatchRecord, i: 0 | 1, t: TFn) => {
  if (rec.mode === 'bot') return i === 1 ? t('computer') : rec.names[0] || t('player');
  return rec.names[i] || t(i === 0 ? 'player1' : 'player2');
};

function Item({ rec, i }: { rec: MatchRecord; i: number }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const youWon = rec.winner === 0;
  const n0 = nameOf(rec, 0, t);
  const n1 = nameOf(rec, 1, t);
  return (
    <motion.div
      layout
      className="hist-item glass"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...softSpring, delay: Math.min(i, 8) * 0.05 }}
      onClick={() => setOpen((o) => !o)}
      style={{ cursor: 'pointer' }}
    >
      <motion.div layout="position" className="row" style={{ justifyContent: 'space-between' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {n0} <span style={{ color: 'var(--muted)' }}>vs</span> {n1}
          </div>
          <div className="caption" style={{ fontSize: 12 }}>
            {dateText(rec.date)} · {rec.mode === 'bot' ? t('vsBot', { level: t(rec.difficulty) }) : '1v1'}
          </div>
        </div>
        <div className="col" style={{ alignItems: 'flex-end', gap: 4 }}>
          <span className={`tag ${rec.mode === 'bot' && !youWon ? 'lose' : 'win'}`}>
            {rec.mode === 'bot' ? (youWon ? t('tagWin') : t('tagLose')) : t('nameWon', { name: rec.winner === 0 ? n0 : n1 })}
          </span>
          <b style={{ fontSize: 17 }}>
            {rec.wins[0]} : {rec.wins[1]}
          </b>
        </div>
      </motion.div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="col" style={{ gap: 10, paddingTop: 14 }}>
              {rec.rounds.map((r, k) => (
                <div key={k} className="row" style={{ justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, fontSize: 13 }}>
                    {t('roundWinner', { n: k + 1 })} <span className="grad-text">{r.winner === 0 ? n0 : n1}</span>
                  </span>
                  <span className="row" style={{ gap: 8 }}>
                    <MiniCode code={r.secrets[1 - r.winner]} />
                    <span className="caption" style={{ fontWeight: 800, minWidth: 64, textAlign: 'right' }}>
                      {t('guessesN', { n: r.guesses[r.winner] })}
                    </span>
                  </span>
                </div>
              ))}
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="caption" style={{ fontWeight: 800 }}>{t('pointsLabel')}</span>
                <b>
                  {rec.points[0]} : {rec.points[1]}
                </b>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function History({ onBack }: { onBack: () => void }) {
  const { history } = useStore();
  const t = useT();
  const bot = history.filter((h) => h.mode === 'bot');
  const wins = bot.filter((h) => h.winner === 0).length;
  const best = history.reduce((a, h) => Math.max(a, h.points[0], h.mode === 'duo' ? h.points[1] : 0), 0);
  const totalPts = history.reduce((a, h) => a + h.points[0], 0);
  const stats: [string, string | number][] = [
    [t('statGames'), history.length],
    [t('statWinPc'), `${bot.length ? Math.round((wins / bot.length) * 100) : 0}%`],
    [t('statBest'), best],
  ];

  return (
    <div className="screen">
      <TopBar title={t('history')} onBack={onBack} />
      <div className="row" style={{ gap: 10, marginTop: 14 }}>
        {stats.map(([l, v], i) => (
          <motion.div
            key={i}
            className="glass card col"
            style={{ flex: 1, alignItems: 'center', padding: '12px 6px', borderRadius: 22 }}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...spring, delay: i * 0.07 }}
          >
            <b style={{ fontSize: 24 }} className="grad-text">{v}</b>
            <span className="caption" style={{ fontSize: 11, fontWeight: 800 }}>{l}</span>
          </motion.div>
        ))}
      </div>
      <div className="caption" style={{ textAlign: 'center', marginTop: 8 }}>
        {t('totalPoints')} <b>{totalPts}</b>
      </div>

      <div className="col grow scroll" style={{ gap: 10, marginTop: 12, paddingBottom: 8 }}>
        {history.length === 0 ? (
          <div className="col" style={{ alignItems: 'center', gap: 12, marginTop: 40, textAlign: 'center' }}>
            <div className="icon-btn glass" style={{ width: 80, height: 80 }}>
              <Icon name="trophy" size={36} />
            </div>
            <div className="caption">
              {t('emptyHist')}
              <br />
              {t('emptyHist2')}
            </div>
          </div>
        ) : (
          history.map((h, i) => <Item key={h.id} rec={h} i={i} />)
        )}
      </div>
      {history.length > 0 && (
        <Btn variant="ghost" onClick={() => confirm(t('confirmClear')) && clearHistory()}>
          {t('clearHist')}
        </Btn>
      )}
    </div>
  );
}
