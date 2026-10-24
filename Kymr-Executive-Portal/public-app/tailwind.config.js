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
                // one contemporary grotesk carries information and statements
                display: ['Satoshi', '"Helvetica Neue"', 'Arial', 'sans-serif'],
                sans: ['Satoshi', '"Helvetica Neue"', 'Arial', 'sans-serif'],
                // The numerals and the small metadata. Named `mono` for
                // the call sites that already reference it; the face is
                // no longer monospace, because the typewriter look was
                // the tell. DM Sans keeps tabular figures via
                // font-variant-numeric on .t-data, which is the only
                // thing the mono was genuinely needed for.
                mono: ['"DM Sans"', 'Satoshi', 'Helvetica Neue', 'Arial', 'sans-serif'],
                // brand face, wordmark only
                cinzel: ['"Cinzel Decorative"', 'serif'],
            },
            fontSize: {
                'f-3xs': ['var(--k-t-3xs)', { lineHeight: '1.4' }],
                'f-2xs': ['var(--k-t-2xs)', { lineHeight: '1.4' }],
                'f-xs': ['var(--k-t-xs)', { lineHeight: '1.45' }],
                'f-sm': ['var(--k-t-sm)', { lineHeight: '1.5' }],
                'f-base': ['var(--k-t-base)', { lineHeight: '1.55' }],
                'f-md': ['var(--k-t-md)', { lineHeight: '1.5' }],
                'f-lg': ['var(--k-t-lg)', { lineHeight: '1.3' }],
                'f-xl': ['var(--k-t-xl)', { lineHeight: '1.15' }],
                'f-2xl': ['var(--k-t-2xl)', { lineHeight: '1.05' }],
                'f-3xl': ['var(--k-t-3xl)', { lineHeight: '1.0' }],
                'f-4xl': ['var(--k-t-4xl)', { lineHeight: '0.92' }],
            },
            maxWidth: { measure: '62ch', 'measure-sm': '46ch' },
            spacing: {
                s1: 'var(--k-s-1)', s2: 'var(--k-s-2)', s3: 'var(--k-s-3)',
                s4: 'var(--k-s-4)', s5: 'var(--k-s-5)', s6: 'var(--k-s-6)',
                s7: 'var(--k-s-7)', s8: 'var(--k-s-8)', s9: 'var(--k-s-9)',
                s10: 'var(--k-s-10)',
                gutter: 'var(--k-gutter)',
                section: 'var(--k-section)',
                rail: 'var(--k-rail)',
            },
            transitionDuration: {
                cut: 'var(--k-dur-cut)',
                ui: 'var(--k-dur-ui)',
                comp: 'var(--k-dur-comp)',
                scene: 'var(--k-dur-scene)',
            },
            transitionTimingFunction: {
                'k-out': 'var(--k-ease-out)',
                'k-inout': 'var(--k-ease-inout)',
            },
            colors: {
                // THE CAMPAIGN GENOME palette. Every value is a token in
                // index.css, so one edit re-grades the whole site.
                carbon: 'var(--carbon)',
                'carbon-lift': 'var(--carbon-lift)',
                graphite: 'var(--graphite)',
                smoke: 'var(--smoke)',
                frost: 'var(--frost)',
                silver: 'var(--silver)',
                'silver-dim': 'var(--silver-dim)',
                signal: 'var(--signal)',
                // aliases so the /start route and shared UI keep compiling
                stage: 'var(--carbon)',
                void: 'var(--carbon)',
                charcoal: 'var(--graphite)',
                edge: 'var(--smoke)',
                paper: 'var(--frost)',
                bone: 'var(--frost)',
                ivory: 'var(--frost)',
                ash: 'var(--silver-dim)',
                ember: 'var(--signal)',
                'ember-deep': '#C41E00',
                brass: 'var(--silver)',
                accent: 'var(--k-accent)',
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
