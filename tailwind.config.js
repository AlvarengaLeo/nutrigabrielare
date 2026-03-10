/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F5F0EB",
        dark: "#111111",
        accent: "#9fc2ff",
        primary: "#1A1A1A",
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
