import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

const config = {
    darkMode: "class",
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                success: {
                    DEFAULT: "hsl(var(--success))",
                    foreground: "hsl(var(--success-foreground))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                "spotlight": {
                    "0%": { opacity: "0", transform: "translate(-50%, -50%) scale(0.5)" },
                    "100%": { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
                },
                "bg-pan": {
                    "0%": { backgroundPosition: "0% 50%" },
                    "100%": { backgroundPosition: "100% 50%" },
                },
                "shimmer": {
                    "from": { transform: "translateX(-100%)" },
                    "to": { transform: "translateX(100%)" },
                },
                "scan": {
                    "0%": { top: "0%", opacity: "0" },
                    "5%": { opacity: "1" },
                    "90%": { opacity: "1" },
                    "100%": { top: "100%", opacity: "0" },
                },
                "glow-pulse": {
                    "0%": { boxShadow: "0 0 0 0 rgba(59, 130, 246, 0)", borderColor: "rgba(255, 255, 255, 0.05)" },
                    "10%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)", borderColor: "rgba(59, 130, 246, 0.5)" },
                    "100%": { boxShadow: "0 0 0 0 rgba(59, 130, 246, 0)", borderColor: "rgba(255, 255, 255, 0.05)" },
                },
                "aurora-border": {
                    "0%, 100%": { backgroundPosition: "0% 50%" },
                    "50%": { backgroundPosition: "100% 50%" },
                },
                "flash": {
                    "0%": { filter: "brightness(1)" },
                    "50%": { filter: "brightness(2)" },
                    "100%": { filter: "brightness(1)" },
                },
                "blob": {
                    "0%": { transform: "translate(0px, 0px) scale(1)" },
                    "33%": { transform: "translate(30px, -50px) scale(1.1)" },
                    "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
                    "100%": { transform: "translate(0px, 0px) scale(1)" },
                },
                "shimmer-slide": {
                    "0%": { backgroundPosition: "200% 0" },
                    "100%": { backgroundPosition: "-200% 0" }
                }
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "spotlight": "spotlight 2s ease .75s 1 forwards",
                "bg-pan": "bg-pan 3s linear infinite",
                "shimmer": "shimmer 2s linear infinite",
                "glow-pulse": "glow-pulse 3s ease-out forwards",
                "aurora-border": "aurora-border 3s ease-in-out infinite",
                "flash": "flash 0.5s ease-out forwards",
                "blob": "blob 7s infinite",
                "shimmer-slide": "shimmer-slide 3s linear infinite",
            },
        },
    },
    plugins: [tailwindAnimate],
} satisfies Config;

export default config;
