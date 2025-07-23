import React from 'react';
import { motion } from 'framer-motion';

const Card = React.forwardRef(({
  children,
  className = '',
  variant = 'default',
  ...props
}, ref) => {
  const cardVariants = {
    default: "bg-white rounded-2xl shadow-md border border-neutral-200 overflow-hidden transition-all duration-300",
    glass: "bg-white/60 backdrop-blur-xl border border-primary-100 shadow-lg rounded-2xl",
    elevated: "bg-white rounded-2xl shadow-xl border-0"
  };

  const baseClasses = cardVariants[variant] || cardVariants.default;
  const combinedClasses = `${baseClasses} ${className}`.trim();

  return (
    <motion.div
      ref={ref}
      className={combinedClasses}
      whileHover={{ y: -2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
});

const CardHeader = React.forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={`p-6 pb-0 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
});

const CardTitle = React.forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <h3
      ref={ref}
      className={`text-xl font-semibold text-neutral-900 ${className}`.trim()}
      {...props}
    >
      {children}
    </h3>
  );
});

const CardContent = React.forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={`p-6 pt-0 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardTitle.displayName = 'CardTitle';
CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardContent }; 