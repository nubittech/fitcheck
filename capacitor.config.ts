import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';
const config: CapacitorConfig = {
  appId: 'com.nubittech.veylo',
  appName: 'Veylo',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    // Edge-to-edge: safe-area-inset-bottom'u navigation bar için aktif et
    includePlugins: undefined,
  },
  plugins: {
    StatusBar: {
      style: 'Light',
      backgroundColor: '#f5f2f0',
      overlaysWebView: false,
    },
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#E8DACE',
      showSpinner: false,
    },
    Keyboard: {
      resize: KeyboardResize.Body,
    },
  },
};

export default config;
