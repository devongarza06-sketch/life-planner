/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./src/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        accent: { DEFAULT: "#6C63FF" },       // keep existing
        surface: { light: "#ffffff", dark: "#1e1e1e" }, // keep existing
        lp: {                                  // new palette
          bg: "#0b1020",
          panel: "#0e1326",
          ring: "#7c3aed",
          accent: "#8b5cf6",
          accent2: "#22d3ee",
          text: "#e5e7eb",
          subtext: "#9ca3af",
        }
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "1.75rem"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        'lp-card': "0 1px 0 0 rgba(255,255,255,0.04), 0 12px 30px -12px rgba(0,0,0,0.5)",
        'lp-pop': "0 10px 35px -10px rgba(139, 92, 246, 0.45)",
      },
      backgroundImage: {
        'lp-hero':
          "radial-gradient(1200px 500px at 20% -10%, rgba(34,211,238,.25), transparent 50%), radial-gradient(1200px 500px at 80% -20%, rgba(139,92,246,.35), transparent 60%), linear-gradient(135deg, #4f46e5 0%, #7c3aed 45%, #db2777 100%)",
        'lp-card':
          "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)",
      },
      backdropBlur: { 12: "12px" },
      animation: { 'pulse-soft': 'pulse 3s ease-in-out infinite' }
    }
  },
  plugins: []
};

