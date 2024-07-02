import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        xs: "431px",
      },
      colors: {
        primary: {
          DEFAULT: "#228B22",
        },
        secondary: {
          light: "#00a3a3",
          dark: "#005454",
          DEFAULT: "#008080",
        },
        accent: {
          DEFAULT: "#FFD700",
        },
        background: {
          DEFAULT: "#F5F5F5",
        },
      },
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
} satisfies Config;
