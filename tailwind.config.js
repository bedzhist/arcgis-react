import calcitePreset from "@esri/calcite-tailwind-preset";

/** @type {import('tailwindcss').Config} */
export default {
  presets: [calcitePreset],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

