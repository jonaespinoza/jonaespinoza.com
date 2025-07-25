const config = {
  content: ["./index.html", "./src/**/*.{js,ts}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4e008f",
          dark: "#23005a",
          accent: "#0e86a5",
        },
        accent: "#0e86a5",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "bounce-gentle": "bounceGentle 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      screens: {
        xs: "475px",
        "3xl": "1600px",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [
    // Plugin para mejorar la accesibilidad
    function ({ addUtilities }) {
      const newUtilities = {
        ".focus-visible\\:focus-visible": {
          "&:focus-visible": {
            outline: "2px solid #0e86a5",
            outlineOffset: "2px",
          },
        },
        ".touch-target": {
          minHeight: "44px",
          minWidth: "44px",
        },
      };
      addUtilities(newUtilities);
    },
  ],
};

export default config;
