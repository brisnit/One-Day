import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette (from Brand Guidelines.png)
        ink: "#111B27",        // Deep navy text / "Power Yellow" hex
        cloud: "#F6F8FC",      // Surface light
        amber: {
          DEFAULT: "#FBBF24",  // Primary CTA
          hover: "#F4A904",
          pressed: "#D58E00",
          soft: "#FEF3C7",
        },
        brand: {
          blue: "#5E6BF8",     // Primary "Beep Blue"
          sky: "#22C2FA",      // Secondary "Red Rider"
        },
        mint: "#34D399",
        coral: "#F87171",
        // Subtle neutrals built off ink + cloud
        muted: {
          DEFAULT: "#6B7480",
          soft: "#E5E9F2",
        },
      },
      fontFamily: {
        display: ["Roboto", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Desktop scale from brand guidelines
        h1: ["72px", { lineHeight: "80px", fontWeight: "700" }],
        h2: ["48px", { lineHeight: "56px", fontWeight: "700" }],
        h3: ["32px", { lineHeight: "40px", fontWeight: "700" }],
        h4: ["24px", { lineHeight: "32px", fontWeight: "700" }],
      },
      boxShadow: {
        card: "0 1px 2px rgba(17,27,39,0.04), 0 8px 24px rgba(17,27,39,0.06)",
        glow: "0 10px 40px rgba(251,191,36,0.25)",
      },
      backgroundImage: {
        "radial-glow":
          "radial-gradient(circle at 50% 0%, rgba(251,191,36,0.18) 0%, rgba(251,191,36,0) 60%)",
        "ink-fade":
          "linear-gradient(180deg, #0B1320 0%, #111B27 50%, #0B1320 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
