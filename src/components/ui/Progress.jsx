import React from 'react';
import { motion } from 'framer-motion';

const Progress = React.forwardRef(({
  value = 0,
  max = 100,
  className = '',
  variant = 'default',
  showLabel = false,
  size = 'md',
  ...props
}, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const progressVariants = {
    default: "bg-primary-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
    info: "bg-blue-500"
  };

  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4"
  };

  const baseClasses = "w-full bg-neutral-200 rounded-full overflow-hidden";
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const progressClass = progressVariants[variant] || progressVariants.default;
  
  const combinedClasses = `${baseClasses} ${sizeClass} ${className}`.trim();

  return (
    <div
      ref={ref}
      className={combinedClasses}
      {...props}
    >
      <motion.div
        className={`h-full ${progressClass} rounded-full transition-all duration-300`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      {showLabel && (
        <div className="mt-2 text-sm text-neutral-600 text-center">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
});

Progress.displayName = 'Progress';

export { Progress }; 