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
        "fade-in":   "fadeIn 0.2s ease-out",
        "slide-up":  "slideUp 0.25s ease-out",
        "pulse-ring":"pulseRing 1.5s cubic-bezier(0.4,0,0.6,1) infinite",
      },
      keyframes: {
        fadeIn:   { from: { opacity: "0" },                    to: { opacity: "1" } },
        slideUp:  { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        pulseRing:{ "0%,100%": { opacity: "1" },               "50%": { opacity: ".4" } },
      },
    },
  },
  plugins: [],
};
export default config;
