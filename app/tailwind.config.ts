import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        warm: {
          50:  '#FDFBF8',
          100: '#FAF8F5',
          200: '#F2EFE9',
          300: '#EAE7E0',
          400: '#E0DDD8',
          500: '#B0ADA6',
          600: '#9C9890',
          700: '#5C5A56',
          800: '#3C3A36',
          900: '#1C1A17',
        },
        amber: {
          50:  '#FFF8F2',
          100: '#FFF3E8',
          200: '#E8C9A0',
          300: '#D4956A',
          400: '#C4845A',
          500: '#A0623A',
          600: '#7A4A1A',
          700: '#5C4A36',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      typography: {
        warm: {
          css: {
            '--tw-prose-body': '#3C3A36',
            '--tw-prose-headings': '#1C1A17',
            maxWidth: 'none',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config