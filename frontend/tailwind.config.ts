import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Identidad "perform": naranja terracota (primario), carboncillo, crema.
        brand: {
          50: "#FCF2ED",
          100: "#F9E1D6",
          200: "#F1C5AE",
          300: "#E9A784",
          400: "#E4885C",
          500: "#E06B3B",
          600: "#DD5A2F", // naranja del logo (primario)
          700: "#BC481F",
          800: "#97381A",
          900: "#5E2611",
        },
        ink: {
          DEFAULT: "#26231F",
          soft: "#3A362F",
        },
        paper: "#F0EDE6",
      },
      fontFamily: {
        display: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
