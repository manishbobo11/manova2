// Mental Wellness Design System
// Consistent blue-white color scheme with subtle wellness accents

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#eff6ff',   // Light sky blue - secondary background
    100: '#dbeafe',  // Very light blue
    200: '#bfdbfe',  // Light blue
    300: '#93c5fd',  // Medium light blue
    400: '#60a5fa',  // Medium blue
    500: '#3b82f6',  // Standard blue
    600: '#2563eb',  // Primary brand blue
    700: '#1d4ed8',  // Darker blue for hover
    800: '#1e40af',  // Dark blue
    900: '#1e3a8a',  // Very dark blue
  },
  
  // Wellness Accent Colors
  accent: {
    teal: '#d1fae5',    // Soft teal for highlights
    mint: '#ecfdf5',    // Very light mint
    sage: '#f0fdf4',    // Light sage green
  },
  
  // Neutral Colors
  neutral: {
    50: '#f9fafb',   // Very light neutral background
    100: '#f3f4f6',  // Light gray
    200: '#e5e7eb',  // Border gray
    300: '#d1d5db',  // Medium gray
    400: '#9ca3af',  // Text secondary
    500: '#6b7280',  // Medium text
    600: '#4b5563',  // Text secondary
    700: '#374151',  // Dark text
    800: '#1f2937',  // Very dark text
    900: '#111827',  // Text primary
  },
  
  // Semantic Colors
  success: {
    50: '#f0fdf4',
    500: '#10b981',
    600: '#059669',
  },
  
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
  },
  
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
  },
};

export const spacing = {
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
};

export const borderRadius = {
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

// Component Styles
export const buttonStyles = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  secondary: 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  outline: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 font-semibold py-3 px-6 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2',
  ghost: 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium py-2 px-4 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2',
};

export const cardStyles = {
  base: 'bg-white rounded-lg shadow-sm ring-1 ring-slate-200 p-6 transition-all duration-200',
  hover: 'hover:shadow-md hover:ring-slate-300',
  interactive: 'hover:shadow-md hover:ring-slate-300 cursor-pointer',
};

export const inputStyles = {
  base: 'w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200',
  error: 'border-red-300 focus:ring-red-500',
  success: 'border-green-300 focus:ring-green-500',
};

export const chipStyles = {
  base: 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all duration-200',
  primary: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
  accent: 'bg-teal-100 text-teal-700',
};

export const typography = {
  h1: 'text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight',
  h2: 'text-3xl md:text-4xl font-bold text-slate-900 tracking-tight',
  h3: 'text-2xl md:text-3xl font-semibold text-slate-900',
  h4: 'text-xl md:text-2xl font-semibold text-slate-900',
  h5: 'text-lg font-semibold text-slate-900',
  h6: 'text-base font-semibold text-slate-900',
  body: 'text-base text-slate-600 leading-relaxed',
  bodyLarge: 'text-lg text-slate-600 leading-relaxed',
  bodySmall: 'text-sm text-slate-600',
  caption: 'text-xs text-slate-500',
};

export const layout = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  section: 'py-12 lg:py-16',
  grid: {
    cols1: 'grid grid-cols-1 gap-6',
    cols2: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    cols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    cols4: 'grid grid-cols-2 md:grid-cols-4 gap-6',
  },
};

// Utility functions
export const getColorClass = (color, shade = 600) => {
  return colors[color]?.[shade] || colors.primary[600];
};

export const getSpacingClass = (size) => {
  return spacing[size] || spacing.md;
};

// CSS Variables for global use
export const cssVariables = `
  :root {
    --color-primary-50: ${colors.primary[50]};
    --color-primary-100: ${colors.primary[100]};
    --color-primary-200: ${colors.primary[200]};
    --color-primary-300: ${colors.primary[300]};
    --color-primary-400: ${colors.primary[400]};
    --color-primary-500: ${colors.primary[500]};
    --color-primary-600: ${colors.primary[600]};
    --color-primary-700: ${colors.primary[700]};
    --color-primary-800: ${colors.primary[800]};
    --color-primary-900: ${colors.primary[900]};
    
    --color-neutral-50: ${colors.neutral[50]};
    --color-neutral-100: ${colors.neutral[100]};
    --color-neutral-200: ${colors.neutral[200]};
    --color-neutral-300: ${colors.neutral[300]};
    --color-neutral-400: ${colors.neutral[400]};
    --color-neutral-500: ${colors.neutral[500]};
    --color-neutral-600: ${colors.neutral[600]};
    --color-neutral-700: ${colors.neutral[700]};
    --color-neutral-800: ${colors.neutral[800]};
    --color-neutral-900: ${colors.neutral[900]};
    
    --color-accent-teal: ${colors.accent.teal};
    --color-accent-mint: ${colors.accent.mint};
    --color-accent-sage: ${colors.accent.sage};
  }
`;

export default {
  colors,
  spacing,
  borderRadius,
  shadows,
  buttonStyles,
  cardStyles,
  inputStyles,
  chipStyles,
  typography,
  layout,
  cssVariables,
}; 