import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: "#effdf4",
          100: "#d8fbe4",
          200: "#b5f5cc",
          300: "#7beaab",
          400: "#3bd87f",
          500: "#18bd62",
          600: "#0d984d",
          700: "#0d773f",
          800: "#0f5f35",
          900: "#0d4f2f"
        },
        skysoft: "#dff5ff",
        lemon: "#ffe773",
        coral: "#ff786d"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(20, 139, 78, 0.14)",
        button: "0 6px 0 rgba(12, 126, 65, 0.28)"
      }
    }
  },
  plugins: []
};

export default config;
