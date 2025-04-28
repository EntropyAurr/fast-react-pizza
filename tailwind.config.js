/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Poppins', 'sans-serif'],
    },

    extend: {
      fontFamily: {Alkatra: ['Alkatra', 'system-ui'],
        'Baloo-Bhai-2': ['Baloo Bhai 2', 'sans-serif'],
        'Berkshire-Swash': ['Berkshire Swash', 'serif'],
        'Doppio-One': ['Doppio One', 'sans-serif'],
        Inter: ['Inter', 'sans-serif'],
        'Patua-One': ['Patua One', 'serif'],
        'Tilt-Warp': ['TiltWarp', 'sans-serif'],
        'Titan-One': ['Titan One', 'sans-serif'],
        Tourney: ['Tourney', 'sans-serif'],
        Ubuntu: ['Ubuntu', 'sans-serif'],
      },
      
      height: {
        screen: '100dvh',
      }
    },
  },
  plugins: [],
};

// tailwind default config file lies in: nodes/tailwindcss/stubs/config.full.js