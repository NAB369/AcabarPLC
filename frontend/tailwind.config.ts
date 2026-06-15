import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: 'var(--foreground)',    /* Slate 900 */
          navy: '#1e293b',    /* Slate 800 */
          accent: 'var(--success-text)',  /* Emerald 600 */
          accentHover: 'var(--success-text)', /* Emerald 700 */
          muted: 'var(--text-muted)'    /* Slate 500 */
        }
      },
      fontFamily: {
        sans: ['Kantumruy Pro', 'Inter', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
export default config
