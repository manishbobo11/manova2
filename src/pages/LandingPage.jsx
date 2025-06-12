import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthModal from '../components/AuthModal';
import { Bot, AlertCircle } from 'lucide-react';

const features = [
  {
    icon: '/icons/adaptive.svg',
    title: 'Adaptive Check-ins',
    desc: 'Bi-weekly GPT-powered questions that evolve with employee behavior.'
  },
  {
    icon: '/icons/stress.svg',
    title: 'Stress Categorization',
    desc: 'Automatically classifies concern level as Normal, Moderate, or Extreme.'
  },
  {
    icon: '/icons/assistant.svg',
    title: 'Real-time Wellness Assistant',
    desc: 'Auto-triggers a GPT-based therapy companion for moderate stress cases.'
  },
  {
    icon: '/icons/therapist.svg',
    title: 'Therapist Escalation',
    desc: 'Connects employees to licensed therapists—virtually or in-person.'
  },
  {
    icon: '/icons/analytics.svg',
    title: 'HR Dashboard',
    desc: 'Anonymous trend analytics with behavioral insights and mood mapping.'
  }
];

const whyManova = [
  {
    icon: '/icons/privacy.svg',
    title: 'Respects Privacy',
    desc: 'All check-ins and analytics are anonymous and secure.'
  },
  {
    icon: '/icons/ai.svg',
    title: 'AI-driven Personalization',
    desc: "Every interaction adapts to the user's needs and mood."
  },
  {
    icon: '/icons/access.svg',
    title: 'Seamless Therapist Access',
    desc: 'Connect to licensed therapists instantly, online or in-person.'
  },
];

