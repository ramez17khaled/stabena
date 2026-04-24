/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a1a1a',
        secondary: '#8b7355',
        accent: '#c4956a',
        muted: '#9a9085',
        border: '#e8e0d6',
        surface: '#ffffff',
        base: '#faf8f5',
        success: '#4a7c59',
        danger: '#c0392b',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
