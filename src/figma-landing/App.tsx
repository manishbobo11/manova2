import image_616efd6ea4d8a30941c9778a6ef2df2647b70871 from "figma:asset/616efd6ea4d8a30941c9778a6ef2df2647b70871.png";
import React, { useState } from "react";
import {
  Play,
  Brain,
  ChevronDown,
  MessageCircle,
  Activity,
  Target,
  TrendingUp,
  Shield,
  Users,
  Mail,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Send,
  Smartphone,
  Menu,
  X,
  Apple,
  Headphones,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import manovaLogo from "figma:asset/616efd6ea4d8a30941c9778a6ef2df2647b70871.png";
import { AnimatedCharacter } from "./components/AnimatedCharacter";

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const navigationLinks = [
    { name: "Home", href: "#", active: true },
    { name: "About", href: "#" },
    { name: "How it Works", href: "#" },
    { name: "Resources", href: "#" },
    { name: "Community", href: "#" },
    { name: "Support", href: "#" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f8ff] to-white relative overflow-hidden font-sans text-[1.05rem]">
      {/* Global Container with Zoomed Experience */}
      <div className="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-20">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <div className="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-20">
            <div className="flex justify-between items-center py-6 lg:py-8">
            {/* Left - Logo & Brand */}
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="h-20 w-20 lg:h-24 lg:w-24">
                  <img
                    src={manovaLogo}
                    alt="Manova Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="font-normal text-2xl lg:text-3xl text-gray-900 tracking-tight font-[ADLaM_Display]">
                  Manova
                </div>
              </motion.div>
            </motion.div>

            {/* Center - Navigation Links (Desktop) */}
            <motion.div
              className="hidden lg:flex items-center gap-12"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {navigationLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  className={`relative px-4 py-3 rounded-lg text-lg lg:text-xl font-medium transition-all duration-300 ${
                    link.active
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50/50"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.1 * index,
                  }}
                >
                  {link.name}
                  {link.active && (
                    <motion.div
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"
                      layoutId="activeTab"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.a>
              ))}
            </motion.div>

            {/* Right - CTA Buttons (Desktop) */}
            <motion.div
              className="hidden lg:flex items-center space-x-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.a
                href="#"
                className="text-lg lg:text-xl font-medium text-gray-700 hover:text-blue-600 px-6 py-3 rounded-lg transition-all duration-300 hover:bg-blue-50/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Log In
              </motion.a>
              <motion.button
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-lg lg:text-xl font-medium px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(59, 130, 246, 0.25)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started
              </motion.button>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-300"
              onClick={toggleMobileMenu}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="lg:hidden bg-white/98 backdrop-blur-md border-t border-gray-100 shadow-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-6 sm:px-10 lg:px-20 py-8 space-y-4">
                {/* Mobile Navigation Links */}
                <div className="space-y-2">
                  {navigationLinks.map((link, index) => (
                    <motion.a
                      key={link.name}
                      href={link.href}
                      className={`block px-4 py-4 rounded-xl text-lg lg:text-xl font-medium transition-all duration-300 ${
                        link.active
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-700 hover:text-blue-600 hover:bg-blue-50/50"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.1 * index,
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {link.name}
                    </motion.a>
                  ))}
                </div>

                {/* Mobile CTA Buttons */}
                <motion.div
                  className="flex flex-col space-y-3 pt-4 border-t border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <motion.a
                    href="#"
                    className="text-center text-lg lg:text-xl font-medium text-gray-700 hover:text-blue-600 px-4 py-4 rounded-xl transition-all duration-300 hover:bg-blue-50/50"
                    onClick={() => setIsMobileMenuOpen(false)}
                    whileTap={{ scale: 0.98 }}
                  >
                    Log In
                  </motion.a>
                  <motion.button
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-lg lg:text-xl font-medium px-6 py-4 rounded-xl shadow-lg transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                    whileTap={{ scale: 0.98 }}
                  >
                    Get Started
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

        {/* Hero Section */}
        <section className="relative z-10 w-full py-8 lg:py-12 pt-16 lg:pt-20 min-h-screen flex items-center">
          <div className="w-full">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
              {/* Left Column - Content */}
              <motion.div
                className="flex-1 space-y-4 lg:space-y-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <div className="space-y-3 lg:space-y-4">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight text-gray-900">
                    Your AI-Powered Mental Health
                    <br />
                    <span className="relative">
                      Companion
                      <div className="absolute -bottom-2 left-0 w-full h-3 bg-orange-200 -z-10 rounded"></div>
                    </span>
                  </h1>

                  <p className="text-base lg:text-lg text-gray-600 mt-2 leading-relaxed max-w-2xl">
                    Discover the Power of AI to Transform Your
                    Mental Health Journey
                  </p>
                </div>

                {/* Why Choose Section */}
                <motion.div
                  className="bg-white rounded-2xl shadow-md border border-gray-100 p-3 lg:p-5 xl:p-6 max-w-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1 }}
                >
                  <h2 className="text-lg lg:text-xl xl:text-2xl text-gray-900 mb-3 lg:mb-4">
                    Why Choose Manova?
                  </h2>

                  <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
                    <motion.button
                      className="bg-purple-200 hover:bg-purple-300 text-gray-800 px-6 lg:px-8 py-3 lg:py-4 rounded-xl transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Find out more
                    </motion.button>

                    <motion.button
                      className="flex items-center space-x-3 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 lg:px-8 py-3 lg:py-4 rounded-xl transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <Play className="w-4 h-4 text-gray-600 ml-0.5" />
                      </div>
                      <span>Demo</span>
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Column - Logo Display */}
              <motion.div
                className="flex items-center justify-center max-w-[350px] sm:max-w-[400px] w-full"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <div className="relative w-full h-64 sm:h-80 lg:h-96">
                  {/* Main container with proper spacing */}
                  <div className="relative w-full h-full flex items-center justify-center p-8">
                    {/* Background gradient circle - Behind everything */}
                    <div className="absolute inset-8 bg-gradient-to-br from-blue-100 via-purple-50 to-blue-50 rounded-full opacity-60 z-0" />

                    {/* Main Manova Logo - Foreground */}
                    <div className="relative z-20 w-48 h-48 flex items-center justify-center">
                      <img
                        src={manovaLogo}
                        alt="Manova - AI Mental Health Companion"
                        className="w-full h-auto object-contain drop-shadow-2xl"
                      />
                    </div>

                    {/* Floating decorative dots - Behind logo but above background */}
                    <div className="absolute top-16 left-12 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full shadow-lg opacity-70 z-10" />
                    <div className="absolute top-24 right-14 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full shadow-lg opacity-60 z-10" />
                    <div className="absolute bottom-24 left-16 w-4 h-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full shadow-lg opacity-80 z-10" />
                    <div className="absolute bottom-20 right-12 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg opacity-70 z-10" />
                  </div>

                  {/* Feature callouts with proper spacing and z-index */}
                  <motion.div
                    className="absolute top-4 right-8 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-2 text-center border border-blue-200/50 z-30 min-w-24"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                  >
                    <div className="text-sm text-blue-600 font-medium whitespace-nowrap">
                      AI-Powered
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute bottom-4 left-8 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-2 text-center border border-purple-200/50 z-30 min-w-24"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                  >
                    <div className="text-sm text-purple-600 font-medium whitespace-nowrap">
                      24/7 Support
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-3 py-2 text-center border border-green-200/50 z-30 min-w-20"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 1.6 }}
                  >
                    <div className="text-sm text-green-600 font-medium">
                      Secure
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div className="relative z-10 w-full py-4">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        </div>

        {/* Community Section */}
        <section className="relative z-10 w-full py-8 lg:py-12 space-y-8 lg:space-y-12">
          <motion.div
            className="w-full bg-white rounded-2xl shadow-md border border-gray-100 p-6 lg:p-8 xl:p-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6 xl:gap-8">
              {/* Left side - Chat illustration */}
              <motion.div
                className="flex justify-center flex-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1.8 }}
              >
                <div className="relative">
                  {/* Chat Illustration */}
                  <motion.svg
                    className="w-64 h-64"
                    viewBox="0 0 300 300"
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {/* Main chat bubble */}
                    <motion.path
                      d="M60 120 Q60 100 80 100 L200 100 Q220 100 220 120 L220 160 Q220 180 200 180 L90 180 L70 200 L70 180 Q60 180 60 160 Z"
                      fill="#e3f2fd"
                      stroke="#bbdefb"
                      strokeWidth="2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.6, delay: 2 }}
                    />

                    {/* Chat dots */}
                    <motion.g
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <circle
                        cx="100"
                        cy="140"
                        r="4"
                        fill="#64b5f6"
                      />
                      <circle
                        cx="120"
                        cy="140"
                        r="4"
                        fill="#64b5f6"
                      />
                      <circle
                        cx="140"
                        cy="140"
                        r="4"
                        fill="#64b5f6"
                      />
                    </motion.g>

                    {/* Secondary chat bubble */}
                    <motion.path
                      d="M80 200 Q80 180 100 180 L180 180 Q200 180 200 200 L200 230 Q200 250 180 250 L110 250 L90 270 L90 250 Q80 250 80 230 Z"
                      fill="#f3e5f5"
                      stroke="#e1bee7"
                      strokeWidth="2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.6, delay: 2.2 }}
                    />

                    {/* Heart in second bubble */}
                    <motion.path
                      d="M135 215 Q130 210 125 215 Q120 220 125 225 L135 235 L145 225 Q150 220 145 215 Q140 210 135 215"
                      fill="#ab47bc"
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ duration: 0.8, delay: 2.4 }}
                    />

                    {/* Community members */}
                    <motion.g
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 2.6 }}
                    >
                      <circle
                        cx="250"
                        cy="80"
                        r="12"
                        fill="#ffcc80"
                      />
                      <ellipse
                        cx="250"
                        cy="105"
                        rx="8"
                        ry="15"
                        fill="#4fc3f7"
                      />
                      <circle
                        cx="220"
                        cy="60"
                        r="10"
                        fill="#f8bbd9"
                      />
                      <ellipse
                        cx="220"
                        cy="80"
                        rx="7"
                        ry="12"
                        fill="#81c784"
                      />
                      <circle
                        cx="270"
                        cy="65"
                        r="11"
                        fill="#d7ccc8"
                      />
                      <ellipse
                        cx="270"
                        cy="88"
                        rx="7"
                        ry="13"
                        fill="#ff8a65"
                      />
                    </motion.g>

                    {/* Floating connection lines */}
                    <motion.g
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <path
                        d="M210 70 Q230 85 240 95"
                        stroke="#b39ddb"
                        strokeWidth="1.5"
                        fill="none"
                        strokeDasharray="3,3"
                      />
                      <path
                        d="M260 75 Q250 90 245 100"
                        stroke="#90caf9"
                        strokeWidth="1.5"
                        fill="none"
                        strokeDasharray="3,3"
                      />
                    </motion.g>
                  </motion.svg>

                  {/* Floating community icons */}
                  <motion.div
                    className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
                    animate={{ y: [0, -6, 0], rotate: [0, 10, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: 0.5,
                    }}
                  >
                    <Users className="w-4 h-4 text-white" />
                  </motion.div>

                  <motion.div
                    className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                    animate={{ y: [0, -4, 0], scale: [1, 1.1, 1] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: 1,
                    }}
                  >
                    <MessageCircle className="w-3 h-3 text-white" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Right side - Content */}
              <motion.div
                className="flex-1 space-y-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 2 }}
              >
                <div className="space-y-2 lg:space-y-3">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl text-gray-900">
                    Join Our
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {" "}
                      Supportive Community
                    </span>
                  </h3>

                  <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
                    Connect with others on similar wellness
                    journeys. Share experiences, find encouragement,
                    and grow together in a safe, moderated
                    environment designed for mental health support.
                  </p>
                </div>

                {/* Community features */}
                <div className="space-y-2">
                  {[
                    "Anonymous support groups",
                    "Peer mentorship programs",
                    "Guided wellness discussions",
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.6,
                        delay: 2.2 + index * 0.1,
                      }}
                    >
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                      <span className="text-gray-700">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.button
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg flex items-center space-x-3 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 2.5 }}
                >
                  <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Explore Community</span>
                </motion.button>

                <p className="text-sm text-gray-500">
                  Free to join • 24/7 moderated • Privacy-first
                </p>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Section Divider */}
        <div className="relative z-10 w-full py-4">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        </div>

        {/* Features Section */}
        <section className="relative z-10 w-full py-8 lg:py-12 space-y-8 lg:space-y-12">
          <div className="w-full">
            <div className="max-w-screen-xl mx-auto">
              {/* Header */}
              <motion.div
                className="text-center mb-6 lg:mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <motion.h2
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-900 mb-3 lg:mb-4 leading-tight font-medium tracking-tight"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  Powered by AI, Driven by Compassion
                </motion.h2>
                <motion.p
                  className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed font-normal"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Experience personalized mental wellness support
                  that understands your unique journey and adapts
                  to your individual needs
                </motion.p>
              </motion.div>

              {/* Feature Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 xl:gap-8">
                {[
                  {
                    title: "AI-Powered Insights",
                    description:
                      "Advanced algorithms analyze your patterns and provide personalized recommendations for your mental wellness journey, adapting to your unique needs.",
                    gradient: "from-purple-500 via-purple-600 to-blue-600",
                    icon: Brain,
                    delay: 0.1,
                  },
                  {
                    title: "24/7 Support",
                    description:
                      "Always available compassionate AI companion that listens, understands, and provides guidance whenever you need it most.",
                    gradient: "from-teal-500 via-teal-600 to-cyan-500",
                    icon: Headphones,
                    delay: 0.2,
                  },
                  {
                    title: "Privacy First",
                    description:
                      "Your mental health data is encrypted and secure. We believe privacy is essential for authentic expression and trust.",
                    gradient: "from-pink-500 via-pink-600 to-red-500",
                    icon: Shield,
                    delay: 0.3,
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="group"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.8,
                      delay: feature.delay,
                    }}
                    viewport={{ once: true }}
                  >
                    <motion.div
                      className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 lg:p-6 xl:p-7 h-full flex flex-col transition-all duration-300 group-hover:-translate-y-2"
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Icon Container */}
                      <motion.div
                        className={`w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 lg:mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <feature.icon
                          className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-white"
                          strokeWidth={1.5}
                        />
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col">
                        <h3 className="text-sm lg:text-base xl:text-lg text-gray-900 mb-2 lg:mb-3 font-semibold leading-tight group-hover:text-gray-800 transition-colors duration-300">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed font-normal flex-1 group-hover:text-gray-700 transition-colors duration-300 text-xs lg:text-sm">
                          {feature.description}
                        </p>
                      </div>

                      {/* Subtle bottom accent */}
                      <div
                        className={`w-full h-1 bg-gradient-to-r ${feature.gradient} rounded-full mt-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300`}
                      />
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div className="relative z-10 w-full py-8">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 bg-gray-900 text-white w-full rounded-2xl shadow-md border border-gray-100 mt-8 lg:mt-12">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            {/* Main Footer Content */}
            <div className="grid lg:grid-cols-12 gap-4 lg:gap-6 xl:gap-8 mb-6 lg:mb-8">
              {/* Left Column - Logo and Links (7 columns) */}
              <motion.div
                className="lg:col-span-7 space-y-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                {/* Logo */}
                <div className="flex items-center space-x-3">
                  <div className="h-8 lg:h-10 xl:h-12 w-auto">
                    <img
                      src={image_616efd6ea4d8a30941c9778a6ef2df2647b70871}
                      alt="Manova Logo"
                      className="h-8 lg:h-10 xl:h-12 w-auto object-contain filter brightness-0 invert"
                    />
                  </div>
                  <div className="text-base lg:text-lg xl:text-xl font-semibold text-white tracking-tight">
                    Manova
                  </div>
                </div>

                <p className="text-xs lg:text-sm text-gray-300 leading-relaxed max-w-2xl">
                  Empowering mental wellness through AI-driven
                  insights and compassionate support. Your journey
                  to better mental health starts here.
                </p>

                {/* Navigation Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                  <div className="space-y-2 lg:space-y-3">
                    <h4 className="text-sm lg:text-base font-medium text-white">Product</h4>
                    <ul className="space-y-1 lg:space-y-2">
                      {[
                        { name: "Features", href: "#" },
                        { name: "AI Companion", href: "#" },
                        { name: "Community", href: "#" },
                        { name: "Analytics", href: "#" },
                      ].map((link, index) => (
                        <motion.li
                          key={index}
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <a
                            href={link.href}
                            className="text-xs lg:text-sm text-gray-400 hover:text-white transition-colors"
                          >
                            {link.name}
                          </a>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 lg:space-y-3">
                    <h4 className="text-sm lg:text-base font-medium text-white">Support</h4>
                    <ul className="space-y-1 lg:space-y-2">
                      {[
                        { name: "Help Center", href: "#" },
                        { name: "Privacy Policy", href: "#" },
                        { name: "Terms of Service", href: "#" },
                        { name: "Contact Us", href: "#" },
                      ].map((link, index) => (
                        <motion.li
                          key={index}
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <a
                            href={link.href}
                            className="text-xs lg:text-sm text-gray-400 hover:text-white transition-colors"
                          >
                            {link.name}
                          </a>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 lg:space-y-3">
                    <h4 className="text-sm lg:text-base font-medium text-white">Company</h4>
                    <ul className="space-y-1 lg:space-y-2">
                      {[
                        { name: "About Us", href: "#" },
                        { name: "Careers", href: "#" },
                        { name: "Press", href: "#" },
                        { name: "Blog", href: "#" },
                      ].map((link, index) => (
                        <motion.li
                          key={index}
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <a
                            href={link.href}
                            className="text-xs lg:text-sm text-gray-400 hover:text-white transition-colors"
                          >
                            {link.name}
                          </a>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 lg:space-y-3">
                    <h4 className="text-sm lg:text-base font-medium text-white">Legal</h4>
                    <ul className="space-y-1 lg:space-y-2">
                      {[
                        { name: "Privacy", href: "#" },
                        { name: "Terms", href: "#" },
                        { name: "Accessibility", href: "#" },
                        { name: "Cookies", href: "#" },
                      ].map((link, index) => (
                        <motion.li
                          key={index}
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <a
                            href={link.href}
                            className="text-xs lg:text-sm text-gray-400 hover:text-white transition-colors"
                          >
                            {link.name}
                          </a>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Right Column - Social and Newsletter (5 columns) */}
              <motion.div
                className="lg:col-span-5 space-y-4 lg:space-y-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                {/* Newsletter Signup */}
                <div className="space-y-3 lg:space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-base lg:text-lg font-medium text-white">
                      Stay Updated
                    </h4>
                    <p className="text-xs lg:text-sm text-gray-400">
                      Get the latest mental wellness tips and
                      product updates delivered to your inbox.
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <div className="flex-1 relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    <motion.button
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>

                  <p className="text-xs text-gray-500">
                    By subscribing, you agree to our Privacy
                    Policy and consent to receive updates from our
                    company.
                  </p>
                </div>

                {/* Social Media Links */}
                <div className="space-y-2 lg:space-y-3">
                  <h4 className="text-sm lg:text-base font-medium text-white">
                    Connect With Us
                  </h4>
                  <div className="flex space-x-4">
                    {[
                      {
                        icon: Twitter,
                        href: "#",
                        label: "Twitter",
                      },
                      {
                        icon: Facebook,
                        href: "#",
                        label: "Facebook",
                      },
                      {
                        icon: Instagram,
                        href: "#",
                        label: "Instagram",
                      },
                      {
                        icon: Linkedin,
                        href: "#",
                        label: "LinkedIn",
                      },
                    ].map((social, index) => (
                      <motion.a
                        key={index}
                        href={social.href}
                        aria-label={social.label}
                        className="w-12 h-12 bg-gray-800 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 rounded-xl flex items-center justify-center transition-all duration-300"
                        whileHover={{
                          scale: 1.1,
                          rotate: 5,
                          boxShadow:
                            "0 10px 25px rgba(59, 130, 246, 0.3)",
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <social.icon className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                      </motion.a>
                    ))}
                  </div>

                  <div className="pt-2 lg:pt-3">
                    <p className="text-gray-400 text-xs">
                      Join our growing community of mental health
                      advocates and professionals.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer Bottom */}
            <motion.div
              className="border-t border-gray-700 pt-4 lg:pt-6 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="text-gray-400 text-xs">
                © 2024 Manova. All rights reserved. Dedicated to
                mental wellness and AI innovation.
              </div>

              <div className="flex items-center space-x-3 lg:space-x-4 text-xs text-gray-400">
                <a href="#" className="hover:text-white transition-colors">
                  Privacy
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Terms
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Accessibility
                </a>
              </div>
            </motion.div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>

          {/* Floating background elements */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
        </footer>
      </div>
    </div>
  );
}