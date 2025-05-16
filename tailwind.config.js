/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        "church-text": "#2D5A8C",
        "church-income": "#34C759",
        "church-expense": "#FF3B30",
        // Adicione cores do Lovable (exemplo)
        "lovable-primary": "#FF6B6B",
        "lovable-secondary": "#4ECDC4",
      },
      fontFamily: {
        // Se o Lovable especificar uma fonte, adicione aqui
        lovable: ['"Custom Font"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};