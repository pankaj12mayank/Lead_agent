/**
 * Typography: Plus Jakarta Sans (headings) + Inter (body, tables, forms).
 */
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'display-tight': '-0.03em',
        'section': '0.02em',
      },
      colors: {
        surface: {
          DEFAULT: 'var(--c-surface-page)',
          raised: 'var(--c-surface-raised)',
          card: 'var(--c-surface-card)',
          border: 'var(--c-surface-border)',
        },
        accent: {
          DEFAULT: 'var(--c-accent)',
          muted: 'var(--c-accent-muted)',
          glow: 'var(--c-accent-glow)',
        },
        ink: {
          DEFAULT: 'var(--c-ink)',
          muted: 'var(--c-ink-muted)',
          subtle: 'var(--c-ink-subtle)',
        },
        field: {
          DEFAULT: 'var(--c-field-bg)',
        },
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        glow: 'var(--shadow-glow)',
        'glow-gold': '0 0 48px rgba(202, 138, 4, 0.14)',
        'glow-emerald': '0 0 40px rgba(16, 185, 129, 0.12)',
      },
      backgroundImage: {
        'premium-card-dark':
          'linear-gradient(145deg, rgba(9, 9, 11, 0.95) 0%, rgba(15, 23, 42, 0.88) 50%, rgba(3, 7, 18, 0.98) 100%)',
        'premium-card-light':
          'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(250, 250, 249, 0.95) 45%, rgba(245, 245, 244, 0.99) 100%)',
        'btn-primary': 'linear-gradient(135deg, #d97706 0%, #ca8a04 45%, #a16207 100%)',
        'btn-primary-hover':
          'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
      },
    },
  },
  plugins: [],
}
