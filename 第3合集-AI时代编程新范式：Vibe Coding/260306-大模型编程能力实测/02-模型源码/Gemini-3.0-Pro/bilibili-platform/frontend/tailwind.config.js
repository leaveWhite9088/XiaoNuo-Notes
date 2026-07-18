/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bilibili: {
          pink: '#FB7299',
          blue: '#00AEEC',
          gray: '#F1F2F3',
          dark: '#18191C'
        }
      }
    },
  },
  plugins: [],
}
