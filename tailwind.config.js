/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      backgroundImage: {
        'main': "url('/src/assets/images/gradient_background.png')",
      },
      backgroundColor: {
        "menu": "#141215",
        "purple-soft": "#7e22ce",
        "purple-dark": "#4c1d95",
        "surface-dark": "#0f0f13",
      },
      colors: {
        "purple-primary": "#a855f7",
        "purple-secondary": "#9333ea",
      }
    }
  },
  plugins: [],
}