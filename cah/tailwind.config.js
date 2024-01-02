/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],  
  theme: {
    extend: {
      colors: {
        'primary-black': '#1C1F24',
        'primary-white': '#EFEFEF',
        'primary-orange': '#EE6C4D',
        'primary-blue': '#35A7FF',
        'primary-violet': '#9381FF',
        'secondary-black': '#353B45',
      }
    },
  },
  plugins: [],
}

