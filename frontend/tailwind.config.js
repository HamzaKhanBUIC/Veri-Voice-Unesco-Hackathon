/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces
        surface: {
          base: '#0E0E0E',
          elevated: '#161616',
          container: '#1F1F22',
          'container-low': '#131315',
          'container-lowest': '#0D0E10',
          'container-high': '#292A2C',
          'container-highest': '#343537',
        },
        border: {
          subtle: '#2A2A2A',
          variant: '#44474D',
          focus: '#7ED4D6',
        },
        // Brand Palette (Derived from VeriVoice Master Icon)
        brand: {
          teal: '#2E5A5A',
          'teal-bright': '#7ED4D6',
          'teal-dim': '#38A3A5',
          navy: '#1A2B48',
          'navy-deep': '#132238',
          'navy-light': '#B6C7EB',
        },
        // Semantic Verdicts
        verdict: {
          true: '#10B981',
          false: '#EF4444',
          mixed: '#F59E0B',
          uncertain: '#64748B',
          research: '#7ED4D6',
        },
        // Text
        text: {
          primary: '#FBF9F3',
          secondary: '#DBDAD4',
          muted: '#8F9098',
        },
      },
      fontFamily: {
        editorial: ['Literata', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        urdu: ['Noto Naskh Arabic', 'Urdu Typesetting', 'serif'],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
        full: '9999px',
      },
      spacing: {
        'page-margin': '40px',
        'panel-gutter': '24px',
        'stack-sm': '8px',
        'stack-md': '16px',
        'stack-lg': '32px',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-up': 'fadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: 0.95, transform: 'scale(1)' },
          '50%': { opacity: 0.75, transform: 'scale(1.015)' },
        },
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
