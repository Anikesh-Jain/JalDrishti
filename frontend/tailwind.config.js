/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fresh Drinking Water Brand Palette (JalDrishti Water-Blue Theme)
        water: {
          50: '#F0FAFF',    // Pale blue background
          75: '#E5F6FF',    // Pale water blue (Main sidebar surface)
          100: '#E0F7FF',   // Light aqua surface
          200: '#BAE6FD',   // Soft blue border
          300: '#7DD3FC',   // Aqua tint
          400: '#38BDF8',   // Primary water blue
          500: '#0EA5E9',   // Clear blue / secondary
          600: '#0284C7',   // Clear blue (Primary button & active nav)
          700: '#0369A1',   // Deep blue accent / hover
          800: '#075985',   // Deep blue tone
          900: '#1E293B',   // High-contrast headings
          950: '#0F172A',   // Slate deep
        },
        surface: {
          white: '#FFFFFF',
          pale: '#F0FAFF',
          sidebar: '#E5F6FF',
          aqua: '#E0F7FF',
          border: '#BAE6FD',
          neutral: '#F8FCFE',
        },
        env: {
          green: '#DDF8E8',       // Environmental green
          lightGreen: '#E8F8D9',  // Light environmental green
          darkGreen: '#15803D',   // Accessible green text & icons
        },
        waterText: {
          primary: '#334155',    // Accessible neutral dark gray text
          secondary: '#475569',  // Muted blue-gray text
          muted: '#64748B',      // Soft labels
          heading: '#1E293B',    // Dark neutral heading
        },
        // Deep Water Accents & Backward Compatibility
        navy: {
          800: '#163344',
          850: '#112938',
          900: '#0B202D',
          950: '#061620',
        },
        // Primary Oceanic Blue Brand Palette
        brand: {
          50: '#F0FAFF',
          100: '#E0F7FF',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#163344',
        },
        // Three-Tier Water Safety Semantic Status Tokens
        // Safe (Normal Operational Limits - Emerald)
        'status-safe': {
          light: '#ecfdf5',
          border: '#6ee7b7',
          text: '#047857',
          DEFAULT: '#10b981',
          dark: '#065f46',
        },
        // Caution (Warning / Approaching Threshold Limits - Amber)
        'status-caution': {
          light: '#fffbeb',
          border: '#fcd34d',
          text: '#b45309',
          DEFAULT: '#f59e0b',
          dark: '#92400e',
        },
        // Unsafe (Critical Breach / Incident - Rose Red)
        'status-unsafe': {
          light: '#fff1f2',
          border: '#fda4af',
          text: '#be123c',
          DEFAULT: '#f43f5e',
          dark: '#9f1239',
        },
        // Info (Informational Telemetry / System Metadata - Sky Blue)
        'status-info': {
          light: '#f0f9ff',
          border: '#7dd3fc',
          text: '#0369a1',
          DEFAULT: '#0284c7',
          dark: '#075985',
        },
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['IBM Plex Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['IBM Plex Mono', 'JetBrains Mono', 'monospace'],
      },

      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.12)',
        'sidebar': '4px 0 24px 0 rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        'card': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
};
