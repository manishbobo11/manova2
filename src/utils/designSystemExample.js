/**
 * Manova Design System Usage Examples
 * 
 * This file demonstrates how to use the design system tokens and patterns
 * in your React components and Tailwind CSS classes.
 * 
 * Usage:
 * import { designSystemExample } from './designSystemExample';
 */

import { designTokensDataframe } from './designSystemDocumentation.js';

// ============================================================================
// DESIGN SYSTEM USAGE EXAMPLES
// ============================================================================

export const designSystemExample = {
  // Example 1: Basic Button Component
  buttonExample: {
    title: "Primary Button",
    description: "Standard primary call-to-action button",
    className: "inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-md bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 hover:scale-105",
    usage: "Use for main actions like 'Submit', 'Continue', 'Sign Up'"
  },

  // Example 2: Card Component
  cardExample: {
    title: "Content Card",
    description: "Standard content card with hover effects",
    className: "bg-white rounded-2xl shadow-m border border-neutral-200 overflow-hidden transition-all duration-300 hover:shadow-l hover:scale-[1.02]",
    usage: "Use for displaying content, forms, and information sections"
  },

  // Example 3: Input Component
  inputExample: {
    title: "Form Input",
    description: "Standard form input with focus states",
    className: "w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent bg-white transition-all duration-200",
    usage: "Use for text inputs, email fields, and form controls"
  },

  // Example 4: Wellness Score Display
  wellnessScoreExample: {
    title: "Wellness Score Indicator",
    description: "Color-coded wellness score display",
    className: "text-2xl font-bold text-center",
    usage: "Display user wellness scores with appropriate color coding",
    variants: {
      good: "text-success-600",
      moderate: "text-warning-600", 
      poor: "text-error-600"
    }
  },

  // Example 5: Domain-Specific Styling
  domainExample: {
    title: "Domain Header",
    description: "Domain-specific color theming",
    className: "bg-gradient-to-r rounded-xl p-6 text-white",
    variants: {
      work: "from-primary-500 to-primary-600",
      personal: "from-secondary-500 to-secondary-600",
      financial: "from-warning-500 to-warning-600",
      health: "from-success-500 to-success-600",
      identity: "from-info-500 to-info-600"
    }
  },

  // Example 6: Emotion Indicator
  emotionExample: {
    title: "Emotion Badge",
    description: "Emotion-based color coding",
    className: "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
    variants: {
      anxious: "text-warning-600 bg-warning-50",
      stressed: "text-error-600 bg-error-50",
      calm: "text-success-600 bg-success-50",
      happy: "text-success-600 bg-success-50",
      neutral: "text-neutral-600 bg-neutral-50"
    }
  },

  // Example 7: Layout Container
  layoutExample: {
    title: "Page Container",
    description: "Responsive page layout container",
    className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    usage: "Use as the main container for page content"
  },

  // Example 8: Grid Layout
  gridExample: {
    title: "Responsive Grid",
    description: "Responsive grid layout for cards",
    className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8",
    usage: "Use for displaying multiple cards or content items"
  },

  // Example 9: Background Pattern
  backgroundExample: {
    title: "Gradient Background",
    description: "Subtle gradient background",
    className: "bg-gradient-to-br from-primary-50 via-white to-secondary-50",
    usage: "Use for page backgrounds and hero sections"
  },

  // Example 10: Animation Example
  animationExample: {
    title: "Animated Card",
    description: "Card with hover animations",
    className: "bg-white rounded-2xl shadow-m border border-neutral-200 overflow-hidden transition-all duration-300 hover:shadow-l hover:scale-[1.02]",
    usage: "Use for interactive elements that need visual feedback"
  }
};

// ============================================================================
// COMPONENT USAGE PATTERNS
// ============================================================================

export const componentPatterns = {
  // Button Patterns
  buttons: {
    primary: "inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-md bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 hover:scale-105",
    secondary: "inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 border-2 border-primary-500 text-primary-600 hover:bg-primary-50 hover:border-primary-600",
    ghost: "inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 text-primary-600 hover:bg-primary-50"
  },

  // Card Patterns
  cards: {
    base: "bg-white rounded-2xl shadow-m border border-neutral-200 overflow-hidden transition-all duration-300",
    glass: "bg-white/60 backdrop-blur-xl border border-primary-100 shadow-lg",
    elevated: "shadow-xl border-0"
  },

  // Input Patterns
  inputs: {
    base: "w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent bg-white transition-all duration-200",
    error: "w-full px-4 py-3 rounded-xl border border-error-500 focus:outline-none focus:ring-2 focus:ring-error-300 focus:border-transparent bg-white transition-all duration-200",
    success: "w-full px-4 py-3 rounded-xl border border-success-500 focus:outline-none focus:ring-2 focus:ring-success-300 focus:border-transparent bg-white transition-all duration-200"
  },

  // Layout Patterns
  layouts: {
    container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    section: "py-8 sm:py-12 md:py-16",
    grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8",
    flex: "flex flex-col md:flex-row gap-6 lg:gap-8"
  },

  // Background Patterns
  backgrounds: {
    gradient: "bg-gradient-to-br from-primary-50 via-white to-secondary-50",
    hero: "bg-gradient-to-br from-primary-50 via-white to-primary-100",
    card: "bg-white",
    glass: "bg-white/90 backdrop-blur-sm"
  }
};

