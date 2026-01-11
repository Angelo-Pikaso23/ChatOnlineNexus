/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nexus: {
          bg: "#0f0f1a",
          accent: "#7f5af0",
          bubble: "#1f1f2e",
          user: "#3c4fe0",
          input: "#1a1a2b",
        },
        muted: "#9ca3af",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
