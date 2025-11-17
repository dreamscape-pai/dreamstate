import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        title: ['var(--font-title)', 'serif'],
        subheading: ['var(--font-subheading)', 'cursive'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Dreamstate color palette
        dreamstate: {
          ice: '#f5f7fa',      // Light background
          lavender: '#c6b8e0', // Soft purple
          periwinkle: '#b8c2e0', // Soft blue
          midnight: '#1c1e21', // Dark background
          purple: '#8f7fb8',   // Medium purple
          slate: '#4f5e84',    // Blue-gray
        },
        faction: {
          "deja-vu": {
            DEFAULT: "#7C3AED",
            light: "#A78BFA",
            dark: "#5B21B6",
          },
          lucid: {
            DEFAULT: "#0EA5E9",
            light: "#38BDF8",
            dark: "#0369A1",
          },
          hypnotic: {
            DEFAULT: "#EC4899",
            light: "#F472B6",
            dark: "#BE185D",
          },
          drift: {
            DEFAULT: "#10B981",
            light: "#34D399",
            dark: "#047857",
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
