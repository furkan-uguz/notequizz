import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';


export default defineConfig({
  base: './',
  plugins: [tailwindcss()],
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      targets: browserslistToTargets(browserslist('>= 0.25%, not dead')),
    }
  },
  build: {
    cssMinify: 'lightningcss',
  }
});