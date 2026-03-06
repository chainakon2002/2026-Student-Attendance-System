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
          '-apple-system',          // 1. San Francisco (English - Apple)
          'BlinkMacSystemFont',     // 1. San Francisco (Chrome on Mac)
          '"Thonburi"',             // 2. Thonburi (Thai - Apple Standard)
          '"Inter"',                // 3. Inter (English - Windows/Android)
          '"IBM Plex Sans Thai"',   // 4. IBM Plex Sans Thai (Thai - Non-Apple)
          'sans-serif'              // 5. ตัวสำรอง
        ],
      },
    },
  },
  plugins: [],
}