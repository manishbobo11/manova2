/**
 * Manova Design System Tokens
 * 
 * This file contains all design tokens organized in a structured format
 * that can be easily imported and used throughout the application.
 * 
 * Usage:
 * import { colors, typography, spacing } from './designSystemTokens';
 */

// ============================================================================
// COLOR TOKENS
// ============================================================================

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#f0f9ff',    // Lightest blue background
    100: '#e0f2fe',   // Light blue background  
    200: '#bae6fd',   // Subtle blue accent
    300: '#7dd3fc',   // Medium blue accent
    400: '#38bdf8',   // Primary blue
    500: '#636AE8',   // Brand blue
    600: '#4f46e5',   // Primary button, active states
    700: '#4338ca',   // Hover states
    800: '#3730a3',   // Dark blue
    900: '#312e81',   // Darkest blue
  },

  // Secondary Brand Colors
  secondary: {
    50: '#faf5ff',    // Lightest purple background
    100: '#f3e8ff',   // Light purple background
    200: '#e9d5ff',   // Subtle purple accent
    300: '#d8b4fe',   // Medium purple accent
    400: '#c084fc',   // Purple accent
    500: '#8b5cf6',   // Purple primary
    600: '#7c3aed',   // Purple hover
    700: '#6d28d9',   // Dark purple
    800: '#5b21b6',   // Darker purple
    900: '#4c1d95',   // Darkest purple
  },

  // Neutral Colors
  neutral: {
    50: '#f9fafb',    // Lightest background
    100: '#f3f4f6',   // Light background
    200: '#e5e7eb',   // Border color
    300: '#d1d5db',   // Input border
    400: '#9ca3af',   // Placeholder text
    500: '#6b7280',   // Secondary text
    600: '#4b5563',   // Primary text
    700: '#374151',   // Dark text
    800: '#1f2937',   // Very dark text
    900: '#111827',   // Darkest text
  },

  // Semantic Colors
  success: {
    50: '#f0fdf4',    // Lightest success background
    100: '#dcfce7',   // Light success background
    200: '#bbf7d0',   // Success accent
    300: '#86efac',   // Medium success
    400: '#4ade80',   // Success accent
    500: '#10b981',   // Success primary
    600: '#059669',   // Success hover
    700: '#047857',   // Dark success
    800: '#065f46',   // Darker success
    900: '#064e3b',   // Darkest success
  },

  warning: {
    50: '#fffbeb',    // Lightest warning background
    100: '#fef3c7',   // Light warning background
    200: '#fde68a',   // Warning accent
    300: '#fcd34d',   // Medium warning
    400: '#fbbf24',   // Warning accent
    500: '#f59e0b',   // Warning primary
    600: '#d97706',   // Warning hover
    700: '#b45309',   // Dark warning
    800: '#92400e',   // Darker warning
    900: '#78350f',   // Darkest warning
  },

  error: {
    50: '#fef2f2',    // Lightest error background
    100: '#fee2e2',   // Light error background
    200: '#fecaca',   // Error accent
    300: '#fca5a5',   // Medium error
    400: '#f87171',   // Error accent
    500: '#ef4444',   // Error primary
    600: '#dc2626',   // Error hover
    700: '#b91c1c',   // Dark error
    800: '#991b1b',   // Darker error
    900: '#7f1d1d',   // Darkest error
  },

  info: {
    50: '#ecfeff',    // Lightest info background
    100: '#cffafe',   // Light info background
    200: '#a5f3fc',   // Info accent
    300: '#67e8f9',   // Medium info
    400: '#22d3ee',   // Info accent
    500: '#06b6d4',   // Info primary
    600: '#0891b2',   // Info hover
    700: '#0e7490',   // Dark info
    800: '#155e75',   // Darker info
    900: '#164e63',   // Darkest info
  },
};

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const typography = {
  // Font Families
  fonts: {
    heading: ['Archivo', 'sans-serif'],  // Headings and banners
    body: ['Inter', 'sans-serif'],       // Body text and UI
    mono: ['JetBrains Mono', 'monospace'], // Code and technical content
  },

  // Font Sizes with Line Heights
  sizes: {
    xs: ['0.75rem', { lineHeight: '1rem' }],        // 12px - Captions
    sm: ['0.875rem', { lineHeight: '1.25rem' }],    // 14px - Small text
    base: ['1rem', { lineHeight: '1.5rem' }],       // 16px - Body text
    lg: ['1.125rem', { lineHeight: '1.75rem' }],    // 18px - Large body
    xl: ['1.25rem', { lineHeight: '1.75rem' }],     // 20px - Subheadings
    '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px - Section headings
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px - Page headings
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px - Hero headings
    '5xl': ['3rem', { lineHeight: '1' }],           // 48px - Large hero
    '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px - Extra large hero
  },

  // Font Weights
  weights: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// ============================================================================
// SPACING TOKENS
// ============================================================================

export const spacing = {
  // Base spacing scale (8px grid system)
  0: '0',
  px: '1px',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',      // 4px
  1.5: '0.375rem',   // 6px
  2: '0.5rem',       // 8px
  2.5: '0.625rem',   // 10px
  3: '0.75rem',      // 12px
  3.5: '0.875rem',   // 14px
  4: '1rem',         // 16px
  5: '1.25rem',      // 20px
  6: '1.5rem',       // 24px
  7: '1.75rem',      // 28px
  8: '2rem',         // 32px
  9: '2.25rem',      // 36px
  10: '2.5rem',      // 40px
  11: '2.75rem',     // 44px
  12: '3rem',        // 48px
  14: '3.5rem',      // 56px
  16: '4rem',        // 64px
  20: '5rem',        // 80px
  24: '6rem',        // 96px
  28: '7rem',        // 112px
  32: '8rem',        // 128px
  36: '9rem',        // 144px
  40: '10rem',       // 160px
  44: '11rem',       // 176px
  48: '12rem',       // 192px
  52: '13rem',       // 208px
  56: '14rem',       // 224px
  60: '15rem',       // 240px
  64: '16rem',       // 256px
  72: '18rem',       // 288px
  80: '20rem',       // 320px
  96: '24rem',       // 384px

  // Custom spacing tokens
  s2: '0.5rem',      // 8px - Tight spacing
  s3: '0.75rem',     // 12px - Small spacing
  s4: '1rem',        // 16px - Base spacing
  s5: '1.25rem',     // 20px - Medium spacing
  s6: '1.5rem',      // 24px - Large spacing
  s7: '1.75rem',     // 28px - Extra large spacing
  s8: '2rem',        // 32px - Section spacing
  s9: '2.25rem',     // 36px - Large section
  s10: '2.5rem',     // 40px - Extra large section
};

// ============================================================================
// BORDER RADIUS TOKENS
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',    // 2px - Small elements
  base: '0.25rem',   // 4px - Default
  md: '0.375rem',    // 6px - Medium
  lg: '0.5rem',      // 8px - Large
  xl: '0.75rem',     // 12px - Extra large
  '2xl': '1rem',     // 16px - Cards
  '3xl': '1.5rem',   // 24px - Large cards
  full: '9999px',    // Pills and buttons
};

