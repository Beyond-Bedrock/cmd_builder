/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-main)',
        foreground: 'var(--text-main)',
        primary: 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        danger: 'var(--danger)',
        'danger-hover': 'var(--danger-hover)',
        accent: 'var(--accent)',
        input: 'var(--bg-input)',
        'input-dark': 'var(--bg-input-dark)',
        border: 'var(--border-color)',
        'border-dark': 'var(--border-color-dark)',
        muted: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--text-main)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', 'sans-serif'],
      },
      backgroundColor: theme => ({
        ...theme('colors'),
        'background': 'var(--bg-main)',
        'card': 'var(--bg-input)',
        'popover': 'var(--bg-input)',
        'muted': 'var(--bg-input-dark)'
      }),
      textColor: theme => ({
        ...theme('colors'),
        'primary': 'var(--primary)',
        'muted': 'var(--accent)'
      }),
      borderColor: theme => ({
        ...theme('colors'),
        DEFAULT: 'var(--border-color)',
        'dark': 'var(--border-color-dark)'
      }),
      ringColor: {
        DEFAULT: 'var(--primary)'
      },
      boxShadow: {
        'focus': '0 0 0 2px var(--primary)'
      }
    },
  },
  plugins: [],
}
