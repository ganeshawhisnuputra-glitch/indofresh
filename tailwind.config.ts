import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#050505",
          surface: "#0d0d0d",
          border: "#1a1a1a",
          muted: "#6b6b6b",
          subtle: "#3a3a3a",
          foreground: "#f5f5f5",
          accent: "#e8e8e8",
        },
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      fontSize: {
        "hero-xl": ["clamp(3rem, 8vw, 7rem)", { lineHeight: "1.0", letterSpacing: "-0.04em" }],
        "hero-lg": ["clamp(2rem, 5vw, 4.5rem)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "hero-md": ["clamp(1.25rem, 2.5vw, 2rem)", { lineHeight: "1.3", letterSpacing: "-0.02em" }],
        "label": ["0.6875rem", { lineHeight: "1", letterSpacing: "0.15em" }],
      },
      animation: {
        "fade-in": "fade-in 0.8s ease forwards",
        "fade-out": "fade-out 0.8s ease forwards",
        "slide-up": "slide-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(40px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      transitionTimingFunction: {
        "apple": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
