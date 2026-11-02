import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'uz.kodbuzar.app',
  appName: 'Kodbuzar',
  webDir: 'dist',
  backgroundColor: '#eef3ff',
  plugins: {
    SplashScreen: {
      launchShowDuration: 1400,
      launchAutoHide: true,
      launchFadeOutDuration: 450,
      backgroundColor: '#eef3ff',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;
