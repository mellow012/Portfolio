/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        foreground: 'var(--color-on-background)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--color-on-primary)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          foreground: 'var(--color-on-secondary)',
        },
        muted: {
          DEFAULT: 'var(--color-surface-container)',
          foreground: 'var(--color-on-surface-variant)',
        },
        accent: {
          DEFAULT: 'var(--color-primary-container)',
          foreground: 'var(--color-on-primary-container)',
        },
        border: 'var(--color-outline-variant)',
        input: 'var(--color-surface-container-low)',
        ring: 'var(--color-primary)',
        card: {
          DEFAULT: 'var(--color-surface-container-high)',
          foreground: 'var(--color-on-surface)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Geist', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
    },
  },
  plugins: [],
}
