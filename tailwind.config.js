import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAFAFA",
        dark: "#474445",
        accent: "#D51663",
        primary: "#282828",
        highlight: "#FF88A9",
        health: "#73D9CF",
        fluir: {
          magenta: "#E91E63",
          rose: "#F8BBD0",
          teal: "#5BC0BE",
          lime: "#C4D858",
          ink: "#1A0E14",
          mist: "#FCF3F6",
        },
        pleno: {
          green: "#0E7A3F",
          deep: "#0A4D2E",
          soft: "#E8F1EA",
          mist: "#F4F8F3",
          cream: "#F8F5EE",
          paper: "#FAFAF7",
          ink: "#1A1F1B",
          'ink-soft': "#4A524C",
          'ink-mute': "#8A928C",
          line: "#E5E5E0",
          'line-soft': "#EFEFEA",
        },
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        drama: ['Cormorant Garamond', 'serif'],
        display: ['Fraunces', 'Cormorant Garamond', 'serif'],
        body: ['Outfit', 'sans-serif']
      },
      keyframes: {
        'spin-slow': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
        'float-soft': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'float-soft-rev': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(10px)' },
        },
        'breathe': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.6' },
          '50%': { transform: 'scale(1.05)', opacity: '0.85' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'spin-slow': 'spin-slow 60s linear infinite',
        'float-soft': 'float-soft 6s ease-in-out infinite',
        'float-soft-rev': 'float-soft-rev 7s ease-in-out infinite',
        'breathe': 'breathe 8s ease-in-out infinite',
        'marquee': 'marquee 28s linear infinite',
      },
      screens: {
        xs: '420px',
      },
    },
  },
  plugins: [typography],
}
