/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        tertiary: "var(--color-tertiary)",
        typography: "var(--color-typography)",
      },
    },
    screens: {
      'sm': '400px',  // Establecer 'sm' a partir de 400px
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1280px',
    },
  },
  plugins: [],
};
