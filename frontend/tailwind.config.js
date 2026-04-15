/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#000000',
          raised: '#0a0a0a',
          card: '#0c0c0c',
          border: '#1f1f1f',
        },
        accent: {
          DEFAULT: '#a855f7',
          muted: '#7c3aed',
          glow: 'rgba(168, 85, 247, 0.15)',
        },
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 40px rgba(0,0,0,0.45)',
        glow: '0 0 40px rgba(168, 85, 247, 0.12)',
      },
    },
  },
  plugins: [],
}
