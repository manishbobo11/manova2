import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, Brain, Shield } from 'lucide-react';

const TherapistLandingSection = ({ className = "" }) => {
  const navigate = useNavigate();

  const handleConsultClick = () => {
    navigate('/therapist-booking');
  };

  return (
    <motion.div
      className={`rounded-2xl shadow-xl backdrop-blur-sm bg-white p-8 border border-gray-200 transition-all hover:shadow-2xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2 }}
    >
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Brain className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-slate-900 mb-3">
          Professional Therapy Support
        </h3>
        
        <p className="text-slate-600 leading-relaxed max-w-md mx-auto">
          Connect with licensed therapists who specialize in your specific needs. 
          Get personalized support from qualified mental health professionals.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-sm font-medium text-slate-700">Licensed</p>
          <p className="text-xs text-slate-500">Professionals</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Heart className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-sm font-medium text-slate-700">Specialized</p>
          <p className="text-xs text-slate-500">Care</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Search className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-sm font-medium text-slate-700">Smart</p>
          <p className="text-xs text-slate-500">Matching</p>
        </div>
      </div>

      {/* Main CTA Button */}
      <div className="text-center">
        <motion.button
          onClick={handleConsultClick}
          className="inline-flex items-center space-x-3 px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-2xl transition-all duration-300"
          style={{ 
            backgroundColor: '#007CFF',
            color: '#ffffff'
          }}
          whileHover={{ 
            scale: 1.02,
            backgroundColor: '#0066CC',
            boxShadow: "0 20px 40px -12px rgba(0, 124, 255, 0.35)"
          }}
          whileTap={{ scale: 0.98 }}
        >
          <Search className="w-6 h-6" style={{ color: '#ffffff' }} />
          <span style={{ color: '#ffffff' }}>🔍 Consult a Therapist</span>
        </motion.button>
        
        <p className="text-xs text-slate-500 mt-3">
          Find your perfect match in under 2 minutes
        </p>
      </div>

      {/* Trust Indicators */}
      <div className="flex justify-center items-center space-x-6 mt-6 pt-6 border-t border-slate-200">
        <div className="text-center">
          <p className="text-lg font-bold text-blue-600">500+</p>
          <p className="text-xs text-slate-500">Licensed Therapists</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-blue-600">4.9★</p>
          <p className="text-xs text-slate-500">Average Rating</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-blue-600">24/7</p>
          <p className="text-xs text-slate-500">Support Available</p>
        </div>
      </div>
    </motion.div>
  );
};

export default TherapistLandingSection;