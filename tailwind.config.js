/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 品牌色
        primary: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        // 思维维度色彩
        hypothesis: {
          light: '#F3F0FF',
          main: '#8B5CF6',
          dark: '#6D28D9',
        },
        reverse: {
          light: '#FFFBEB',
          main: '#F59E0B',
          dark: '#D97706',
        },
        creative: {
          light: '#ECFEFF',
          main: '#06B6D4',
          dark: '#0891B2',
        },
        reflection: {
          light: '#FFFEF3',
          main: '#FCD34D',
          dark: '#F59E0B',
        },
        future: {
          light: '#ECFDF5',
          main: '#10B981',
          dark: '#059669',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-slow': 'bounce 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
