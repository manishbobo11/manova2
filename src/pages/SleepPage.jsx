import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Play, Star, Volume2, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

// CSS variables for consistent theming
const cssVars = `
  :root {
    --primary-blue: #007CFF;
    --primary-blue-hover: #0066CC;
    --border-gray: #C5C5C5;
    --text-gray: #777;
    --border-light: #D8D8D8;
  }
`;

const SleepPage = () => {
  useEffect(() => {
    document.title = 'Manova | Sleep Stories';
    const style = document.createElement("style");
    style.textContent = cssVars;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const sleepStories = [
    {
      title: "Moonlit Forest Walk",
      duration: "15 min",
      description: "A gentle journey through a peaceful forest under starlight",
      icon: "🌲"
    },
    {
      title: "Ocean Waves Lullaby",
      duration: "20 min", 
      description: "Soothing sounds of waves gently washing the shore",
      icon: "🌊"
    },
    {
      title: "Mountain Meadow Dreams",
      duration: "18 min",
      description: "Drift off in a serene alpine meadow filled with wildflowers",
      icon: "🏔️"
    },
    {
      title: "Rainy Evening Comfort",
      duration: "25 min",
      description: "The gentle patter of rain creating the perfect sleep ambiance",
      icon: "🌧️"
    }
  ];

  return (
      <div className="w-full bg-white min-h-screen">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-20">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Link 
              to="/home"
              className="inline-flex items-center text-[#007CFF] hover:text-[#0066CC] font-medium mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            
            <h1 className="text-[48px] font-bold font-inter leading-normal text-balance mb-8">
              <span className="text-black">Sleep </span>
              <span className="text-[#007CFF]">Stories</span>
            </h1>
            <p className="text-[20px] font-normal font-inter text-black leading-[32px] w-full max-w-[704px] mx-auto text-balance">
              Drift off peacefully with our collection of soothing bedtime stories and calming soundscapes designed to help you unwind.
            </p>
          </motion.div>

          {/* Sleep Stories Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16"
          >
            {sleepStories.map((story, index) => (
              <motion.div
                key={story.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white border border-[#D8D8D8] rounded-3xl p-8 hover:shadow-xl transition-all duration-300 group"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="flex items-start space-x-6">
                  <div className="text-6xl">{story.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-[24px] font-bold font-inter text-black mb-3">{story.title}</h3>
                    <p className="text-[16px] font-normal font-inter text-[#777] mb-4 leading-relaxed">
                      {story.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-[14px] font-medium font-inter text-[#777]">
                        <Clock className="w-4 h-4 mr-2" />
                        {story.duration}
                      </div>
                      <motion.button
                        className="bg-[#007CFF] hover:bg-[#0066CC] text-white px-6 py-3 rounded-2xl font-bold font-inter transition-all duration-300 flex items-center space-x-2 group-hover:scale-105"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Play className="w-4 h-4" />
                        <span>Listen</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Coming Soon Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-8 text-center border border-[#D8D8D8]"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Moon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-[32px] font-bold font-inter text-black mb-4">More Stories Coming Soon</h2>
            <p className="text-[18px] font-normal font-inter text-[#777] mb-6 max-w-2xl mx-auto">
              We're working on expanding our collection with personalized sleep stories, guided sleep meditations, and custom soundscapes tailored to your preferences.
            </p>
            <div className="flex items-center justify-center space-x-4 text-[16px] font-medium font-inter text-[#777]">
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                Personalized Stories
              </div>
              <div className="flex items-center">
                <Volume2 className="w-4 h-4 mr-2 text-blue-500" />
                Custom Soundscapes
              </div>
            </div>
          </motion.div>
        </div>
      </div>
  );
};

export default SleepPage;