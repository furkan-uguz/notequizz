import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env': env
    },
    plugins: [
      react(),
      tailwindcss()
    ],
    build: {
      cssMinify: 'lightningcss', // esbuild yerine lightningcss kullan
      target: 'chrome111' // CSS Nesting'i bozmadan bırakması için
    },
    css: {
      transformer: 'lightningcss',
      lightningcss: {
        targets: { chrome: 111 }
      }
    }
  }
});