function MissionStatement() {
  return (
    <section className="max-w-2xl mx-auto text-center my-16 px-4">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-lg md:text-xl text-gray-600 leading-relaxed"
      >
        <span className="font-semibold text-blue-700">Manova</span> empowers organizations to support employee mental health with adaptive AI check-ins, real-time stress detection, and seamless escalation to human care. Our mission is to make mental wellness accessible, private, and actionable for everyone.
      </motion.p>
    </section>
  );
}

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col pt-0">
      {/* Hero Section with Background Image */}
      <div className="relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-orange-100 via-blue-50 to-pink-100 px-2 sm:px-6 lg:px-8 w-full pb-8 pt-0 sm:pt-4 md:pt-8" style={{ minHeight: '60vh' }}>
        {/* Animated Floating Bubbles */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-12 h-12 sm:w-16 sm:h-16 bg-orange-200 rounded-full opacity-60 animate-bubble-slow" />
          <div className="absolute top-1/2 left-1/3 w-8 h-8 sm:w-10 sm:h-10 bg-pink-200 rounded-full opacity-50 animate-bubble-medium" />
          <div className="absolute bottom-10 right-1/4 w-14 h-14 sm:w-20 sm:h-20 bg-blue-200 rounded-full opacity-40 animate-bubble-fast" />
        </div>
        {/* Hero Content Responsive Layout */}
        <div className="relative z-20 flex flex-col-reverse md:flex-row items-center justify-center w-full max-w-5xl mx-auto gap-6 md:gap-12">
          {/* Left: Text Content */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-4 md:mb-6"
            >
              <img
                src="/images/logo.svg"
                alt="Manova Logo"
                className="h-16 md:h-24 mx-auto md:mx-0 drop-shadow-xl"
              />
            </motion.div>
            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-base sm:text-lg md:text-xl font-semibold text-orange-500 mb-2 md:mb-3 tracking-tight"
            >
              Wellness that begins in the mind.
            </motion.p>
            {/* Subdescription */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-sm sm:text-base md:text-lg text-blue-900/80 mb-3 md:mb-5 max-w-md"
            >
              Manova is a wellness platform designed to take care for the most essential part of your workforce – the mind.
            </motion.p>
            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900 mb-4 md:mb-6 drop-shadow-lg leading-tight"
            >
              We're here to help you feel better
            </motion.h1>
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start w-full"
            >
              <Link
                to="/signup"
                className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-full font-bold hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-lg text-base sm:text-lg text-center"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 sm:px-8 sm:py-4 bg-white/30 backdrop-blur-sm text-blue-900 rounded-full font-bold hover:bg-white/50 hover:scale-105 transition-all duration-300 border border-white/20 text-base sm:text-lg text-center"
              >
                Sign In
              </Link>
            </motion.div>
          </div>
          {/* Right: Mascot */}
          <div className="flex-1 flex items-center justify-center mb-4 md:mb-0">
            <motion.img
              src="/images/mascot.svg"
              alt="Mascot"
              className="w-48 sm:w-64 md:w-80 lg:w-96 z-10 opacity-90"
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 4, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
              style={{ minWidth: '160px', maxWidth: '100%' }}
            />
          </div>
        </div>
        {/* Wavy Divider (animated) */}
        <div className="absolute bottom-0 left-0 w-full z-10 animate-wave">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-24">
            <path fill="#fff" d="M0,64L48,74.7C96,85,192,107,288,117.3C384,128,480,128,576,117.3C672,107,768,85,864,90.7C960,96,1056,128,1152,138.7C1248,149,1344,139,1392,133.3L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" />
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 sm:py-16 bg-white w-full">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
              Your Path to Wellness
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Discover a comprehensive approach to mental health with personalized tools and support
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1 + idx * 0.1 }}
                whileHover={{ scale: 1.04 }}
                className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 shadow-md flex flex-col items-center text-center"
              >
                <img src={feature.icon} alt={feature.title} className="w-10 h-10 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-gradient-to-b from-white to-blue-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of people who have found support and guidance through Manova
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-8 shadow-lg"
            >
              <div className="flex items-center mb-6">
                <img
                  src="/images/testimonial-1.svg"
                  alt="User"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Sarah M.</h4>
                  <p className="text-gray-600 text-sm">Member since 2023</p>
                </div>
              </div>
              <p className="text-gray-600">
                "Manova has been a game-changer for my mental health journey. The personalized insights and support have made all the difference."
              </p>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-8 shadow-lg"
            >
              <div className="flex items-center mb-6">
                <img
                  src="/images/testimonial-2.svg"
                  alt="User"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">James K.</h4>
                  <p className="text-gray-600 text-sm">Member since 2022</p>
                </div>
              </div>
              <p className="text-gray-600">
                "The community aspect of Manova is incredible. It's helped me feel less alone in my journey to better mental health."
              </p>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-8 shadow-lg"
            >
              <div className="flex items-center mb-6">
                <img
                  src="/images/testimonial-3.svg"
                  alt="User"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Emma R.</h4>
                  <p className="text-gray-600 text-sm">Member since 2023</p>
                </div>
              </div>
              <p className="text-gray-600">
                "The progress tracking features have helped me stay motivated and see how far I've come in my wellness journey."
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* USPs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-4 sm:p-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-10">Why Choose Manova?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* USP 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              whileHover={{ scale: 1.04 }}
              className="bg-white border border-gray-200 rounded-xl shadow-md p-8 flex flex-col items-start hover:shadow-lg transition-all duration-300"
            >
              <motion.img src="/icons/assessment.svg" alt="Smart Adaptive Check-ins" className="w-10 h-10 mb-4" whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }} />
              <h3 className="text-lg font-bold text-gray-800 mb-2">Smart Adaptive Check-ins</h3>
              <p className="text-gray-600">GPT-4o-powered bi-weekly wellness check-ins that evolve based on each employee's unique emotional patterns and history.</p>
            </motion.div>
            {/* USP 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              whileHover={{ scale: 1.04 }}
              className="bg-white border border-gray-200 rounded-xl shadow-md p-8 flex flex-col items-start hover:shadow-lg transition-all duration-300"
            >
              <motion.img src="/icons/stress.svg" alt="Automated Stress Detection" className="w-10 h-10 mb-4" whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }} />
              <h3 className="text-lg font-bold text-gray-800 mb-2">Automated Stress Detection</h3>
              <p className="text-gray-600">Intelligent classification of responses into Normal, Moderate, or Extreme stress categories — in real-time.</p>
            </motion.div>
            {/* USP 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              whileHover={{ scale: 1.04 }}
              className="bg-white border border-gray-200 rounded-xl shadow-md p-8 flex flex-col items-start hover:shadow-lg transition-all duration-300"
            >
              <motion.div className="w-10 h-10 mb-4 flex items-center justify-center bg-blue-50 rounded-full" whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Bot className="w-7 h-7 text-blue-600" />
              </motion.div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">AI Therapy Chatbot</h3>
              <p className="text-gray-600">A supportive, always-on virtual assistant that simulates therapy and auto-engages when moderate stress is detected.</p>
            </motion.div>
            {/* USP 4 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.4 }}
              whileHover={{ scale: 1.04 }}
              className="bg-white border border-gray-200 rounded-xl shadow-md p-8 flex flex-col items-start hover:shadow-lg transition-all duration-300"
            >
              <motion.div className="w-10 h-10 mb-4 flex items-center justify-center bg-red-50 rounded-full" whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
                <AlertCircle className="w-7 h-7 text-red-600" />
              </motion.div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Human Escalation When Needed</h3>
              <p className="text-gray-600">Seamless escalation to licensed therapists — online or in-person — when AI detects high stress or critical emotional signals.</p>
            </motion.div>
            {/* USP 5 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.5 }}
              whileHover={{ scale: 1.04 }}
              className="bg-white border border-gray-200 rounded-xl shadow-md p-8 flex flex-col items-start hover:shadow-lg transition-all duration-300 md:col-span-2 lg:col-span-1"
            >
              <motion.img src="/icons/analytics.svg" alt="Anonymized HR Insights" className="w-10 h-10 mb-4" whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }} />
              <h3 className="text-lg font-bold text-gray-800 mb-2">Anonymized HR Insights</h3>
              <p className="text-gray-600">A secure HR dashboard showing aggregated team well-being trends, behavioral shifts, and actionable analytics — without compromising employee privacy.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Start Your Journey Today
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of people who have found support and guidance through Manova
          </p>
          <Link
            to="/signup"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            Get Started for Free
          </Link>
        </div>
      </div>

      <AuthModal />
    </div>
  );
};

export default LandingPage; 