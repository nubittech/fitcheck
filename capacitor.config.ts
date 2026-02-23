import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';
const config: CapacitorConfig = {
  appId: 'com.veylo.app',
  appName: 'Veylo',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    StatusBar: {
      style: 'Light',
      backgroundColor: '#f5f2f0',
    },
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#FAEDE6',
      showSpinner: false,
    },
    Keyboard: {
      resize: KeyboardResize.Body,
    },
  },
};

export default config;
