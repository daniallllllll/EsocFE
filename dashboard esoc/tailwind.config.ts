import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ===== Your TMONE colors =====
        "tmone-blue": "#004F9F",
        "tmone-orange": "#FF7000",
        "tmone-accent": "#00A79D",

        // ===== Required to fix border-border error =====
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },

      boxShadow: {
        card: "0 2px 6px rgba(0,0,0,0.10)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
