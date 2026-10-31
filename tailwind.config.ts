import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#070A0F",
        surface: "#0B0F17",
        "surface-card": "#111827",
        "surface-elevated": "#161F30",
        "surface-border": "#1F293D",
        primary: {
          DEFAULT: "#0066FF",
          hover: "#0052CC",
          glow: "#00D2FF",
        },
        accent: {
          blue: "#3B82F6",
          cyan: "#00D2FF",
          emerald: "#10B981",
          amber: "#F59E0B",
          purple: "#8B5CF6",
          rose: "#F43F5E",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "Courier New", "monospace"],
      },
      boxShadow: {
        "glow-blue": "0 0 25px -5px rgba(0, 102, 255, 0.35)",
        "glow-cyan": "0 0 25px -5px rgba(0, 210, 255, 0.35)",
        "card-subtle": "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
