/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Industrial SCADA Dark Mode Palette
        scada: {
          bg: '#0a0e14',
          surface: '#0f172a',
          'surface-elevated': '#141d2e',
          card: '#1e293b',
          'card-hover': '#253449',
          border: '#334155',
          'border-subtle': 'rgba(51, 65, 85, 0.5)',
          text: '#e2e8f0',
          'text-secondary': '#94a3b8',
          muted: '#64748b',
        },
        // Status Colors — saturation < 80%, no purple (LILA BAN)
        status: {
          normal: '#34d399',   // Emerald 400 — operational green
          warning: '#fbbf24',  // Amber 400
          danger: '#f87171',   // Red 400
          tunnel: '#22d3ee',   // Cyan 400 — replaces banned purple
          info: '#60a5fa',     // Blue 400
          muted: '#475569',
        },
        // Route line color
        route: {
          line: '#3b82f6',
          tunnel: '#7c3aed',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-in-right': 'slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-up': 'slide-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'data-pulse': 'data-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor' },
        },
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            filter: 'drop-shadow(0 0 5px currentColor)',
          },
          '50%': {
            opacity: '0.85',
            filter: 'drop-shadow(0 0 15px currentColor)',
          },
        },
        'slide-in-right': {
          from: {
            opacity: '0',
            transform: 'translateX(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        'slide-in-up': {
          from: {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'data-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'glass-inner': 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'diffuse': '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
