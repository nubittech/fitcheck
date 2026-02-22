import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';
const config: CapacitorConfig = {
  appId: 'com.fitcheck.app',
  appName: 'FitCheck',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#0f0f0f',
    },
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#0f0f0f',
      showSpinner: false,
    },
    Keyboard: {
      resize: KeyboardResize.Native,
    },
  },
};

export default config;
