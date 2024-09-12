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
  				DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
  			},
  			secondary: {
  				light: '#00a3a3',
  				dark: '#005454',
					original: '#008080',
  				DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
  			},
  			background: {
					DEFAULT: 'hsl(var(--background))',
					muted: 'hsl(var(--background-muted))',
				},
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				border: {
					DEFAULT: 'hsl(var(--border))',
					muted: 'hsl(var(--border-muted))',
				},
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				radius: 'hsl(var(--radius))',
				chart: {
					DEFAULT: 'hsl(var(--chart-1))',
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))',
				},
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
