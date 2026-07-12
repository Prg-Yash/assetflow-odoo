/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#FF6600',
        'primary-glow': '#FF8533',
        'primary-dark': '#CC5200',
        dark: '#0B0D13',
        'dark-card': '#161923',
        'dark-elevated': '#1E2233',
        'dark-border': '#252A3E',
        'dark-border-orange': '#FF660044',
      },
    },
  },
  plugins: [],
};
