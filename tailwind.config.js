/** @type {import('tailwindcss').Config} */

// ============================================================
// VEXONMART PREMIUM TAILWIND CONFIG
// ============================================================
// Edit the hex values in the colors block to retheme instantly.
// Every shadow, radius, and animation is hand-tuned.
// ============================================================

module.exports = {
  content: [
    './src/pages/**/*.js',
    './src/components/**/*.js',
    './src/app/**/*.js',
  ],

  theme: {
    extend: {

      // ── Brand Palette ─────────────────────────────────────
      colors: {
        // Core brand — edit these 4 to retheme entirely
        onyx:      '#0A171D',
        wheat:     '#FFF6E9',
        oceanic:   '#003F47',
        nectarine: '#FFBD76',

        // Derived palette — computed from the core 4
        'onyx-light':       '#13232C',
        'onyx-muted':       '#1C3040',
        'onyx-deep':        '#060E11',
        'oceanic-light':    '#005566',
        'oceanic-bright':   '#007A8F',
        'oceanic-muted':    '#004D5A',
        'nectarine-dark':   '#E8A355',
        'nectarine-light':  '#FFD4A3',
        'nectarine-pale':   '#FFF3E0',
        'wheat-dark':       '#F5E8D2',
        'wheat-muted':      '#EDD9B8',
        'wheat-deep':       '#E2C99A',
        'surface':          '#FFFFFF',
        'surface-warm':     '#FFFBF4',
      },

      // ── Typography ─────────────────────────────────────────
      fontFamily: {
        sans:    ['Roboto', 'system-ui', 'sans-serif'],
        display: ['Syne', 'Roboto', 'system-ui', 'sans-serif'],
        body:    ['Roboto', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Roboto Mono', 'monospace'],
      },

      // ── Spacing extension ──────────────────────────────────
      spacing: {
        '4.5': '1.125rem',
        '18':  '4.5rem',
        '22':  '5.5rem',
        '88':  '22rem',
        '112': '28rem',
        '128': '32rem',
      },

      // ── Border Radius — Jude-approved scale ───────────────
      borderRadius: {
        'xs':   '6px',
        'sm':   '8px',
        DEFAULT:'12px',
        'md':   '14px',
        'lg':   '18px',
        'xl':   '22px',
        '2xl':  '28px',
        '3xl':  '36px',
        'pill': '9999px',
      },

      // ── Premium Shadows ────────────────────────────────────
      boxShadow: {
        // Subtle depth for cards
        'xs':     '0 1px 3px rgba(10,23,29,0.06), 0 1px 2px rgba(10,23,29,0.04)',
        'sm':     '0 2px 8px rgba(10,23,29,0.08), 0 1px 3px rgba(10,23,29,0.05)',
        'card':   '0 3px 16px rgba(10,23,29,0.09), 0 1px 4px rgba(10,23,29,0.06)',
        'card-hover': '0 10px 40px rgba(10,23,29,0.14), 0 3px 12px rgba(10,23,29,0.08)',
        'card-lift':  '0 16px 48px rgba(10,23,29,0.16), 0 5px 16px rgba(10,23,29,0.09)',
        // Brand shadows
        'nectarine':  '0 4px 24px rgba(255,189,118,0.40), 0 2px 8px rgba(255,189,118,0.20)',
        'nectarine-lg':'0 8px 36px rgba(255,189,118,0.52), 0 3px 12px rgba(255,189,118,0.28)',
        'oceanic':    '0 4px 24px rgba(0,63,71,0.30)',
        'oceanic-lg': '0 8px 36px rgba(0,63,71,0.40)',
        // UI
        'modal':   '0 20px 70px rgba(10,23,29,0.28), 0 8px 24px rgba(10,23,29,0.12)',
        'nav':     '0 1px 0 rgba(10,23,29,0.08), 0 4px 16px rgba(10,23,29,0.06)',
        'input-focus': '0 0 0 4px rgba(0,63,71,0.12)',
        'nec-focus':   '0 0 0 4px rgba(255,189,118,0.22)',
        'inset-top':   'inset 0 2px 6px rgba(10,23,29,0.07)',
        // None
        'none': 'none',
      },

      // ── Background Images ──────────────────────────────────
      backgroundImage: {
        // Hero mesh gradient
        'hero':         'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,85,102,0.45) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(255,189,118,0.18) 0%, transparent 60%), linear-gradient(160deg, #060E11 0%, #0A171D 40%, #13232C 100%)',
        // Oceanic gradient
        'oceanic':      'linear-gradient(135deg, #003F47 0%, #005566 100%)',
        'oceanic-rich': 'linear-gradient(135deg, #002E35 0%, #003F47 50%, #005566 100%)',
        // Nectarine gradient
        'nectarine':    'linear-gradient(135deg, #FFBD76 0%, #E8A355 100%)',
        'nectarine-warm':'linear-gradient(135deg, #FFD4A3 0%, #FFBD76 50%, #E8A355 100%)',
        // Card overlays
        'card-overlay': 'linear-gradient(180deg, transparent 40%, rgba(10,23,29,0.75) 100%)',
        'card-overlay-lg': 'linear-gradient(180deg, transparent 30%, rgba(10,23,29,0.88) 100%)',
        // Wheat warmth
        'wheat-gradient': 'linear-gradient(180deg, #FFF6E9 0%, #F5E8D2 100%)',
        // Noise texture (use with mix-blend-mode: overlay)
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },

      // ── Custom Animations ──────────────────────────────────
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(12px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.88)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%,100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%':     { transform: 'translateY(-12px) rotate(1deg)' },
        },
        'ring-pulse': {
          '0%,100%': { transform: 'scale(1)', opacity: '0.5' },
          '50%':     { transform: 'scale(1.2)', opacity: '0' },
        },
        'marquee': {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'badge-pop': {
          '0%':   { transform: 'scale(0)', opacity: '0' },
          '60%':  { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'fade-in':    'fade-in 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'fade-up':    'fade-up 0.55s cubic-bezier(0.16,1,0.3,1) both',
        'scale-in':   'scale-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        'shimmer':    'shimmer 2s linear infinite',
        'float':      'float 4s ease-in-out infinite',
        'ring-pulse': 'ring-pulse 2s ease-in-out infinite',
        'marquee':    'marquee 28s linear infinite',
        'badge-pop':  'badge-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        'spin':       'spin 1s linear infinite',
      },

      // ── Font Sizes ─────────────────────────────────────────
      fontSize: {
        'xs':  ['11.5px', { lineHeight: '16px', letterSpacing: '0.02em' }],
        'sm':  ['13px',   { lineHeight: '20px' }],
        'base':['15px',   { lineHeight: '24px' }],
        'lg':  ['17px',   { lineHeight: '28px' }],
        'xl':  ['20px',   { lineHeight: '30px', letterSpacing: '-0.01em' }],
        '2xl': ['24px',   { lineHeight: '34px', letterSpacing: '-0.015em' }],
        '3xl': ['30px',   { lineHeight: '40px', letterSpacing: '-0.02em' }],
        '4xl': ['38px',   { lineHeight: '48px', letterSpacing: '-0.025em' }],
        '5xl': ['48px',   { lineHeight: '58px', letterSpacing: '-0.03em' }],
        '6xl': ['60px',   { lineHeight: '70px', letterSpacing: '-0.035em' }],
        '7xl': ['76px',   { lineHeight: '84px', letterSpacing: '-0.04em' }],
        '8xl': ['96px',   { lineHeight: '104px',letterSpacing: '-0.045em'}],
      },

      // ── Screen breakpoints ─────────────────────────────────
      screens: {
        'xs': '480px',
      },
    },
  },

  plugins: [],
}