// ============================================================================
// SHADOW TOKENS
// ============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',           // Subtle elevation
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', // Default
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // Medium elevation
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // Large elevation
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', // Extra large
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',  // Maximum elevation
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',  // Inner shadow
};

// ============================================================================
// BREAKPOINT TOKENS
// ============================================================================

export const breakpoints = {
  sm: '640px',   // Small devices (phones)
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (laptops)
  xl: '1280px',  // Extra large devices (desktops)
  '2xl': '1536px', // 2X large devices (large desktops)
};

// ============================================================================
// Z-INDEX TOKENS
// ============================================================================

export const zIndex = {
  auto: 'auto',
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modal: '1040',
  popover: '1050',
  tooltip: '1060',
  toast: '1070',
};

// ============================================================================
// ANIMATION TOKENS
// ============================================================================

export const animations = {
  // Duration
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },

  // Easing
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Keyframes
  keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    fadeOut: {
      '0%': { opacity: '1' },
      '100%': { opacity: '0' },
    },
    slideIn: {
      '0%': { transform: 'translateY(-100%)' },
      '100%': { transform: 'translateY(0)' },
    },
    slideOut: {
      '0%': { transform: 'translateY(0)' },
      '100%': { transform: 'translateY(-100%)' },
    },
    scaleIn: {
      '0%': { transform: 'scale(0.9)', opacity: '0' },
      '100%': { transform: 'scale(1)', opacity: '1' },
    },
    scaleOut: {
      '0%': { transform: 'scale(1)', opacity: '1' },
      '100%': { transform: 'scale(0.9)', opacity: '0' },
    },
  },
};

// ============================================================================
// DOMAIN-SPECIFIC TOKENS
// ============================================================================

export const domainTokens = {
  // Domain Colors
  domains: {
    'Work & Career': {
      primary: colors.primary[600],
      secondary: colors.primary[100],
      accent: colors.primary[400],
      gradient: 'from-primary-500 to-primary-600',
    },
    'Personal Life': {
      primary: colors.secondary[600],
      secondary: colors.secondary[100],
      accent: colors.secondary[400],
      gradient: 'from-secondary-500 to-secondary-600',
    },
    'Financial Stress': {
      primary: colors.warning[600],
      secondary: colors.warning[100],
      accent: colors.warning[400],
      gradient: 'from-warning-500 to-warning-600',
    },
    'Health': {
      primary: colors.success[600],
      secondary: colors.success[100],
      accent: colors.success[400],
      gradient: 'from-success-500 to-success-600',
    },
    'Self-Worth & Identity': {
      primary: colors.info[600],
      secondary: colors.info[100],
      accent: colors.info[400],
      gradient: 'from-info-500 to-info-600',
    },
  },

  // Emotion Colors
  emotions: {
    anxious: {
      color: colors.warning[600],
      background: colors.warning[50],
      border: colors.warning[200],
    },
    stressed: {
      color: colors.error[600],
      background: colors.error[50],
      border: colors.error[200],
    },
    overwhelmed: {
      color: colors.error[600],
      background: colors.error[50],
      border: colors.error[200],
    },
    frustrated: {
      color: colors.warning[600],
      background: colors.warning[50],
      border: colors.warning[200],
    },
    calm: {
      color: colors.success[600],
      background: colors.success[50],
      border: colors.success[200],
    },
    happy: {
      color: colors.success[600],
      background: colors.success[50],
      border: colors.success[200],
    },
    neutral: {
      color: colors.neutral[600],
      background: colors.neutral[50],
      border: colors.neutral[200],
    },
    sad: {
      color: colors.info[600],
      background: colors.info[50],
      border: colors.info[200],
    },
    angry: {
      color: colors.error[600],
      background: colors.error[50],
      border: colors.error[200],
    },
    excited: {
      color: colors.secondary[600],
      background: colors.secondary[50],
      border: colors.secondary[200],
    },
  },
};

// ============================================================================
// EXPORT ALL TOKENS
// ============================================================================

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  zIndex,
  animations,
  domainTokens,
}; 