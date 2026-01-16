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
      target: 'esnext', // Veya 'chrome111' gibi modern bir sürüm
      cssTarget: 'chrome111' // CSS Nesting'in yerel desteklendiği sürüm
    }
  }
});
