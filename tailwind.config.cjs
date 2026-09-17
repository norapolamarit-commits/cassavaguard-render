module.exports = {
  darkMode: "class",
  content: [
    "./frontend/index.html",
    "./frontend/src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ee", 100: "#d3e9d6", 200: "#a8d6ae", 300: "#7cc086",
          400: "#5aa860", 500: "#3a8f4a", DEFAULT: "#3a8f4a", 600: "#2c7239",
          700: "#255f30", 800: "#1f5228", 900: "#173d1e",
        },
        /* Warm secondary (terracotta/soil) — a true second primary now, not a
           rare accent. Kept under the historical "cyan2" key so existing
           accent classes across pages recolor to the new warm tone. */
        cyan2: { DEFAULT: "#d9711f", light: "#e89a3c" },
        ink: { DEFAULT: "#0b1220", 800: "#111a2b", 700: "#18233b" },
      },
      fontFamily: {
        sans: ["Inter", "Sukhumvit Set", "Noto Sans Thai", "Sarabun", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      keyframes: {
        fadeup: { "0%": { opacity: 0, transform: "translateY(12px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        fadein: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        floaty: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        pulsering: { "0%": { transform: "scale(.8)", opacity: 0.7 }, "70%,100%": { transform: "scale(2.2)", opacity: 0 } },
        slidein: { "0%": { opacity: 0, transform: "translateX(24px)" }, "100%": { opacity: 1, transform: "translateX(0)" } },
        spinslow: { "100%": { transform: "rotate(360deg)" } },
      },
      animation: {
        fadeup: "fadeup .5s ease-out both",
        fadein: "fadein .4s ease-out both",
        floaty: "floaty 6s ease-in-out infinite",
        shimmer: "shimmer 1.6s infinite",
        pulsering: "pulsering 2.2s ease-out infinite",
        slidein: "slidein .35s ease-out both",
        spinslow: "spinslow 8s linear infinite",
      },
    },
  },
  plugins: [],
};
