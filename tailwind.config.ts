import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pm: {
          bg: "#faf9f6",
          "bg-card": "#fafaf9",
          "bg-hover": "#f5f5f4",
          text: "#1c1917",
          muted: "#78716c",
          faint: "#a8a29e",
          accent: "#c4956a",
          border: "#e5e2de",
          ash: "#d6d3d1",
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', "Georgia", "serif"],
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
