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
          50:  "#fff2ee",
          100: "#ffe0d4",
          200: "#ffc2a8",
          300: "#ff9b75",
          400: "#ff6b3d",
          500: "#e64809",
          600: "#cc3f08",
          700: "#a83306",
          800: "#842807",
          900: "#6b2108",
          950: "#3a0e03",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "sans-serif",
        ],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        brand:    "0 4px 24px -4px rgba(230,72,9,0.35)",
        "brand-sm": "0 2px 12px -2px rgba(230,72,9,0.25)",
      },
      animation: {
        "fade-in":   "fadeIn 0.5s ease-out forwards",
        "fade-up":   "fadeUp 0.6s ease-out forwards",
        "fade-down": "fadeDown 0.6s ease-out forwards",
        "slide-up":  "slideUp 0.3s ease-out",
        "pulse-ring":"pulseRing 1.5s cubic-bezier(0.4,0,0.6,1) infinite",
        "slide-in-right": "slideInRight 0.5s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeDown: {
          "0%": { opacity: "0", transform: "translateY(-24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseRing: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: ".4" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
