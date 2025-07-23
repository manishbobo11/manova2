import React from 'react';
import { motion } from 'framer-motion';

const buttonVariants = {
  primary: "inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-md bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 hover:scale-105",
  secondary: "inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 border-2 border-primary-500 text-primary-600 hover:bg-primary-50 hover:border-primary-600",
  ghost: "inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 text-primary-600 hover:bg-primary-50",
  outline: "inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 border-2 border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300",
  destructive: "inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 bg-red-500 text-white hover:bg-red-600 hover:scale-105",
  success: "inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 bg-green-500 text-white hover:bg-green-600 hover:scale-105"
};

const buttonSizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg"
};

const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  ...props
}, ref) => {
  const baseClasses = buttonVariants[variant] || buttonVariants.primary;
  const sizeClasses = buttonSizes[size] || buttonSizes.md;
  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
  
  const combinedClasses = `${baseClasses} ${sizeClasses} ${disabledClasses} ${className}`.trim();

  const renderIcon = () => {
    if (!icon) return null;
    
    const iconElement = React.cloneElement(icon, {
      className: `w-4 h-4 ${iconPosition === 'right' ? 'ml-2' : 'mr-2'}`
    });

    return iconElement;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
          Loading...
        </>
      );
    }

    return (
      <>
        {icon && iconPosition === 'left' && renderIcon()}
        {children}
        {icon && iconPosition === 'right' && renderIcon()}
      </>
    );
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      className={combinedClasses}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      {...props}
    >
      {renderContent()}
    </motion.button>
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants, buttonSizes }; 