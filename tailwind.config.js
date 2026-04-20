import { heroui } from "@heroui/theme"; // @heroui/react yerine @heroui/theme daha hafiftir

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue,svelte}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui()],
  safelist: [
    'space-y-4',
    'space-y-3.5',
    'space-y-3',
    'space-y-2.5',
    'space-y-2',
    'space-y-1.5',
    'space-y-1',
    'space-y-0.75',
    'space-y-0.5',
    'space-y-0.25',
    'space-y-0',
  ]
};