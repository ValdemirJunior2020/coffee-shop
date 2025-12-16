/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        wayfairPurple: "#6F2DBD",
        wayfairPurpleDark: "#5B21B6",
      },
    },
  },
  plugins: [],
};
