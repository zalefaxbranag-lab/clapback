import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.clapback.app',
  appName: 'ClapBack',
  webDir: 'dist',
  server: {
    url: 'https://clapback-eight.vercel.app',
    cleartext: false,
  },
  ios: {
    backgroundColor: '#0a0a0f',
    contentInset: 'always',
    preferredContentMode: 'mobile',
    scheme: 'ClapBack',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#0a0a0f',
      showSpinner: false,
      launchFadeOutDuration: 300,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#0a0a0f',
    },
  },
};

export default config;
