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
      // Lightning CSS'in düzgün çalışması için target'ı netleştiriyoruz
      cssMinify: 'lightningcss',
      target: 'esnext', 
    },
    css: {
      transformer: 'lightningcss',
      lightningcss: {
        // Chrome 111+ CSS Nesting'i ( & ) yerel olarak destekler
        targets: {
          chrome: 111 << 16 // Lightning CSS sürüm formatı (major << 16)
        },
        drafts: {
          customMedia: true // İç içe geçme özelliğini açıkça aktif et
        }
      }
    }
  }
});
