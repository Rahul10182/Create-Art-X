/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}", // Adjust as needed based on your file structure
    ],
    theme: {
      extend: {
        fontFamily: {
          harry: ['HarryP', 'serif'], // matches your @font-face in index.css
        },
        backgroundImage: {
          parchment: "url('/assets/parchment-texture.jpg')",
        },
        dropShadow: {
          gold: '0 0 15px rgba(255, 215, 0, 0.7)',
        },
      },
    },
    plugins: [],
  };
  