/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './src/index.html',
  ],
  theme: {
    extend: {
      // Custom glass effect colors
      backgroundColor: {
        'glass-light': 'rgba(255, 255, 255, 0.05)',
        'glass-medium': 'rgba(255, 255, 255, 0.10)',
        'glass-heavy': 'rgba(255, 255, 255, 0.15)',
      },

      // Backdrop blur values for glass effect
      backdropBlur: {
        'glass-light': '8px',
        'glass-medium': '16px',
        'glass-heavy': '24px',
      },

      // Mesh gradient backgrounds
      backgroundImage: {
        'mesh-gradient-blue': `
          conic-gradient(
            from 180deg at 50% 0%,
            #0ea5e9 0deg,
            #06b6d4 90deg,
            #0891b2 180deg,
            #06b6d4 270deg,
            #0ea5e9 360deg
          )
        `,
        'mesh-gradient-purple': `
          conic-gradient(
            from 180deg at 50% 0%,
            #a855f7 0deg,
            #d946ef 90deg,
            #ec4899 180deg,
            #d946ef 270deg,
            #a855f7 360deg
          )
        `,
        'mesh-gradient-dark': `
          linear-gradient(
            135deg,
            rgba(15, 23, 42) 0%,
            rgba(30, 41, 59) 25%,
            rgba(15, 23, 42) 50%,
            rgba(30, 41, 59) 75%,
            rgba(15, 23, 42) 100%
          )
        `,
      },

      // 3D depth and transform utilities
      zIndex: {
        'depth-1': '1',
        'depth-2': '2',
        'depth-3': '3',
        'depth-4': '4',
      },

      // Enhanced typography for Vision Pro aesthetic
      fontSize: {
        'display': '3rem',
        'headline': '2rem',
        'title': '1.5rem',
        'body': '1rem',
        'caption': '0.875rem',
      },

      // Refined border radius (Apple TV style)
      borderRadius: {
        'glass': '12px',
        'card': '16px',
        'button': '10px',
      },

      // Shadow depths for layered design
      boxShadow: {
        'glass-sm': '0 1px 2px rgba(0, 0, 0, 0.1)',
        'glass-md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'glass-lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'glass-glow': '0 0 20px rgba(59, 130, 246, 0.25)',
        'glass-glow-purple': '0 0 20px rgba(168, 85, 247, 0.25)',
      },

      // Transition durations optimized for smooth animations
      transitionDuration: {
        'micro': '100ms',
        'fast': '200ms',
        'normal': '300ms',
        'slow': '500ms',
      },

      // Animation definitions for framer-motion integration
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      // Keyframes for custom animations
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },

      // Enhanced color palette
      colors: {
        'primary': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        'accent': {
          50: '#f3e8ff',
          100: '#e9d5ff',
          200: '#d8b4fe',
          300: '#c084fc',
          400: '#a855f7',
          500: '#9333ea',
          600: '#7e22ce',
          700: '#6b21a8',
          800: '#581c87',
          900: '#3f0f5c',
        },
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.transform-gpu': {
          transform: 'translateZ(0)',
          'will-change': 'transform',
        },
        '.glass': {
          '@apply backdrop-blur-glass-heavy bg-glass-heavy rounded-glass border border-white/10': {},
        },
        '.glass-light': {
          '@apply backdrop-blur-glass-light bg-glass-light rounded-glass border border-white/5': {},
        },
        '.glass-medium': {
          '@apply backdrop-blur-glass-medium bg-glass-medium rounded-glass border border-white/10': {},
        },
        '.card-glass': {
          '@apply glass px-6 py-4 shadow-glass-md': {},
        },
        '.text-display': {
          '@apply text-display font-bold tracking-tight': {},
        },
        '.text-headline': {
          '@apply text-headline font-semibold': {},
        },
        '.text-title': {
          '@apply text-title font-semibold': {},
        },
        '.mag-field': {
          'transition-all': '0.2s cubic-bezier(0.23, 1, 0.320, 1)',
        },
      };

      addUtilities(newUtilities);
    },
  ],
};