// ============================================================================
// UTILITY FUNCTION EXAMPLES
// ============================================================================

export const utilityExamples = {
  // Wellness Score Color Function
  getWellnessScoreColor: (score) => {
    if (score <= 25) return 'from-success-500 to-success-600';
    if (score <= 50) return 'from-primary-500 to-primary-600';
    if (score <= 75) return 'from-warning-500 to-warning-600';
    return 'from-error-500 to-error-600';
  },

  // Stress Status Function
  getStressStatusColor: (score) => {
    if (score < 35) {
      return {
        label: "Good",
        color: "text-success-600",
        bg: "bg-success-50",
        gradient: "from-success-500 to-success-600"
      };
    }
    if (score < 55) {
      return {
        label: "Moderate Concern",
        color: "text-warning-700",
        bg: "bg-warning-50",
        gradient: "from-warning-500 to-warning-600"
      };
    }
    return {
      label: "High Concern",
      color: "text-error-600",
      bg: "bg-error-50",
      gradient: "from-error-500 to-error-600"
    };
  },

  // Emotion Color Function
  getEmotionColor: (emotion) => {
    const emotionColors = {
      'anxious': 'text-warning-600 bg-warning-50',
      'stressed': 'text-error-600 bg-error-50',
      'overwhelmed': 'text-error-600 bg-error-50',
      'frustrated': 'text-warning-600 bg-warning-50',
      'calm': 'text-success-600 bg-success-50',
      'happy': 'text-success-600 bg-success-50',
      'neutral': 'text-neutral-600 bg-neutral-50',
      'sad': 'text-info-600 bg-info-50',
      'angry': 'text-error-600 bg-error-50',
      'excited': 'text-secondary-600 bg-secondary-50',
    };
    
    return emotionColors[emotion?.toLowerCase()] || 'text-neutral-600 bg-neutral-50';
  },

  // Domain Color Function
  getDomainColor: (domain) => {
    const domainColors = {
      'Work & Career': 'from-primary-500 to-primary-600',
      'Personal Life': 'from-secondary-500 to-secondary-600',
      'Financial Stress': 'from-warning-500 to-warning-600',
      'Health': 'from-success-500 to-success-600',
      'Self-Worth & Identity': 'from-info-500 to-info-600',
    };
    
    return domainColors[domain] || 'from-neutral-500 to-neutral-600';
  }
};

// ============================================================================
// REACT COMPONENT EXAMPLES
// ============================================================================

export const reactComponentExamples = {
  // Button Component
  Button: `
import React from 'react';
import { componentPatterns } from './designSystemExample';

const Button = ({ variant = 'primary', children, ...props }) => {
  const baseClasses = componentPatterns.buttons[variant] || componentPatterns.buttons.primary;
  
  return (
    <button className={baseClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;
  `,

  // Card Component
  Card: `
import React from 'react';
import { componentPatterns } from './designSystemExample';

const Card = ({ variant = 'base', children, className = '', ...props }) => {
  const baseClasses = componentPatterns.cards[variant] || componentPatterns.cards.base;
  
  return (
    <div className={\`\${baseClasses} \${className}\`} {...props}>
      {children}
    </div>
  );
};

export default Card;
  `,

  // Wellness Score Component
  WellnessScore: `
import React from 'react';
import { utilityExamples } from './designSystemExample';

const WellnessScore = ({ score, className = '' }) => {
  const colorClasses = utilityExamples.getWellnessScoreColor(score);
  
  return (
    <div className={\`text-center \${className}\`}>
      <div className={\`text-4xl font-bold bg-gradient-to-r \${colorClasses} bg-clip-text text-transparent\`}>
        {score}/10
      </div>
      <p className="text-neutral-600 mt-2">Wellness Score</p>
    </div>
  );
};

export default WellnessScore;
  `,

  // Domain Header Component
  DomainHeader: `
import React from 'react';
import { utilityExamples } from './designSystemExample';

const DomainHeader = ({ domain, title, className = '' }) => {
  const gradientClasses = utilityExamples.getDomainColor(domain);
  
  return (
    <div className={\`bg-gradient-to-r \${gradientClasses} rounded-xl p-6 text-white \${className}\`}>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-white/80 mt-2">{domain}</p>
    </div>
  );
};

export default DomainHeader;
  `
};

// ============================================================================
// EXPORT ALL EXAMPLES
// ============================================================================

export default {
  designSystemExample,
  componentPatterns,
  utilityExamples,
  reactComponentExamples,
  designTokensDataframe
}; 