/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',          // 1. SF Pro (อังกฤษ - Apple)
          'BlinkMacSystemFont',     // 1. SF Pro (Chrome on Mac)
          '"ThonburiUI"',           // 2. ThonburiUI (ไทย - Apple Modern UI)
          '"Thonburi"',             // 2. Thonburi (ไทย - Apple Standard)
          '"Inter"',                // 3. Inter (อังกฤษ - Windows)
          '"IBM Plex Sans Thai"',   // 4. IBM Plex Sans Thai (ไทย - Windows)
          'sans-serif' 
        ],
      },
    },
  },
  plugins: [],
}
