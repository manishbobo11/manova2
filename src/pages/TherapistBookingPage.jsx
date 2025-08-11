import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart,
  Shield,
  Brain,
  Sparkles
} from 'lucide-react';

const TherapistBookingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Back Button */}
      <motion.button
        onClick={() => navigate(-1)}
        className="absolute top-8 left-8 flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back</span>
      </motion.button>

      {/* Main Content */}
      <div className="text-center max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 relative overflow-hidden"
        >
          {/* Brain Icon with Animation */}
          <motion.div
            className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
          >
            <Brain className="w-12 h-12 text-white" />
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            🧠 Best therapists are on their way!
          </motion.h1>

          {/* Subtext */}
          <motion.p
            className="text-xl text-gray-600 leading-relaxed mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            We're building a trusted network of professionals to support your mental wellness journey.
          </motion.p>

          {/* Additional Info */}
          <motion.div
            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Licensed Professionals</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-pink-600" />
                <span>Compassionate Care</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Coming Soon</span>
              </div>
            </div>
          </motion.div>

          {/* Floating Elements Animation */}
          <motion.div
            className="absolute -top-4 -right-4 w-8 h-8 bg-blue-400 rounded-full opacity-20"
            animate={{
              y: [0, -10, 0],
              x: [0, 5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -bottom-4 -left-4 w-6 h-6 bg-purple-400 rounded-full opacity-20"
            animate={{
              y: [0, 10, 0],
              x: [0, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </motion.div>

        {/* Return Home Button */}
        <motion.button
          onClick={() => navigate('/dashboard')}
          className="mt-8 inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 font-medium transition-all shadow-lg hover:shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </motion.button>
      </div>
    </div>
  );
};

export default TherapistBookingPage;