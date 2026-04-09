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
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        drama: ['Cormorant Garamond', 'serif'],
        body: ['Outfit', 'sans-serif']
      }
    },
  },
  plugins: [],
}
