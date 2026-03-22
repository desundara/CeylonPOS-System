/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#020B18',
          900: '#040F1E',
          800: '#061528',
          700: '#0A1F3A',
          600: '#0D2847',
          500: '#123560',
          400: '#1A4A80',
          300: '#2563A8',
        },
        ceylon: {
          blue: '#1565C0',
          light: '#1E88E5',
          accent: '#42A5F5',
          glow: '#64B5F6',
        }
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'cursive'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        glow: { '0%': { boxShadow: '0 0 5px #1565C0' }, '100%': { boxShadow: '0 0 20px #42A5F5, 0 0 40px #1565C0' } }
      }
    },
  },
  plugins: [],
}
