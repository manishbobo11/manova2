import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Heart, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { homeContent } from '../../content/home';

const InsightsStrip = () => {
  const navigate = useNavigate();

  const insights = [
    {
      id: 'daily-practice',
      title: 'Daily Practice',
      description: 'Consistent small steps lead to lasting change',
      icon: Sparkles,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'self-compassion',
      title: 'Self-Compassion',
      description: 'Be kind to yourself, you\'re doing your best',
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      id: 'mindful-awareness',
      title: 'Mindful Awareness',
      description: 'Notice your thoughts without judgment',
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      {/* Main CTA Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
            {homeContent.ctaStrip.title}
          </h2>
          <p className="text-slate-600 text-lg mb-8 max-w-2xl mx-auto">
            {homeContent.ctaStrip.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(homeContent.ctaStrip.primary.href)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2"
            >
              <span>{homeContent.ctaStrip.primary.label}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => navigate(homeContent.ctaStrip.secondary.href)}
              className="bg-white text-slate-700 hover:bg-slate-50 font-semibold py-3 px-8 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md border border-slate-200"
            >
              {homeContent.ctaStrip.secondary.label}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Wellness Insights */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold text-slate-900 text-center mb-6">
          Wellness Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              className={`${insight.bgColor} rounded-xl p-6 text-center`}
            >
              <div className={`w-12 h-12 rounded-lg ${insight.bgColor} ${insight.color} flex items-center justify-center mx-auto mb-4`}>
                <insight.icon className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">
                {insight.title}
              </h4>
              <p className="text-slate-600 text-sm">
                {insight.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Support Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-8 text-center"
      >
        <p className="text-slate-600 text-sm">
          Remember: You're not alone. Professional help is available if you need it.
        </p>
        <button
          onClick={() => navigate('/therapist-booking')}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm mt-2 underline"
        >
          Find a therapist
        </button>
      </motion.div>
    </motion.section>
  );
};

export default InsightsStrip;
