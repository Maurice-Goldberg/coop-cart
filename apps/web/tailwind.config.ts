import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base colors - White surfaces
        white: {
          DEFAULT: '#ffffff',
          'glass': 'rgba(255, 255, 255, 0.25)',
          'glass-light': 'rgba(255, 255, 255, 0.15)',
          'glass-heavy': 'rgba(255, 255, 255, 0.92)',
        },
        
        // Primary Green (#00A86B)
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#00A86B', // Primary green
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        
        // Accent Orange (#FF6B35)
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#FF6B35', // Accent orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        
        // Neutral gray scale for text/borders
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        
        // Background gradient colors
        'gradient-start': '#f0fdf4', // pale green
        'gradient-mid': '#fef3c7',   // pale yellow
        'gradient-end': '#fed7aa',   // pale orange
      },
      
      borderRadius: {
        'lg': '1rem',
        'xl': '1.5rem',
        '2xl': '2rem',
      },
      
      boxShadow: {
        'soft': '0 8px 24px rgba(0, 0, 0, 0.08)',
        'soft-md': '0 16px 50px rgba(0, 0, 0, 0.10)',
        'soft-lg': '0 24px 80px rgba(0, 0, 0, 0.12)',
        'soft-xl': '0 32px 120px rgba(0, 0, 0, 0.14)',
        'inner-soft': 'inset 0 1px 0 rgba(255, 255, 255, 0.45)',
      },
      
      backdropBlur: {
        'sm': '8px',
        'md': '16px',
        'lg': '28px',
      },
      
      fontFamily: {
        'sans': [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          '"Fira Sans"',
          '"Droid Sans"',
          '"Helvetica Neue"',
          'sans-serif',
        ],
      },
      
      fontSize: {
        'fluid-xs': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
        'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
        'fluid-base': 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 1rem + 0.625vw, 1.5rem)',
        'fluid-xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.875rem)',
        'fluid-2xl': 'clamp(1.5rem, 1.3rem + 1vw, 2.25rem)',
        'fluid-3xl': 'clamp(1.875rem, 1.6rem + 1.375vw, 3rem)',
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'slide-up': 'slideUp 200ms ease-out',
        'button-press': 'buttonPress 160ms ease-out',
        'dialog-in': 'dialogIn 200ms ease-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        buttonPress: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        dialogIn: {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
      
      transitionDuration: {
        '160': '160ms',
        '220': '220ms',
        '320': '320ms',
      },
      
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [
    // Glass utility plugin
    function({ addUtilities }) {
      const glassUtilities = {
        '.glass': {
          'background': 'rgba(255, 255, 255, 0.2)',
          'backdrop-filter': 'blur(16px)',
          '-webkit-backdrop-filter': 'blur(16px)',
          'border': '1px solid rgba(255, 255, 255, 0.3)',
          'box-shadow': '0 8px 24px rgba(0, 0, 0, 0.08)',
        },
        '.glass-light': {
          'background': 'rgba(255, 255, 255, 0.15)',
          'backdrop-filter': 'blur(8px)',
          '-webkit-backdrop-filter': 'blur(8px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
          'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.06)',
        },
        '.glass-heavy': {
          'background': 'rgba(255, 255, 255, 0.92)',
          'backdrop-filter': 'blur(16px)',
          '-webkit-backdrop-filter': 'blur(16px)',
          'border': '1px solid rgba(255, 255, 255, 0.4)',
          'box-shadow': '0 16px 50px rgba(0, 0, 0, 0.10)',
        },
        '.glass-gradient': {
          'background': 'linear-gradient(180deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15))',
          'backdrop-filter': 'blur(16px)',
          '-webkit-backdrop-filter': 'blur(16px)',
          'border': '1px solid rgba(255, 255, 255, 0.3)',
          'box-shadow': '0 8px 24px rgba(0, 0, 0, 0.08)',
        },
      }
      
      addUtilities(glassUtilities)
    },
  ],
} satisfies Config
