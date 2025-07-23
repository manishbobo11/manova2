import React from 'react';
import { motion } from 'framer-motion';

const badgeVariants = {
  default: "bg-neutral-100 text-neutral-800 border border-neutral-200",
  primary: "bg-primary-100 text-primary-800 border border-primary-200",
  secondary: "bg-secondary-100 text-secondary-800 border border-secondary-200",
  success: "bg-green-100 text-green-800 border border-green-200",
  warning: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  error: "bg-red-100 text-red-800 border border-red-200",
  info: "bg-blue-100 text-blue-800 border border-blue-200"
};

const badgeSizes = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-2 text-base"
};

const Badge = React.forwardRef(({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const baseClasses = badgeVariants[variant] || badgeVariants.default;
  const sizeClasses = badgeSizes[size] || badgeSizes.md;
  
  const combinedClasses = `inline-flex items-center justify-center rounded-full font-medium transition-colors ${baseClasses} ${sizeClasses} ${className}`.trim();

  return (
    <motion.span
      ref={ref}
      className={combinedClasses}
      whileHover={{ scale: 1.05 }}
      {...props}
    >
      {children}
    </motion.span>
  );
});

Badge.displayName = 'Badge';

export { Badge, badgeVariants, badgeSizes }; 