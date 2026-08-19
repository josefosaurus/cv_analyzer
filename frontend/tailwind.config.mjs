/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          base: "#0d1211",
          panel: "#111c18",
          panelAlt: "#17231f",
          fern: "#1dbb73",
          fernDeep: "#168a58",
          mint: "#d7f9eb",
          stone: "#f2efe8",
          ink: "#eaf3ec",
          muted: "#9aaea2",
          border: "rgba(255,255,255,0.08)",
        },
      },
      boxShadow: {
        glow: "0 24px 60px rgba(10, 17, 14, 0.42)",
      },
    },
  },
  plugins: [],
};
