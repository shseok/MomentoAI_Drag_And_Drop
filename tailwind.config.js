/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        task: "2px 2px 1px rgba(0,0,0,.10)",
      },
    },
  },
  plugins: [],
};
