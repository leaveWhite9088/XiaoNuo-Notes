/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bili: {
          pink: '#FB7299',
          pinkHover: '#FF85A7',
          blue: '#00AEEC',
          blueHover: '#00C6FF',
          bg: '#F4F4F4',
          bgDark: '#E3E5E7',
          text: '#18191C',
          textGray: '#9499A0',
          border: '#E3E5E7',
          cardBg: '#FFFFFF',
          divider: '#E3E5E7',
          hover: '#F6F7F8',
          orange: '#FA7298'
        }
      },
      fontFamily: {
        sans: ['"Microsoft YaHei"', 'PingFang SC', 'Hiragino Sans GB', 'Heiti SC', 'Microsoft Sans Serif', 'WenQuanYi Micro Hei', 'sans-serif'],
      }
    },
  },
  plugins: [],
};