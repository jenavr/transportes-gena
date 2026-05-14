/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        display: [
          'Sora',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
      },
      colors: {
        brand: {
          50: '#eefcff',
          100: '#d6f5ff',
          200: '#a9ecff',
          300: '#6fdfff',
          400: '#2fcdff',
          500: '#06b6f0',
          600: '#0091c7',
          700: '#0074a1',
          800: '#075f83',
          900: '#0c4e6c',
        },
        accent: {
          400: '#f7c948',
          500: '#f0b429',
          600: '#de911d',
        },
        ink: {
          950: '#070b14',
          900: '#0b1220',
          800: '#101a2e',
          700: '#172238',
        },
      },
      backgroundImage: {
        'grid-dark':
          'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        'grid-light':
          'linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)',
        'radial-glow':
          'radial-gradient(60% 60% at 50% 0%, rgba(47,205,255,0.25) 0%, rgba(47,205,255,0) 60%)',
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(47,205,255,0.45)',
        card: '0 10px 30px -12px rgba(2, 12, 27, 0.5), 0 4px 12px -6px rgba(2, 12, 27, 0.35)',
        'card-light':
          '0 10px 30px -12px rgba(15, 23, 42, 0.12), 0 4px 12px -6px rgba(15, 23, 42, 0.08)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shine: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-slide-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out both',
        'fade-in': 'fade-in 0.6s ease-out both',
        float: 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        marquee: 'marquee 30s linear infinite',
        shine: 'shine 3s linear infinite',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        'fade-slide-in': 'fade-slide-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        'scale-in': 'scale-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};
