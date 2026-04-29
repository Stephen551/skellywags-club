import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx,mdx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0D0814",
          secondary: "#1A0F2E",
          card: "#221540",
          "card-hover": "#2D1A55",
        },
        purple: {
          core: "#9B5FC0",
          light: "#C87FE8",
          deep: "#6B2FA0",
        },
        electric: {
          blue: "#4FC3F7",
          pink: "rgb(var(--c-highlight) / <alpha-value>)",
        },
        lightning: "#E8D5FF",
        gold: {
          DEFAULT: "rgb(var(--c-cta) / <alpha-value>)",
          light: "rgb(var(--c-cta-light) / <alpha-value>)",
        },
        text: {
          primary: "#F0E8FF",
          muted: "#9080AA",
          bright: "#FFFFFF",
        },
      },
      fontFamily: {
        bebas: ["var(--font-bebas)", "sans-serif"],
        nunito: ["var(--font-nunito)", "sans-serif"],
        bangers: ["var(--font-bangers)", "cursive"],
      },
      boxShadow: {
        "glow-purple": "0 0 24px rgba(155,95,192,0.45)",
        "glow-purple-lg": "0 0 48px rgba(155,95,192,0.55)",
        "glow-blue": "0 0 24px rgba(79,195,247,0.55)",
        "glow-pink": "0 0 24px rgb(var(--c-highlight) / 0.55)",
        "glow-gold": "0 0 24px rgb(var(--c-cta) / 0.55)",
        "glow-gold-lg": "0 0 48px rgb(var(--c-cta) / 0.7)",
        "outline-white": "0 0 0 2px #FFFFFF",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgb(var(--c-cta) / 0.45)" },
          "50%": { boxShadow: "0 0 40px rgb(var(--c-cta) / 0.85)" },
        },
        "drift": {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
          "100%": { transform: "translateY(0px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out forwards",
        "glow-pulse": "glow-pulse 2.4s ease-in-out infinite",
        "drift": "drift 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
