// tailwind.config.js (COMPLETE AND VERIFIED FOR ANIMATIONS)
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scan all JS/JSX files in src
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6B46C1', // A deep purple
        secondary: '#4299E1', // A vibrant blue
        accent: '#F6AD55', // An orange for highlights
        darkbg: '#1A202C', // Dark background for contrast
        lighttext: '#E2E8F0', // Light text on dark backgrounds
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Or 'Roboto', 'Montserrat', etc.
        heading: ['Montserrat', 'sans-serif'], // For titles, if different
      },
      keyframes: {
        // --- Keyframes for blob animation ---
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        // --- Keyframes for fadeIn animation ---
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        // Add more custom keyframes as needed
      },
      animation: {
        // --- Animation utilities for blob ---
        blob: 'blob 7s infinite',
        'blob-2000': 'blob 7s infinite 2s', // Add this for animation-delay-2000
        'blob-4000': 'blob 7s infinite 4s', // Add this for animation-delay-4000
        // --- Animation utilities for fadeIn ---
        fadeIn: 'fadeIn 0.6s ease-out forwards',
        // Add more custom animations as needed
      },
    },
  },
  plugins: [],
}