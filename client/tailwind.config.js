/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          dark: '#0A0A0A',
          light: '#F8F6F2',
        },
        surface: {
          dark: {
            DEFAULT: '#111111',
            muted: '#1A1A1A',
          },
          light: {
            DEFAULT: '#FFFFFF',
            muted: '#F0EDE8',
          },
        },
        border: {
          dark: '#2A2A2A',
          light: '#E0DBD3',
        },
        primary: {
          dark: '#E8D5B7',
          light: '#1A1A1A',
        },
        secondary: {
          dark: '#C9A96E',
          light: '#7A5C3A',
        },
        text: {
          primary: {
            dark: '#F5F0E8',
            light: '#111111',
          },
          secondary: {
            dark: '#8A8A8A',
            light: '#6B6460',
          },
        },
        success: '#4CAF7D',
        warning: '#E8A838',
        danger: '#E05C5C',
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
      },
    },
  },
  plugins: [],
}
