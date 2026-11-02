import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Background } from './components/ui';
import { newMatch, type Match, type Mode } from './game/match';
import Game from './screens/Game';
import History from './screens/History';
import Home from './screens/Home';
import How from './screens/How';
import Setup from './screens/Setup';
import Settings from './screens/Settings';
import { useStore } from './lib/storage';

type Screen =
  | { id: 'home' }
  | { id: 'how' }
  | { id: 'history' }
  | { id: 'settings' }
  | { id: 'setup'; mode: Mode }
  | { id: 'game'; match: Match; run: number };

const page = {
  initial: { opacity: 0, scale: 1.06, filter: 'blur(14px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 0.94, filter: 'blur(14px)' },
  transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] as const },
};

export default function App() {
  const { settings } = useStore();
  const [screen, setScreen] = useState<Screen>({ id: 'home' });

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  useEffect(() => {
    document.documentElement.lang = settings.lang;
  }, [settings.lang]);

  const home = () => setScreen({ id: 'home' });

  return (
    <div className="app">
      <Background />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={screen.id + (screen.id === 'game' ? screen.run : '')} {...page} style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          {screen.id === 'home' && (
            <Home onPlay={(mode) => setScreen({ id: 'setup', mode })} onNav={(s) => setScreen({ id: s })} />
          )}
          {screen.id === 'how' && <How onBack={home} />}
          {screen.id === 'history' && <History onBack={home} />}
          {screen.id === 'settings' && <Settings onBack={home} />}
          {screen.id === 'setup' && (
            <Setup mode={screen.mode} onBack={home} onStart={(match) => setScreen({ id: 'game', match, run: Date.now() })} />
          )}
          {screen.id === 'game' && (
            <Game
              initial={screen.match}
              onExit={home}
              onRestart={() =>
                setScreen({
                  id: 'game',
                  run: Date.now(),
                  match: newMatch(screen.match.mode, screen.match.difficulty, screen.match.names),
                })
              }
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
