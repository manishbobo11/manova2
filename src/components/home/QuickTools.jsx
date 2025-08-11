import React from 'react';
import { motion } from 'framer-motion';
import { 
  Wind, 
  Heart, 
  Brain, 
  BookOpen, 
  Leaf
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { homeContent } from '../../content/home';

const QuickTools = () => {
  const navigate = useNavigate();

  const iconMap = {
    Wind,
    Heart,
    Brain,
    BookOpen,
    Leaf
  };

  const quickTools = homeContent.quickTools.map(tool => ({
    id: tool.key,
    title: tool.title,
    description: tool.desc,
    icon: iconMap[tool.icon],
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    action: () => navigate(tool.href)
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
          Quick Wellness Tools
        </h2>
        <p className="text-slate-600 text-lg">
          Instant support for your mental wellness
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {quickTools.map((tool, index) => (
          <motion.button
            key={tool.id}
            onClick={tool.action}
            className={`h-32 p-4 rounded-xl transition-all duration-200 ${tool.bgColor} hover:shadow-md hover:scale-[1.02] group flex flex-col items-center justify-center`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-lg ${tool.bgColor} ${tool.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <tool.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm mb-1">
                {tool.title}
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                {tool.description}
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Additional CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-8 text-center"
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
        >
          View All Tools
        </button>
      </motion.div>
    </motion.section>
  );
};

export default QuickTools;
