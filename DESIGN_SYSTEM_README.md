# Manova Design System

A comprehensive, unified design system for the AI-powered wellness platform built with Tailwind CSS and React.

## Overview

The Manova Design System provides a consistent, accessible, and scalable foundation for building wellness-focused user interfaces. It includes design tokens, component patterns, utility functions, and usage examples that ensure visual consistency across the entire application.

## 🎨 Design Tokens

### Colors

The design system uses a carefully crafted color palette optimized for wellness applications:

- **Primary Colors**: Blue-based palette for trust and calm
- **Secondary Colors**: Purple accents for creativity and balance
- **Semantic Colors**: Success (green), Warning (yellow), Error (red), Info (blue)
- **Neutral Colors**: Gray scale for text and backgrounds
- **Domain Colors**: Specific colors for each wellness domain
- **Emotion Colors**: Color coding for different emotional states

### Typography

- **Font Families**: Archivo (headings), Inter (body), JetBrains Mono (code)
- **Font Sizes**: Responsive scale from xs (12px) to 6xl (60px)
- **Font Weights**: Complete range from thin (100) to black (900)
- **Line Heights**: Optimized for readability

### Spacing

- **8px Grid System**: Consistent spacing scale
- **Custom Tokens**: s2-s10 for specific use cases
- **Responsive**: Adapts to different screen sizes

### Border Radius

- **Scale**: From none to full (pills)
- **Common**: xl (12px) for cards, 2xl (16px) for large elements

### Shadows

- **Elevation Levels**: sm, base, md, lg, xl, 2xl
- **Purpose**: Subtle depth and hierarchy

## 🧩 Component Patterns

### Buttons

```jsx
// Primary Button
className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-md bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 hover:scale-105"

// Secondary Button
className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 border-2 border-primary-500 text-primary-600 hover:bg-primary-50 hover:border-primary-600"

// Ghost Button
className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 text-primary-600 hover:bg-primary-50"
```

### Cards

```jsx
// Base Card
className="bg-white rounded-2xl shadow-m border border-neutral-200 overflow-hidden transition-all duration-300"

// Glass Card
className="bg-white/60 backdrop-blur-xl border border-primary-100 shadow-lg"

// Elevated Card
className="shadow-xl border-0"
```

### Inputs

```jsx
// Base Input
className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent bg-white transition-all duration-200"

// Error Input
className="w-full px-4 py-3 rounded-xl border border-error-500 focus:outline-none focus:ring-2 focus:ring-error-300 focus:border-transparent bg-white transition-all duration-200"

// Success Input
className="w-full px-4 py-3 rounded-xl border border-success-500 focus:outline-none focus:ring-2 focus:ring-success-300 focus:border-transparent bg-white transition-all duration-200"
```

### Layouts

```jsx
// Container
className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"

// Section
className="py-8 sm:py-12 md:py-16"

// Grid
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"

// Flex
className="flex flex-col md:flex-row gap-6 lg:gap-8"
```

## 🛠️ Utility Functions

### Wellness Score Colors

```javascript
import { getWellnessScoreColor } from './src/utils/designSystem.js';

const colorClasses = getWellnessScoreColor(75); // Returns gradient classes
```

### Stress Status Colors

```javascript
import { getStressStatusColor } from './src/utils/designSystem.js';

const status = getStressStatusColor(45);
// Returns: { label: "Moderate Concern", color: "text-warning-700", bg: "bg-warning-50", gradient: "from-warning-500 to-warning-600" }
```

### Emotion Colors

```javascript
import { getEmotionColor } from './src/utils/designSystem.js';

const emotionClasses = getEmotionColor('anxious'); // Returns: "text-warning-600 bg-warning-50"
```

### Domain Colors

```javascript
import { getDomainColor } from './src/utils/designSystem.js';

const domainGradient = getDomainColor('Work & Career'); // Returns: "from-primary-500 to-primary-600"
```

## 📱 Responsive Design

The design system is built with mobile-first responsive design:

- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- **Responsive Text**: Automatically scales based on screen size
- **Responsive Spacing**: Adapts padding and margins
- **Responsive Grids**: Flexible layouts that work on all devices

## 🎭 Animations

### Framer Motion Variants

```javascript
import { animations } from './src/utils/designSystem.js';

// Fade In
<motion.div variants={animations.fadeIn} />

// Slide Up
<motion.div variants={animations.slideUp} />

// Scale In
<motion.div variants={animations.scaleIn} />

// Stagger
<motion.div variants={animations.stagger} />
```

### Hover Animations

```javascript
// Hover Scale
<motion.div whileHover={animations.hover} />

// Tap Animation
<motion.div whileTap={animations.tap} />
```

## 🎯 Domain-Specific Styling

Each wellness domain has its own color theme:

- **Work & Career**: Primary blue gradient
- **Personal Life**: Secondary purple gradient
- **Financial Stress**: Warning yellow gradient
- **Health**: Success green gradient
- **Self-Worth & Identity**: Info blue gradient

## 😊 Emotion-Based Styling

