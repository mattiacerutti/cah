/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				'primary-black': {
          500: '#353B45',
          600 : '#1C1F24' ,
        },
        				'primary-white': '#EFEFEF',
				'primary-orange': '#EE6C4D',
				'primary-blue': '#35A7FF',
				'primary-violet': { 
          500 : '#9381FF' ,
          600 : '#826dff' ,
        },
				'primary-red': {
          500: "#f13b51",
          600: "#ef233c",
        },
			}
		}
	},
	plugins: []
};
