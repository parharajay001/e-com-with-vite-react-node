import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; //Preloading Assets with vite-plugin-pwa
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), VitePWA({ registerType: 'autoUpdate' })],
    server: {
      port: Number(env.VITE_PORT) || 5173, // Load VITE_PORT correctly
    },
  };
});
