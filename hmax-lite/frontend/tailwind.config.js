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
        // Status Colors
        status: {
          normal: '#00ff9d',
          'normal-glow': 'rgba(0, 255, 157, 0.4)',
          warning: '#f59e0b',
          'warning-glow': 'rgba(245, 158, 11, 0.4)',
          danger: '#ef4444',
          'danger-glow': 'rgba(239, 68, 68, 0.4)',
          tunnel: '#a855f7',
          'tunnel-glow': 'rgba(168, 85, 247, 0.4)',
          info: '#3b82f6',
          'info-glow': 'rgba(59, 130, 246, 0.4)',
        },
        // Route line color
        route: {
          line: '#3b82f6',
          tunnel: '#7c3aed',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Orbitron', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
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
        'neon-green': '0 0 10px #00ff9d, 0 0 20px rgba(0, 255, 157, 0.2)',
        'neon-amber': '0 0 10px #f59e0b, 0 0 20px rgba(245, 158, 11, 0.2)',
        'neon-purple': '0 0 10px #a855f7, 0 0 20px rgba(168, 85, 247, 0.2)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
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
