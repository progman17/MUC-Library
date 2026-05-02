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
                // ── Primary scale (driven by CSS variables in index.css) ──────────
                // To change the site's primary color, edit --color-primary-* in
                // src/index.css. No changes needed here.
                primary: {
                    DEFAULT: 'var(--color-primary)',
                    50:      'var(--color-primary-50)',
                    100:     'var(--color-primary-100)',
                    200:     'var(--color-primary-200)',
                    300:     'var(--color-primary-300)',
                    400:     'var(--color-primary-400)',
                    500:     'var(--color-primary-500)',
                    600:     'var(--color-primary-600)',
                    700:     'var(--color-primary-700)',
                    800:     'var(--color-primary-800)',
                    900:     'var(--color-primary-900)',
                    950:     'var(--color-primary-950)',
                },
                secondary: 'var(--color-secondary)',
            },
            fontFamily: {
                sans: ['Inter', 'Roboto', 'sans-serif'],
            },
            boxShadow: {
                'soft':  '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                'card':  '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
                'float': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                'glow':  '0 0 15px var(--color-primary-glow)',
            },
            animation: {
                'fade-in':        'fadeIn 0.5s ease-out',
                'slide-up':       'slideUp 0.5s ease-out',
                'scale-in':       'scaleIn 0.3s ease-out',
                'spin-slow-once': 'spin 1s linear 1',
            },
            keyframes: {
                fadeIn: {
                    '0%':   { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%':   { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)',    opacity: '1' },
                },
                scaleIn: {
                    '0%':   { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)',    opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
