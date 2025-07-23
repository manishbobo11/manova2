import { motion } from 'framer-motion';

interface AnimatedCharacterProps {
  variant?: 'sitting' | 'standing' | 'thinking' | 'happy';
  className?: string;
}

export function AnimatedCharacter({ variant = 'sitting', className = '' }: AnimatedCharacterProps) {
  if (variant === 'sitting') {
    return (
      <motion.svg
        className={`w-full h-full ${className}`}
        viewBox="0 0 200 200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Person sitting in meditation pose */}
        <motion.g
          animate={{ 
            y: [0, -2, 0],
            rotate: [0, 1, -1, 0] 
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {/* Head */}
          <circle cx="100" cy="60" r="20" fill="#fdb5a6" />
          
          {/* Hair */}
          <path d="M85 50 Q100 40 115 50 Q115 45 100 35 Q85 45 85 50" fill="#8b5a3c" />
          
          {/* Eyes */}
          <motion.g
            animate={{ scaleY: [1, 0.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <circle cx="92" cy="58" r="2" fill="#333" />
            <circle cx="108" cy="58" r="2" fill="#333" />
          </motion.g>
          
          {/* Smile */}
          <path d="M95 65 Q100 70 105 65" stroke="#333" strokeWidth="1.5" fill="none" />
          
          {/* Body */}
          <ellipse cx="100" cy="100" rx="25" ry="30" fill="#4a90e2" />
          
          {/* Arms in meditation pose */}
          <ellipse cx="70" cy="95" rx="8" ry="20" fill="#fdb5a6" transform="rotate(-30 70 95)" />
          <ellipse cx="130" cy="95" rx="8" ry="20" fill="#fdb5a6" transform="rotate(30 130 95)" />
          
          {/* Legs crossed */}
          <ellipse cx="85" cy="140" rx="12" ry="25" fill="#2c3e50" />
          <ellipse cx="115" cy="140" rx="12" ry="25" fill="#2c3e50" />
          
          {/* Feet */}
          <ellipse cx="75" cy="160" rx="8" ry="5" fill="#fdb5a6" />
          <ellipse cx="125" cy="160" rx="8" ry="5" fill="#fdb5a6" />
        </motion.g>
        
        {/* Floating elements around the character */}
        <motion.circle
          cx="150"
          cy="80"
          r="3"
          fill="#4a90e2"
          animate={{ 
            y: [0, -10, 0],
            opacity: [0.5, 1, 0.5] 
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            delay: 0.5 
          }}
        />
        <motion.circle
          cx="50"
          cy="90"
          r="2"
          fill="#7bb3f0"
          animate={{ 
            y: [0, -8, 0],
            opacity: [0.3, 0.8, 0.3] 
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            delay: 1 
          }}
        />
      </motion.svg>
    );
  }

  if (variant === 'thinking') {
    return (
      <motion.svg
        className={`w-full h-full ${className}`}
        viewBox="0 0 200 200"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.g
          animate={{ 
            y: [0, -3, 0] 
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {/* Head */}
          <circle cx="100" cy="70" r="22" fill="#f4c2a1" />
          
          {/* Hair */}
          <path d="M80 55 Q100 40 120 55 Q120 50 100 35 Q80 50 80 55" fill="#6b4423" />
          
          {/* Eyes looking up */}
          <circle cx="92" cy="68" r="2" fill="#333" />
          <circle cx="108" cy="68" r="2" fill="#333" />
          
          {/* Mouth */}
          <path d="M95 78 Q100 75 105 78" stroke="#333" strokeWidth="1.5" fill="none" />
          
          {/* Body */}
          <ellipse cx="100" cy="120" rx="28" ry="35" fill="#27ae60" />
          
          {/* Arms */}
          <ellipse cx="75" cy="115" rx="10" ry="22" fill="#f4c2a1" transform="rotate(-20 75 115)" />
          <ellipse cx="125" cy="115" rx="10" ry="22" fill="#f4c2a1" transform="rotate(20 125 115)" />
          
          {/* Hand near chin */}
          <circle cx="78" cy="85" r="6" fill="#f4c2a1" />
          
          {/* Legs */}
          <ellipse cx="88" cy="160" rx="10" ry="25" fill="#2c3e50" />
          <ellipse cx="112" cy="160" rx="10" ry="25" fill="#2c3e50" />
        </motion.g>
        
        {/* Thought bubbles */}
        <motion.g
          animate={{ 
            opacity: [0, 1, 0] 
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            delay: 0.5 
          }}
        >
          <circle cx="130" cy="50" r="4" fill="#4a90e2" opacity="0.6" />
          <circle cx="140" cy="40" r="6" fill="#4a90e2" opacity="0.4" />
          <circle cx="155" cy="35" r="8" fill="#4a90e2" opacity="0.2" />
        </motion.g>
      </motion.svg>
    );
  }

  if (variant === 'happy') {
    return (
      <motion.svg
        className={`w-full h-full ${className}`}
        viewBox="0 0 200 200"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.g
          animate={{ 
            y: [0, -5, 0],
            rotate: [0, 2, -2, 0] 
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {/* Head */}
          <circle cx="100" cy="65" r="20" fill="#f7d794" />
          
          {/* Hair */}
          <path d="M85 50 Q100 35 115 50 Q115 45 100 30 Q85 45 85 50" fill="#5d4037" />
          
          {/* Happy eyes */}
          <path d="M88 60 Q92 55 96 60" stroke="#333" strokeWidth="2" fill="none" />
          <path d="M104 60 Q108 55 112 60" stroke="#333" strokeWidth="2" fill="none" />
          
          {/* Big smile */}
          <path d="M90 70 Q100 80 110 70" stroke="#333" strokeWidth="2" fill="none" />
          
          {/* Body */}
          <ellipse cx="100" cy="115" rx="25" ry="32" fill="#e74c3c" />
          
          {/* Arms raised in celebration */}
          <motion.ellipse 
            cx="70" 
            cy="90" 
            rx="8" 
            ry="22" 
            fill="#f7d794" 
            transform="rotate(-45 70 90)"
            animate={{ rotate: [-45, -35, -45] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.ellipse 
            cx="130" 
            cy="90" 
            rx="8" 
            ry="22" 
            fill="#f7d794" 
            transform="rotate(45 130 90)"
            animate={{ rotate: [45, 35, 45] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          
          {/* Legs */}
          <ellipse cx="88" cy="155" rx="10" ry="25" fill="#2c3e50" />
          <ellipse cx="112" cy="155" rx="10" ry="25" fill="#2c3e50" />
        </motion.g>
        
        {/* Celebration sparkles */}
        <motion.g
          animate={{ 
            rotate: [0, 360],
            opacity: [0.5, 1, 0.5] 
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity 
          }}
        >
          <path d="M40 40 L42 45 L40 50 L38 45 Z" fill="#ffd700" />
          <path d="M160 60 L162 65 L160 70 L158 65 Z" fill="#ffd700" />
          <path d="M170 100 L172 105 L170 110 L168 105 Z" fill="#ffd700" />
        </motion.g>
      </motion.svg>
    );
  }

  // Default standing variant
  return (
    <motion.svg
      className={`w-full h-full ${className}`}
      viewBox="0 0 200 200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.g
        animate={{ 
          y: [0, -2, 0] 
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        {/* Head */}
        <circle cx="100" cy="60" r="18" fill="#deb887" />
        
        {/* Hair */}
        <path d="M85 48 Q100 35 115 48 Q115 43 100 30 Q85 43 85 48" fill="#4a4a4a" />
        
        {/* Eyes */}
        <circle cx="92" cy="58" r="2" fill="#333" />
        <circle cx="108" cy="58" r="2" fill="#333" />
        
        {/* Smile */}
        <path d="M95 65 Q100 70 105 65" stroke="#333" strokeWidth="1.5" fill="none" />
        
        {/* Body */}
        <ellipse cx="100" cy="110" rx="22" ry="35" fill="#3498db" />
        
        {/* Arms */}
        <ellipse cx="75" cy="105" rx="8" ry="20" fill="#deb887" transform="rotate(-10 75 105)" />
        <ellipse cx="125" cy="105" rx="8" ry="20" fill="#deb887" transform="rotate(10 125 105)" />
        
        {/* Legs */}
        <ellipse cx="90" cy="160" rx="8" ry="25" fill="#2c3e50" />
        <ellipse cx="110" cy="160" rx="8" ry="25" fill="#2c3e50" />
        
        {/* Feet */}
        <ellipse cx="85" cy="180" rx="8" ry="5" fill="#333" />
        <ellipse cx="115" cy="180" rx="8" ry="5" fill="#333" />
      </motion.g>
    </motion.svg>
  );
}