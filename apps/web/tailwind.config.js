/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Elite Dark Backgrounds
        slate: {
          950: '#0B1020',
          900: '#111827',
          850: '#1A2333',
        },
        // Premium Indigo/Purple (Primary)
        indigo: {
          400: '#A5B4FC',
          500: '#818CF8',
          600: '#6366F1',
          700: '#4F46E5',
        },
        // Premium Cyan (Secondary)
        cyan: {
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
        },
        // Premium Purple (Tertiary)
        violet: {
          400: '#C084FC',
          500: '#A78BFA',
          600: '#8B5CF6',
        },
        // Premium Pink (Accent)
        pink: {
          400: '#F472B6',
          500: '#EC4899',
          600: '#DB2777',
        },
        // Success - Premium Green
        emerald: {
          400: '#4ADE80',
          500: '#10B981',
          600: '#059669',
        },
        // Warning - Premium Amber
        amber: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        // Error - Premium Red
        red: {
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
        },
        // Info - Premium Blue
        blue: {
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
        },
        surface: {
          base: 'var(--surface-base)',
          raised: 'var(--surface-raised)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          default: 'var(--border-default)',
        },
        content: {
          primary: 'var(--content-primary)',
          secondary: 'var(--content-secondary)',
          muted: 'var(--content-muted)',
        },
      },
      fontFamily: {
        // Display - DM Serif for headings
        display: ['DM Serif Display', 'Georgia', 'serif'],
        // Body - DM Sans for readable body text
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        // Mono - for code/technical
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        // Fluid heading scale
        'display-xl': ['clamp(2.5rem, 5vw, 4rem)', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-lg': ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '600' }],
        'display-md': ['clamp(1.5rem, 3vw, 2rem)', { lineHeight: '1.2', fontWeight: '600' }],
        'display-sm': ['clamp(1.25rem, 2vw, 1.5rem)', { lineHeight: '1.3', fontWeight: '600' }],
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
        128: '32rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 16px -4px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 4px 12px -4px rgba(0, 0, 0, 0.08), 0 8px 24px -8px rgba(0, 0, 0, 0.08)',
        'inner-soft': 'inset 0 2px 4px rgba(0, 0, 0, 0.04)',
        // AI signature glows
        'ai-glow': '0 0 20px rgba(139,92,246,0.15), 0 0 40px rgba(139,92,246,0.05)',
        'sky-glow': '0 0 20px rgba(14,165,233,0.2)',
        'card-lift': '0 8px 32px -8px rgba(0,0,0,0.12), 0 2px 8px -2px rgba(0,0,0,0.08)',
      },
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        400: '400ms',
      },
      backgroundImage: {
        'gradient-indigo': 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)',
        'gradient-purple': 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
        'gradient-pink': 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
        'gradient-hero': 'linear-gradient(135deg, #0B1020 0%, #1A2333 50%, #0891B2 100%)',
        'radial-glow': 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.7s ease-out',
        'fade-up': 'fadeUp 0.7s ease-out',
        'fade-down': 'fadeDown 0.7s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeDown: {
          '0%': { opacity: '0', transform: 'translateY(-24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.4), 0 0 40px rgba(99, 102, 241, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(99, 102, 241, 0.6), 0 0 60px rgba(99, 102, 241, 0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(10px)',
        'blur-xl': 'blur(20px)',
        'blur-2xl': 'blur(40px)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '40px',
      },
    },
  },
  plugins: [],
};
