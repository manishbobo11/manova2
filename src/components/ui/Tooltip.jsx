import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TooltipContext = React.createContext();

const Tooltip = ({ children, delay = 0.5, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const showTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(() => setIsOpen(true), delay * 1000);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsOpen(false);
  };

  return (
    <TooltipContext.Provider value={{ isOpen, showTooltip, hideTooltip }}>
      <div
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        {...props}
      >
        {children}
      </div>
    </TooltipContext.Provider>
  );
};

const TooltipTrigger = React.forwardRef(({ children, asChild, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});

const TooltipContent = React.forwardRef(({
  children,
  className = '',
  position = 'top',
  ...props
}, ref) => {
  const { isOpen } = React.useContext(TooltipContext);

  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2"
  };

  const arrowClasses = {
    top: "top-full left-1/2 transform -translate-x-1/2 border-t-neutral-800",
    bottom: "bottom-full left-1/2 transform -translate-x-1/2 border-b-neutral-800",
    left: "left-full top-1/2 transform -translate-y-1/2 border-l-neutral-800",
    right: "right-full top-1/2 transform -translate-y-1/2 border-r-neutral-800"
  };

  const baseClasses = "absolute z-50 px-3 py-2 text-sm text-white bg-neutral-800 rounded-lg shadow-lg whitespace-nowrap";
  const positionClass = positionClasses[position] || positionClasses.top;
  const combinedClasses = `${baseClasses} ${positionClass} ${className}`.trim();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          className={combinedClasses}
          initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 5 : position === 'bottom' ? -5 : 0 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: position === 'top' ? 5 : position === 'bottom' ? -5 : 0 }}
          transition={{ duration: 0.15 }}
          {...props}
        >
          {children}
          <div className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`} />
        </motion.div>
      )}
    </AnimatePresence>
  );
});

TooltipTrigger.displayName = 'TooltipTrigger';
TooltipContent.displayName = 'TooltipContent';

export { Tooltip, TooltipTrigger, TooltipContent }; 