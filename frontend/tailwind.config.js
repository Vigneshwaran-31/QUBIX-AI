/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#001428",
        "primary-container": "#0f2942",
        "on-primary": "#ffffff",
        "on-primary-container": "#7991af",
        "primary-fixed": "#d1e4ff",
        "primary-fixed-dim": "#b0c9e8",
        "on-primary-fixed": "#011d35",
        "on-primary-fixed-variant": "#314863",

        "secondary": "#904d00",
        "secondary-container": "#fe932c",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#663500",
        "secondary-fixed": "#ffdcc3",
        "secondary-fixed-dim": "#ffb77d",
        "on-secondary-fixed": "#2f1500",
        "on-secondary-fixed-variant": "#6e3900",

        "tertiary": "#00170d",
        "tertiary-container": "#002e1d",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#21a173",
        "tertiary-fixed": "#85f8c4",
        "tertiary-fixed-dim": "#68dba9",
        "on-tertiary-fixed": "#002114",
        "on-tertiary-fixed-variant": "#005137",

        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",

        "surface": "#f9f9ff",
        "surface-dim": "#cfdaf2",
        "surface-bright": "#f9f9ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f0f3ff",
        "surface-container": "#e7eeff",
        "surface-container-high": "#dee8ff",
        "surface-container-highest": "#d8e3fb",
        "on-surface": "#111c2d",
        "on-surface-variant": "#43474d",
        "outline": "#74777e",
        "outline-variant": "#c3c6ce",
        "surface-tint": "#49607c",
        "background": "#f9f9ff",
        "on-background": "#111c2d",
        "inverse-surface": "#263143",
        "inverse-on-surface": "#ecf1ff",
        "inverse-primary": "#b0c9e8"
      },
      fontFamily: {
        serif: ['"IBM Plex Serif"', 'serif'],
        sans: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
