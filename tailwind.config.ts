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
          pink: "#FF4FCB",
        },
        lightning: "#E8D5FF",
        gold: {
          DEFAULT: "#D4A017",
          light: "#F0C040",
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
        "glow-pink": "0 0 24px rgba(255,79,203,0.55)",
        "glow-gold": "0 0 24px rgba(212,160,23,0.55)",
        "glow-gold-lg": "0 0 48px rgba(212,160,23,0.65)",
        "outline-white": "0 0 0 2px #FFFFFF",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(212,160,23,0.45)" },
          "50%": { boxShadow: "0 0 36px rgba(212,160,23,0.85)" },
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
