import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Brain, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { homeContent } from '../../content/home';

const ToolsGrid = () => {
  const navigate = useNavigate();

  const iconMap = {
    Heart,
    Brain,
    Moon
  };

  const tools = homeContent.wellnessTools.map(tool => ({
    title: tool.title,
    description: tool.desc,
    icon: iconMap[tool.icon],
    action: () => navigate(tool.cta.href),
    buttonText: tool.cta.label,
  }));

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
          Your Wellness Tools
        </h2>
        <p className="text-slate-600 text-lg">
          Comprehensive tools to support your mental wellness journey
        </p>
      </div>

      <div className="mobile-grid">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.title}
            className="bg-white rounded-lg shadow-sm ring-1 ring-slate-200 p-6 transition-all duration-300 hover:shadow-md"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 * index }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-6 bg-blue-100 text-blue-700">
              <tool.icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">{tool.title}</h3>
            <p className="text-slate-600 mb-8 leading-relaxed">
              {tool.description}
            </p>
            <motion.button
              onClick={tool.action}
              className="wellness-tool-button w-full bg-blue-600 hover:bg-blue-700 font-semibold py-3 px-6 rounded-lg text-sm shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
              style={{ 
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: '600'
              }}
              whileHover={{ 
                scale: 1.02,
                backgroundColor: '#1d4ed8'
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span style={{ color: '#ffffff' }}>{tool.buttonText}</span>
            </motion.button>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default ToolsGrid;