Emotions are color-coded for intuitive understanding:

- **Anxious/Frustrated**: Warning colors
- **Stressed/Overwhelmed/Angry**: Error colors
- **Calm/Happy**: Success colors
- **Neutral**: Neutral colors
- **Sad**: Info colors
- **Excited**: Secondary colors

## 📊 Usage Examples

### Basic Button Component

```jsx
import React from 'react';
import { componentPatterns } from './src/utils/designSystemExample.js';

const Button = ({ variant = 'primary', children, ...props }) => {
  const baseClasses = componentPatterns.buttons[variant] || componentPatterns.buttons.primary;
  
  return (
    <button className={baseClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;
```

### Wellness Score Component

```jsx
import React from 'react';
import { utilityExamples } from './src/utils/designSystemExample.js';

const WellnessScore = ({ score, className = '' }) => {
  const colorClasses = utilityExamples.getWellnessScoreColor(score);
  
  return (
    <div className={`text-center ${className}`}>
      <div className={`text-4xl font-bold bg-gradient-to-r ${colorClasses} bg-clip-text text-transparent`}>
        {score}/10
      </div>
      <p className="text-neutral-600 mt-2">Wellness Score</p>
    </div>
  );
};

export default WellnessScore;
```

### Domain Header Component

```jsx
import React from 'react';
import { utilityExamples } from './src/utils/designSystemExample.js';

const DomainHeader = ({ domain, title, className = '' }) => {
  const gradientClasses = utilityExamples.getDomainColor(domain);
  
  return (
    <div className={`bg-gradient-to-r ${gradientClasses} rounded-xl p-6 text-white ${className}`}>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-white/80 mt-2">{domain}</p>
    </div>
  );
};

export default DomainHeader;
```

## 🔧 Installation & Setup

1. **Import Design System**:
```javascript
import { designTokens, componentPatterns, utilities } from './src/utils/designSystem.js';
```

2. **Use Design Tokens**:
```javascript
import { colors, typography, spacing } from './src/utils/designSystemTokens.js';
```

3. **Access Documentation**:
```javascript
import { designTokensDataframe } from './src/utils/designSystemDocumentation.js';
```

## 📋 Design Token Categories

The design system includes the following token categories:

1. **Typography** (10 tokens)
2. **Colors** (50 tokens)
   - Primary (10)
   - Secondary (10)
   - Semantic (40)
3. **Spacing** (10 tokens)
4. **Border Radius** (9 tokens)
5. **Shadows** (7 tokens)
6. **Breakpoints** (5 tokens)
7. **Z-Index** (8 tokens)
8. **Animations** (8 tokens)
9. **Domain Colors** (5 tokens)
10. **Emotion Colors** (10 tokens)

**Total: 122 design tokens**

## 🎨 Color Palette

### Primary Colors
- 50: #f0f9ff (Lightest blue background)
- 100: #e0f2fe (Light blue background)
- 200: #bae6fd (Subtle blue accent)
- 300: #7dd3fc (Medium blue accent)
- 400: #38bdf8 (Primary blue)
- 500: #636AE8 (Brand blue)
- 600: #4f46e5 (Primary button, active states)
- 700: #4338ca (Hover states)
- 800: #3730a3 (Dark blue)
- 900: #312e81 (Darkest blue)

### Secondary Colors
- 50: #faf5ff (Lightest purple background)
- 100: #f3e8ff (Light purple background)
- 200: #e9d5ff (Subtle purple accent)
- 300: #d8b4fe (Medium purple accent)
- 400: #c084fc (Purple accent)
- 500: #8b5cf6 (Purple primary)
- 600: #7c3aed (Purple hover)
- 700: #6d28d9 (Dark purple)
- 800: #5b21b6 (Darker purple)
- 900: #4c1d95 (Darkest purple)

## 📱 Responsive Breakpoints

- **sm**: 640px (Small devices - phones)
- **md**: 768px (Medium devices - tablets)
- **lg**: 1024px (Large devices - laptops)
- **xl**: 1280px (Extra large devices - desktops)
- **2xl**: 1536px (2X large devices - large desktops)

## 🎯 Best Practices

1. **Consistency**: Always use design system tokens instead of custom values
2. **Accessibility**: Ensure proper contrast ratios and focus states
3. **Responsive**: Design mobile-first and scale up
4. **Performance**: Use utility classes efficiently
5. **Maintainability**: Keep components simple and reusable

## 📚 Additional Resources

- **Design Tokens**: `src/utils/designSystemTokens.js`
- **Component Patterns**: `src/utils/designSystem.js`
- **Documentation**: `src/utils/designSystemDocumentation.js`
- **Examples**: `src/utils/designSystemExample.js`
- **Tailwind Config**: `tailwind.config.js`

## 🤝 Contributing

When adding new components or modifying the design system:

1. Update the design tokens file
2. Add component patterns
3. Include usage examples
4. Update documentation
5. Test across different screen sizes
6. Ensure accessibility compliance

---

**Built with ❤️ for mental wellness and user experience** 