/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bukain: {
          green: '#0F3C2F',
          green2: '#165A46',
          gold: '#D3B25A',
          sand: '#F3F2EC'
        }
      },
      boxShadow: {
        soft: '0 12px 30px rgba(0,0,0,0.08)'
      },
      borderRadius: {
        xl: '1.25rem'
      }
    }
  },
  plugins: []
}

