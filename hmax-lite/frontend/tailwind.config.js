/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Industrial SCADA Dark Mode Palette
        scada: {
          bg: '#06090f',
          surface: '#0a0e14',
          'surface-elevated': '#0f172a',
          card: '#111827',
          'card-hover': '#1a2236',
          border: 'rgba(255,255,255,0.06)',
          'border-hover': 'rgba(255,255,255,0.10)',
          text: '#f1f5f9',
          'text-secondary': '#94a3b8',
          muted: '#64748b',
        },
        // Brand / Accent
        brand: {
          DEFAULT: '#d7ff5f',
          dim: 'rgba(215,255,95,0.15)',
          glow: 'rgba(215,255,95,0.40)',
        },
        // Status Colors — saturation < 80%, no purple
        status: {
          normal: '#34d399',
          warning: '#fbbf24',
          danger: '#ef4444',
          tunnel: '#22d3ee',
          info: '#60a5fa',
          muted: '#475569',
        },
        // Route lines
        route: {
          line1: '#ef4444',
          line2: '#22c55e',
          line3: '#3b82f6',
          tunnel: '#0891b2',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem', letterSpacing: '0.05em' }],
        '3xs': ['0.5rem', { lineHeight: '0.75rem', letterSpacing: '0.08em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
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
        'scan-sweep': 'scan-sweep 4.8s linear infinite',
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 5px currentColor)' },
          '50%': { opacity: '0.85', filter: 'drop-shadow(0 0 15px currentColor)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'data-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        'scan-sweep': {
          from: { transform: 'translateX(-120%)' },
          to: { transform: 'translateX(120%)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'glass-inner': 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'diffuse': '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
        'panel': 'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.35)',
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
