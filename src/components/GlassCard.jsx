import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({
  icon: Icon,
  title,
  value,
  status,
  accent = 'from-blue-400 to-blue-200',
  children,
  className = '',
  ...props
}) => (
  <motion.div
    role="region"
    aria-label={title}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(30,64,175,0.10)' }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 120, damping: 14 }}
    className={`relative bg-white/60 backdrop-blur-xl border border-blue-100 shadow-lg rounded-2xl p-6 flex flex-col ${className}`}
    {...props}
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2 rounded-lg bg-gradient-to-br ${accent} shadow-md flex items-center justify-center`}>
        {Icon && <Icon className="w-6 h-6 text-white" />}
      </div>
      <div className="text-right">
        {typeof value !== 'undefined' && (
          <div className="text-xl font-bold text-blue-900">{value}</div>
        )}
        {status && (
          <div className="text-xs font-medium text-blue-600 mt-1">{status}</div>
        )}
      </div>
    </div>
    <h4 className="font-semibold text-blue-900 mb-2 text-base">{title}</h4>
    {children}
  </motion.div>
);

export default GlassCard; 