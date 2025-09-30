import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
        header: "hsl(var(--header-background))",
        main: "hsl(var(--main-background))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          "muted-foreground": "hsl(var(--sidebar-muted-foreground))",
          active: "hsl(var(--sidebar-active-background))",
          "active-foreground": "hsl(var(--sidebar-active-foreground))",
          border: "hsl(var(--sidebar-border))",
        },
        "admin-sidebar": {
          DEFAULT: "hsl(var(--admin-sidebar-background))",
          foreground: "hsl(var(--admin-sidebar-foreground))",
          "muted-foreground": "hsl(var(--admin-sidebar-muted-foreground))",
          active: "hsl(var(--admin-sidebar-active-background))",
          "active-foreground": "hsl(var(--admin-sidebar-active-foreground))",
          border: "hsl(var(--admin-sidebar-border))",
          ring: "hsl(var(--admin-sidebar-ring))",
        },
        "admin-header": "hsl(var(--admin-header-background))",
        "admin-main-gradient": {
          start: "hsl(var(--admin-main-gradient-start))",
          end: "hsl(var(--admin-main-gradient-end))",
        },
        "admin-card": "hsl(var(--admin-card-background))",
        "student-sidebar": {
          start: "hsl(var(--student-sidebar-background-start))",
          end: "hsl(var(--student-sidebar-background-end))",
          foreground: "hsl(var(--student-sidebar-foreground))",
          "muted-foreground": "hsl(var(--student-sidebar-muted-foreground))",
          active: "hsl(var(--student-sidebar-active-background))",
          "active-foreground": "hsl(var(--student-sidebar-active-foreground))",
          border: "hsl(var(--student-sidebar-border))",
        },
        "student-header": "hsl(var(--student-header-background))",
        "student-main": "hsl(var(--student-main-background))",
        "tutor-sidebar": {
          DEFAULT: "hsl(var(--tutor-sidebar-background))",
          foreground: "hsl(var(--tutor-sidebar-foreground))",
          "muted-foreground": "hsl(var(--tutor-sidebar-muted-foreground))",
          active: "hsl(var(--tutor-sidebar-active-background))",
          "active-foreground": "hsl(var(--tutor-sidebar-active-foreground))",
          border: "hsl(var(--tutor-sidebar-border))",
        },
        "tutor-header": "hsl(var(--tutor-header-background))",
        "tutor-main": "hsl(var(--tutor-main-background))",
        "hod-sidebar": {
          DEFAULT: "hsl(var(--hod-sidebar-background))",
          foreground: "hsl(var(--hod-sidebar-foreground))",
          "muted-foreground": "hsl(var(--hod-sidebar-muted-foreground))",
          active: "hsl(var(--hod-sidebar-active-background))",
          "active-foreground": "hsl(var(--hod-sidebar-active-foreground))",
          border: "hsl(var(--hod-sidebar-border))",
        },
        "hod-header": "hsl(var(--hod-header-background))",
        "hod-main": "hsl(var(--hod-main-background))",
        "principal-sidebar": {
          DEFAULT: "hsl(var(--principal-sidebar-background))",
          foreground: "hsl(var(--principal-sidebar-foreground))",
          "muted-foreground": "hsl(var(--principal-sidebar-muted-foreground))",
          active: "hsl(var(--principal-sidebar-active-background))",
          "active-foreground": "hsl(var(--principal-sidebar-active-foreground))",
          border: "hsl(var(--principal-sidebar-border))",
        },
        "principal-header": "hsl(var(--principal-header-background))",
        "principal-main": "hsl(var(--principal-main-background))",
        // Custom colors for login button hover effect
        "lighter-dark-shade": "hsl(220 30% 25%)",
        "dark-blue-hover": "hsl(220 60% 45%)", // Professional blue color
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-in-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "aurora": {
          from: {
            backgroundPosition: "50% 50%, 50% 50%",
          },
          to: {
            backgroundPosition: "350% 50%, 350% 50%",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "aurora": "aurora 60s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;