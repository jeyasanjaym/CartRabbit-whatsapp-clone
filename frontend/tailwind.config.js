/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        wa: {
          bg: "#0b141a",
          panel: "#111b21",
          panelHeader: "#202c33",
          border: "#2a3942",
          out: "#005c4b",
          in: "#202c33",
          muted: "#8696a0",
          accent: "#00a884",
        },
      },
    },
  },
  plugins: [],
};
