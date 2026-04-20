import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      targets: {
        safari: { major: 13, minor: 0, patch: 0 },
        chrome: { major: 80, minor: 0, patch: 0 }
      }
    }
  },
  build: {
    cssMinify: 'lightningcss',
  }
});