/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        player: {
          red: '#dc2626',
          'red-light': '#fca5a5',
          'red-dark': '#991b1b',
          blue: '#2563eb',
          'blue-light': '#93c5fd',
          'blue-dark': '#1e40af',
          green: '#16a34a',
          'green-light': '#86efac',
          'green-dark': '#14532d',
          yellow: '#d97706',
          'yellow-light': '#fcd34d',
          'yellow-dark': '#92400e',
        },
        board: {
          bg: '#f5e6c8',
          path: '#fefefe',
          border: '#d4a853',
          safe: '#e8f5e9',
        },
      },
      animation: {
        'dice-roll': 'diceRoll 0.6s ease-in-out',
        'token-bounce': 'tokenBounce 0.3s ease-out',
        'card-flip': 'cardFlip 0.4s ease-in-out',
        'pulse-glow': 'pulseGlow 1s ease-in-out infinite',
        confetti: 'confettiFall 3s ease-in forwards',
      },
      keyframes: {
        diceRoll: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '25%': { transform: 'rotate(90deg) scale(1.1)' },
          '50%': { transform: 'rotate(180deg) scale(0.9)' },
          '75%': { transform: 'rotate(270deg) scale(1.1)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        tokenBounce: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
        cardFlip: {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px 2px currentColor' },
          '50%': { boxShadow: '0 0 15px 6px currentColor' },
        },
        confettiFall: {
          '0%': { transform: 'translateY(-100px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
