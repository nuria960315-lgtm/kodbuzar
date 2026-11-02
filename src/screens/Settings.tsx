import { motion } from 'framer-motion';
import { Segmented, Switch, TopBar, softSpring, spring } from '../components/ui';
import { LANGS, useT, type Key } from '../lib/i18n';
import { sfx } from '../lib/sfx';
import { setSettings, useStore, type Lang, type ThemeId } from '../lib/storage';

const themes: { id: ThemeId; name: Key; grad: string }[] = [
  { id: 'ocean', name: 'themeOcean', grad: 'linear-gradient(150deg,#52a9ff,#1d5cff)' },
  { id: 'violet', name: 'themeViolet', grad: 'linear-gradient(150deg,#c07bff,#7b3dff)' },
  { id: 'sunset', name: 'themeSunset', grad: 'linear-gradient(150deg,#ffb347,#ff5a36)' },
];

export default function Settings({ onBack }: { onBack: () => void }) {
  const { settings } = useStore();
  const t = useT();
  return (
    <div className="screen">
      <TopBar title={t('settings')} onBack={onBack} />
      <div className="col grow scroll" style={{ gap: 20, paddingTop: 20 }}>
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={softSpring}>
          <div className="label">{t('language')}</div>
          <Segmented<Lang>
            items={LANGS.map((l) => ({ id: l.id, label: l.name }))}
            value={settings.lang}
            onChange={(lang) => setSettings({ lang })}
          />
        </motion.div>

        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...softSpring, delay: 0.06 }}>
          <div className="label">{t('theme')}</div>
          <div className="glass card row" style={{ justifyContent: 'space-around', padding: '20px 10px' }}>
            {themes.map((th) => (
              <motion.button
                key={th.id}
                className="col"
                style={{ alignItems: 'center', gap: 10 }}
                whileTap={{ scale: 0.85 }}
                onClick={() => {
                  sfx.tap();
                  setSettings({ theme: th.id });
                }}
              >
                <motion.span
                  className={`swatch ${settings.theme === th.id ? 'on' : ''}`}
                  style={{ background: th.grad }}
                  animate={settings.theme === th.id ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                  transition={spring}
                />
                <span style={{ fontWeight: 800, fontSize: 13 }}>{t(th.name)}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...softSpring, delay: 0.12 }}>
          <div className="label">{t('soundVib')}</div>
          <div className="glass card col" style={{ gap: 16 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 800 }}>{t('soundFx')}</span>
              <Switch label={t('sound')} on={settings.sound} onChange={(v) => setSettings({ sound: v })} />
            </div>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 800 }}>{t('vibration')}</span>
              <Switch label={t('vibration')} on={settings.vibrate} onChange={(v) => setSettings({ vibrate: v })} />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...softSpring, delay: 0.18 }}>
          <div className="label">{t('yourName')}</div>
          <input
            className="field glass"
            value={settings.name}
            maxLength={14}
            placeholder={t('player')}
            onChange={(e) => setSettings({ name: e.target.value })}
          />
        </motion.div>
      </div>
    </div>
  );
}
