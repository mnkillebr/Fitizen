import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
    darkMode: ["class"],
    content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
  	extend: {
  		screens: {
  			xs: '431px'
  		},
  		colors: {
  			primary: {
  				DEFAULT: '#228B22'
  			},
  			secondary: {
  				light: '#00a3a3',
  				dark: '#005454',
  				DEFAULT: '#008080'
  			},
  			accent: {
  				DEFAULT: '#FFD700'
  			},
  			background: {
  				DEFAULT: '#F5F5F5'
  			}
  		},
  		fontFamily: {
  			sans: ['Inter var', ...defaultTheme.fontFamily.sans]
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
