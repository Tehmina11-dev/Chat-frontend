import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ffb533",
        secondary: "#ffeae2",
        whatsapp: {
          teal: "#008069",
          light: "#25D366",
          bg: "#f0f2f5",
          chat: "#e5ddd5",
          incoming: "#ffffff",
          outgoing: "#dcf8c6",
        },
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 10px 30px rgba(255,181,51,0.2)",
      },
    },
  },
  plugins: [],
};
export default config;