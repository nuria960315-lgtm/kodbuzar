import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  botGuess,
  codeKey,
  MATCH_BONUS,
  eliminatedFromGuesses,
  randomCode,
  type Code,
} from '../game/logic';
import { MAX_ROUNDS, WINS_NEEDED, reduce, type Action, type Idx, type Match } from '../game/match';
import {
  Btn,
  CodeInput,
  Confetti,
  CountUp,
  Elim,
  GuessPill,
  Icon,
  IconBtn,
  Lock,
  Logo,
  MiniCode,
  Orb,
  TopBar,
  softSpring,
  spring,
} from '../components/ui';
import { RoundIntro } from '../components/Intro';
import { T, useT } from '../lib/i18n';
import { sfx } from '../lib/sfx';
import { addMatch, setSettings, useStore } from '../lib/storage';

interface Props {
  initial: Match;
  onExit: () => void;
  onRestart: () => void;
}

export default function Game({ initial, onExit, onRestart }: Props) {
  const [m, dispatch] = useReducer(reduce, initial);
  const [drafts, setDrafts] = useState<[Code, Code]>([[1, 2, 3], [1, 2, 3]]);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const saved = useRef(false);
  const t = useT();

  // ismlar: bo'sh bo'lsa yoki kompyuter bo'lsa, tanlangan tilda ko'rsatiladi
  const view = useMemo<Match>(
    () => ({
      ...m,
      names:
        m.mode === 'bot'
          ? [m.names[0] || t('player'), t('computer')]
          : [m.names[0] || t('player1'), m.names[1] || t('player2')],
    }),
    [m, t],
  );

  // o'yinga kirganda va har yangi raundda shisha animatsiya ko'rsatiladi
  const [introRound, setIntroRound] = useState<number | null>(initial.round);
  const lastRound = useRef(initial.round);
  useEffect(() => {
    if (m.round === lastRound.current) return;
    lastRound.current = m.round;
    setIntroRound(m.round);
  }, [m.round]);

  // faqat dev rejimida: brauzerda sinash uchun holatni ochib qo'yadi
  useEffect(() => {
    if (import.meta.env.DEV) (window as unknown as { __kb: unknown }).__kb = { m, dispatch };
  }, [m]);

  // kompyuter navbati
  const botCount = m.guesses[1].length;
  useEffect(() => {
    if (m.mode !== 'bot' || m.phase !== 'play' || m.turn !== 1) return;
    const t = setTimeout(
      () => dispatch({ type: 'GUESS', code: botGuess(m.difficulty, m.guesses[1]) }),
      1300 + Math.random() * 900,
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m.mode, m.phase, m.turn, botCount, m.round]);

  // o'yin tarixini saqlash
  useEffect(() => {
    if (m.phase !== 'matchEnd' || saved.current || m.winner === null) return;
    saved.current = true;
    addMatch({
      id: Date.now().toString(36),
      date: Date.now(),
      mode: m.mode,
      difficulty: m.difficulty,
      names: m.names,
      wins: m.wins,
      points: m.points,
      winner: m.winner,
      rounds: m.rounds,
    });
  }, [m]);

  const viewer: Idx = m.mode === 'bot' ? 0 : m.phase === 'play' || m.phase === 'turnEnd' || m.phase === 'roundEnd' ? m.turn : m.holder;
  const setDraft = (c: Code) => setDrafts((d) => (viewer === 0 ? [c, d[1]] : [d[0], c]));

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        {m.phase === 'secret' && (
          <SecretEntry
            key={`s${m.round}${m.secretFor}`}
            name={view.names[m.secretFor]}
            duo={m.mode === 'duo'}
            round={m.round}
            onQuit={() => setConfirmQuit(true)}
            onConfirm={(code) =>
              dispatch({ type: 'SECRET', player: m.secretFor, code, botCode: m.mode === 'bot' ? randomCode() : undefined })
            }
          />
        )}
        {m.phase === 'handoff' && (
          <Handoff key={`h${m.round}${m.handoffTo}${m.after}`} name={view.names[m.handoffTo]} onReady={() => dispatch({ type: 'READY' })} />
        )}
        {(m.phase === 'play' || m.phase === 'turnEnd' || m.phase === 'roundEnd' || m.phase === 'matchEnd') && (
          <Board
            key={`b${m.round}${viewer}`}
            m={view}
            viewer={viewer}
            draft={drafts[viewer]}
            setDraft={setDraft}
            dispatch={dispatch}
            onQuit={() => setConfirmQuit(true)}
            onNextRound={() => dispatch({ type: 'NEXT_ROUND' })}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {introRound !== null && (
          <RoundIntro
            key={`intro${introRound}`}
            title={t('introTitle', { n: introRound })}
            subtitle={
              introRound === 1
                ? t('introFirst', { m: MAX_ROUNDS, w: WINS_NEEDED })
                : t('introScore', { a: m.wins[0], b: m.wins[1] })
            }
            onDone={() => setIntroRound(null)}
          />
        )}
        {m.phase === 'matchEnd' && <MatchOverlay key="me" m={view} onRestart={onRestart} onExit={onExit} />}
        {confirmQuit && (
          <motion.div className="overlay" key="quit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ zIndex: 40 }}>
            <motion.div className="sheet glass" initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, opacity: 0 }} transition={spring}>
              <h2 className="h1" style={{ fontSize: 26 }}>{t('quitTitle')}</h2>
              <p className="caption" style={{ margin: '10px 0 20px' }}>{t('quitText')}</p>
              <div className="col" style={{ gap: 10 }}>
                <Btn onClick={() => setConfirmQuit(false)}>{t('keepPlaying')}</Btn>
                <Btn variant="ghost" onClick={onExit}>{t('quit')}</Btn>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ---------- sahifa o'tish animatsiyasi ---------- */
const pageAnim = {
  initial: { opacity: 0, scale: 1.05, filter: 'blur(12px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 0.95, filter: 'blur(12px)' },
  transition: { duration: 0.32 },
};

/* ---------- maxfiy kod kiritish ---------- */
function SecretEntry({
  name,
  duo,
  round,
  onConfirm,
  onQuit,
}: {
  name: string;
  duo: boolean;
  round: number;
  onConfirm: (c: Code) => void;
  onQuit: () => void;
}) {
  const [code, setCode] = useState<Code>([1, 2, 3]);
  const [sealed, setSealed] = useState(false);
  const t = useT();
  return (
    <motion.div className="screen" {...pageAnim}>
      <TopBar title={t('roundOf', { n: round, m: MAX_ROUNDS })} onBack={onQuit} />
      <div className="col grow" style={{ justifyContent: 'center', gap: 22 }}>
        <div style={{ textAlign: 'center' }}>
          <div className="sub">{t('secretCode')}</div>
          <h1 className="h1" style={{ marginTop: 8 }}>
            <T k="secretTitle" name={<span className="grad-text">{name}</span>} />
          </h1>
          <p className="caption" style={{ marginTop: 10 }}>
            {t('secretHint1')}
            <br />
            {t('secretHint2')}
            {duo && <><br /><b>{t('hideScreen')}</b></>}
          </p>
        </div>

        <motion.div animate={sealed ? { scale: [1, 1.06, 0.9], opacity: [1, 1, 0] } : {}} transition={{ duration: 0.5 }}>
          <div className="locks" style={{ marginBottom: 18, gridAutoRows: 'clamp(60px, 10dvh, 84px)' }}>
            {[0, 1, 2].map((i) => (
              <Lock key={i} open={false} index={i} />
            ))}
          </div>
          <CodeInput value={code} onChange={setCode} />
        </motion.div>
      </div>

      <div className="row" style={{ gap: 12 }}>
        <motion.button
          className="icon-btn glass"
          style={{ width: 58, height: 58 }}
          aria-label={t('randomCode')}
          whileTap={{ rotate: 200, scale: 0.85 }}
          transition={spring}
          onClick={() => {
            sfx.tap();
            setCode(randomCode());
          }}
        >
          <Icon name="dice" size={26} />
        </motion.button>
        <Btn
          arrow
          disabled={sealed}
          onClick={() => {
            setSealed(true);
            sfx.unlock();
            setTimeout(() => onConfirm(code), 420);
          }}
        >
          {t('sealCode')}
        </Btn>
      </div>
    </motion.div>
  );
}

/* ---------- telefonni uzatish ---------- */
function Handoff({ name, onReady }: { name: string; onReady: () => void }) {
  const t = useT();
  return (
    <motion.div className="screen" {...pageAnim} style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
        <div className="glass" style={{ width: 150, height: 150, borderRadius: 44, display: 'grid', placeItems: 'center' }}>
          <Logo size={100} />
        </div>
      </motion.div>
      <div className="sub" style={{ marginTop: 28 }}>{t('handTitle')}</div>
      <h1 className="h1" style={{ marginTop: 8, fontSize: 38 }}>
        <span className="grad-text">{name}</span>
      </h1>
      <p className="caption" style={{ margin: '12px 24px 32px' }}>
        {t('handText')}
      </p>
      <div style={{ width: '100%' }}>
        <Btn arrow onClick={onReady}>{t('ready')}</Btn>
      </div>
    </motion.div>
  );
}

/* ---------- o'yin doskasi ---------- */
function PlayerChip({ m, i }: { m: Match; i: Idx }) {
  const t = useT();
  const active = (m.phase === 'play' || m.phase === 'turnEnd') && m.turn === i;
  return (
    <motion.div className={`chip glass ${active ? 'active' : ''}`} animate={{ scale: active ? 1.03 : 1 }} transition={spring}>
      <div className="avatar">{m.mode === 'bot' && i === 1 ? <Icon name="robot" size={18} /> : m.names[i].slice(0, 1).toUpperCase()}</div>
      <div className="meta">
        <div className="name">{m.names[i]}</div>
        <div className="pts">
          <CountUp key={m.points[i]} to={m.points[i]} /> {t('pointsN', { n: m.points[i] }).replace(/^\d+\s*/, '')}
        </div>
      </div>
      <div className="pips">
        {Array.from({ length: WINS_NEEDED }, (_, k) => (
          <motion.span key={k} className={`pip ${k < m.wins[i] ? 'on' : ''}`} animate={k < m.wins[i] ? { scale: [1, 1.6, 1] } : {}} />
        ))}
      </div>
    </motion.div>
  );
}

function BotThinking() {
  const [d, setD] = useState<number[]>([4, 7, 1]);
  useEffect(() => {
    const t = setInterval(() => setD([1 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)]), 90);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="row" style={{ gap: 8 }}>
      <span className="mini-code">
        {d.map((x, i) => (
          <motion.span key={i} animate={{ y: [-4, 0] }} transition={{ duration: 0.09 }}>
            {x}
          </motion.span>
        ))}
      </span>
      <span className="caption dots"><span>.</span><span>.</span><span>.</span></span>
    </span>
  );
}

function Board({
  m,
  viewer,
  draft,
  setDraft,
  dispatch,
  onQuit,
  onNextRound,
}: {
  m: Match;
  viewer: Idx;
  draft: Code;
  setDraft: (c: Code) => void;
  dispatch: (a: Action) => void;
  onQuit: () => void;
  onNextRound: () => void;
}) {
  const { settings } = useStore();
  const t = useT();
  const opp = (1 - viewer) as Idx;
  const mine = m.guesses[viewer];
  const theirs = m.guesses[opp];
  const n = mine.length;
  const secret = m.secrets[opp];
  const initialN = useRef(n);
  const [shownN, setShownN] = useState(n);
  const [note, setNote] = useState('');
  const [shake, setShake] = useState(0);
  const [overlayReady, setOverlayReady] = useState(false);

  // natija oldin "kutish" holatida turadi, so'ng rangga aylanadi
  useEffect(() => {
    if (shownN >= n) return;
    const t = setTimeout(() => {
      setShownN(n);
      const h = mine[n - 1].hits;
      if (h === 3) sfx.good(3);
      else if (h > 0) sfx.good(h);
      else sfx.bad();
    }, 560);
    return () => clearTimeout(t);
  }, [n, shownN, mine]);

  const revealedAll = shownN >= n;
  const roundOver = m.phase === 'roundEnd' || m.phase === 'matchEnd';
  const lockOpen = roundOver && revealedAll;

  useEffect(() => {
    if (!roundOver || !revealedAll) return;
    const t = setTimeout(() => {
      setOverlayReady(true);
      const humanWon = m.mode === 'bot' ? m.rounds[m.rounds.length - 1]?.winner === 0 : true;
      humanWon ? sfx.win() : sfx.lose();
    }, 1700);
    return () => clearTimeout(t);
  }, [roundOver, revealedAll, m.mode, m.rounds]);

  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(''), 1800);
    return () => clearTimeout(t);
  }, [note]);

  const myTurn = m.phase === 'play' && m.turn === viewer;
  const canSubmit = myTurn && revealedAll;

  const submit = () => {
    if (mine.some((g) => codeKey(g.code) === codeKey(draft))) {
      setNote(t('dupGuess'));
      setShake((k) => k + 1);
      sfx.bad();
      return;
    }
    sfx.send();
    dispatch({ type: 'GUESS', code: draft });
  };

  const eliminated = eliminatedFromGuesses(mine);
  const last = shownN > 0 ? mine[shownN - 1] : null;
  const lastTheirs = theirs[theirs.length - 1];
  const botThinking = m.mode === 'bot' && m.phase === 'play' && m.turn === 1;
  const rows = mine.map((g, i) => ({ g, i })).reverse();

  return (
    <motion.div className="screen board" {...pageAnim}>
      <TopBar
        title={t('roundOf', { n: m.round, m: MAX_ROUNDS })}
        onBack={onQuit}
        right={
          <IconBtn
            name={settings.sound ? 'sound' : 'mute'}
            label={t('sound')}
            onClick={() => setSettings({ sound: !settings.sound })}
          />
        }
      />

      <div className="chips" style={{ marginTop: 6 }}>
        <PlayerChip m={m} i={0} />
        <PlayerChip m={m} i={1} />
      </div>

      {m.mode === 'bot' && (
        <div className="row" style={{ justifyContent: 'center', height: 34, marginTop: 4 }}>
          {botThinking ? (
            <>
              <span className="caption" style={{ fontWeight: 800 }}>{t('thinking', { name: m.names[1] })}</span>
              <BotThinking />
            </>
          ) : lastTheirs ? (
            <>
              <span className="caption" style={{ fontWeight: 800 }}>{t('botGuess', { name: m.names[1] })}</span>
              <div style={{ width: 118 }}>
                <GuessPill key={theirs.length} code={lastTheirs.code} hits={lastTheirs.hits} fresh />
              </div>
            </>
          ) : (
            <span className="caption" style={{ fontWeight: 700 }}>{t('botNone', { name: m.names[1] })}</span>
          )}
        </div>
      )}

      <div className="locks" style={{ marginTop: 8, gridAutoRows: 'clamp(48px, 8.5dvh, 84px)' }}>
        {[0, 1, 2].map((i) => (
          <Lock key={i} open={lockOpen} digit={secret?.[i]} index={i} />
        ))}
      </div>

      <div key={shake} className={shake ? 'shake' : ''} style={{ marginTop: 8 }}>
        <CodeInput value={draft} onChange={setDraft} locked={!canSubmit} />
      </div>

      <div className="row" style={{ marginTop: 10, gap: 14 }}>
        <Orb hits={last ? last.hits : null} nonce={shownN} />
        {m.phase === 'turnEnd' && revealedAll ? (
          <Btn arrow onClick={() => dispatch({ type: 'NEXT_TURN' })}>
            {t('turnOf', { name: m.names[opp] })}
          </Btn>
        ) : (
          <Btn arrow disabled={!canSubmit} onClick={submit}>
            {myTurn ? t('check') : botThinking ? t('waiting') : t('check')}
          </Btn>
        )}
      </div>

      <div style={{ position: 'relative', height: 0 }}>
        <AnimatePresence>
          {note && (
            <motion.div
              className="toast"
              style={{ top: 12 }}
              initial={{ opacity: 0, y: -10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              transition={spring}
            >
              {note}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <hr className="dotted" />

      <div className="history">
        {rows.length === 0 && <div className="empty caption">{t('noGuesses')}</div>}
        {rows.map(({ g, i }) => (
          <GuessPill key={i} code={g.code} hits={g.hits} revealed={i < shownN} fresh={i >= initialN.current} />
        ))}
      </div>

      <Elim
        eliminated={eliminated}
        manual={m.manual[viewer]}
        onToggle={(col, digit) => dispatch({ type: 'TOGGLE_NOTE', player: viewer, col, digit })}
      />

      <AnimatePresence>
        {m.phase === 'roundEnd' && overlayReady && <RoundOverlay key="ro" m={m} onNext={onNextRound} />}
      </AnimatePresence>
    </motion.div>
  );
}

/* ---------- raund natijasi ---------- */
function RoundOverlay({ m, onNext }: { m: Match; onNext: () => void }) {
  const t = useT();
  const r = m.rounds[m.rounds.length - 1];
  const humanWon = m.mode === 'bot' ? r.winner === 0 : true;
  const finalRound = m.wins.some((w) => w >= WINS_NEEDED);
  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {humanWon && <Confetti />}
      <motion.div
        className="sheet glass"
        initial={{ scale: 0.7, y: 60, rotateX: 25 }}
        animate={{ scale: 1, y: 0, rotateX: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={softSpring}
      >
        <div className="sub">{t('roundResult', { n: m.round })}</div>
        <h2 className="h1" style={{ margin: '8px 0 4px', fontSize: 30 }}>
          {m.mode === 'bot' ? (humanWon ? t('youCracked') : t('botFirst', { name: m.names[1] })) : <T k="nameWon" name={<span className="grad-text">{m.names[r.winner]}</span>} />}
        </h2>
        <p className="caption">{t('foundIn', { n: r.guesses[r.winner] })}</p>

        <div className="col" style={{ gap: 10, margin: '18px 0' }}>
          {([0, 1] as Idx[]).map((i) => (
            <div key={i} className="row" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 800, fontSize: 14, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t('codeOf', { name: m.names[i] })}
              </span>
              <MiniCode code={r.secrets[i]} />
            </div>
          ))}
        </div>

        <motion.div
          className="glass"
          style={{ borderRadius: 22, padding: '12px 16px', marginBottom: 18 }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...spring, delay: 0.3 }}
        >
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="caption" style={{ fontWeight: 800 }}>{t('earned')}</span>
            <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--good)' }}>
              +<CountUp to={r.points[r.winner]} delay={0.4} />
            </span>
          </div>
        </motion.div>

        <Btn arrow onClick={onNext}>{finalRound ? t('finalResult') : t('nextRound')}</Btn>
      </motion.div>
    </motion.div>
  );
}

/* ---------- o'yin yakuni ---------- */
function MatchOverlay({ m, onRestart, onExit }: { m: Match; onRestart: () => void; onExit: () => void }) {
  const t = useT();
  const w = m.winner ?? 0;
  const humanWon = m.mode === 'bot' ? w === 0 : true;
  useEffect(() => {
    humanWon ? sfx.win() : sfx.lose();
  }, [humanWon]);
  return (
    <motion.div className="overlay" style={{ zIndex: 30 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {humanWon && <Confetti count={60} />}
      <motion.div
        className="sheet glass"
        initial={{ scale: 0.7, y: 80 }}
        animate={{ scale: 1, y: 0 }}
        transition={softSpring}
      >
        <motion.div animate={{ rotate: [0, -8, 8, 0], y: [0, -6, 0] }} transition={{ duration: 2.4, repeat: Infinity }} style={{ display: 'inline-block' }}>
          <Logo size={86} />
        </motion.div>
        <div className="sub">{t('gameOver')}</div>
        <h2 className="h1" style={{ margin: '6px 0 2px', fontSize: 32 }}>
          {m.mode === 'bot' ? (humanWon ? t('youWon') : t('botWon', { name: m.names[1] })) : <T k="nameWinner" name={<span className="grad-text">{m.names[w]}</span>} />}
        </h2>
        <p className="caption">{t('bonusN', { n: MATCH_BONUS })}</p>

        <div className="col" style={{ gap: 8, margin: '16px 0 18px' }}>
          {([0, 1] as Idx[]).map((i) => (
            <div
              key={i}
              className="row glass"
              style={{ borderRadius: 18, padding: '10px 14px', justifyContent: 'space-between', boxShadow: i === w ? '0 0 0 2px var(--p)' : undefined }}
            >
              <span style={{ fontWeight: 800, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.names[i]}</span>
              <span className="row" style={{ gap: 14 }}>
                <span className="caption" style={{ fontWeight: 800 }}>{t('roundsN', { n: m.wins[i] })}</span>
                <b style={{ fontSize: 20 }}><CountUp to={m.points[i]} /></b>
              </span>
            </div>
          ))}
        </div>

        <div className="col" style={{ gap: 10 }}>
          <Btn arrow onClick={onRestart}>{t('playAgain')}</Btn>
          <Btn variant="ghost" onClick={onExit}>{t('home')}</Btn>
        </div>
      </motion.div>
    </motion.div>
  );
}
