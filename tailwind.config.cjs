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
          50: "#eefaf0", 100: "#d3f4da", 200: "#a8e8b8", 300: "#74d68f",
          400: "#43c96e", 500: "#1ba24a", DEFAULT: "#1ba24a", 600: "#158a3f",
          700: "#137a38", 800: "#0f5f2c", 900: "#0b4a23",
        },
        /* Warm secondary (sun/soil). Kept under the historical "cyan2" key so
           existing accent classes across pages recolor to the new warm tone. */
        cyan2: { DEFAULT: "#f4a621", light: "#f6b84a" },
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
