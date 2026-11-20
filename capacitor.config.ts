import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.policeparking.game',
  appName: 'Police Out',
  webDir: 'dist',
  backgroundColor: '#0b1017',
  server: {
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#0b1017',
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SocialLogin: {
      providers: {
        google: true,
        facebook: false,
        apple: false,
        twitter: false,
      },
    },
  },
};

export default config;
