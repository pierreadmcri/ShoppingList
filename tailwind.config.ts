import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cream: "#f6f0e2",
        sand: "#e9ddc5",
        gold: "#b99357",
        terracotta: "#c94b26",
        olive: "#4f5d20",
        sage: "#8b9764",
        cobalt: "#24559a",
        ink: "#191d14",
        taupe: "#827b6d",
      },
    },
  },
  plugins: [],
};
export default config;
