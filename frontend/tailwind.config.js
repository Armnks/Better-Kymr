/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    theme: {
        extend: {
            fontFamily: {
                display: ['"Cabinet Grotesk"', 'sans-serif'],
                cinzel: ['"Cinzel Decorative"', 'serif'],
                serif: ['"Cormorant Garamond"', 'serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            colors: {
                void: '#05050A',
                bone: '#F5F5F0',
                ash: '#666666',
                ember: '#FF2A00',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
};
