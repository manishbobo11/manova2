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
  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const toggleMobileMenu = () =>
    setIsMobileMenuOpen(!isMobileMenuOpen);

  const navigationLinks = [
    { name: "Home", href: "#", active: true },
    { name: "About", href: "#" },
    { name: "How it Works", href: "#" },
    { name: "Resources", href: "#" },
    { name: "Community", href: "#" },
    { name: "Support", href: "#" },
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="w-full px-[5%] lg:px-[8%]">
          <div className="flex items-center justify-between h-20">
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
                <div className="h-16 w-16">
                  <img
                    src={manovaLogo}
                    alt="Manova Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="font-normal text-xl text-gray-900 tracking-tight font-[ADLaM_Display]">
                  Manova
                </div>
              </motion.div>
            </motion.div>

            {/* Center - Navigation Links (Desktop) */}
            <motion.div
              className="hidden lg:flex items-center space-x-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {navigationLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
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
              className="hidden lg:flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.a
                href="#"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-blue-50/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Log In
              </motion.a>
              <motion.button
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{
                  scale: 1.05,
                  boxShadow:
                    "0 10px 25px rgba(59, 130, 246, 0.25)",
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
              <div className="px-[5%] py-6 space-y-4">
                {/* Mobile Navigation Links */}
                <div className="space-y-2">
                  {navigationLinks.map((link, index) => (
                    <motion.a
                      key={link.name}
                      href={link.href}
                      className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
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
                    className="text-center text-base font-medium text-gray-700 hover:text-blue-600 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-blue-50/50"
                    onClick={() => setIsMobileMenuOpen(false)}
                    whileTap={{ scale: 0.98 }}
                  >
                    Log In
                  </motion.a>
                  <motion.button
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-base font-medium px-6 py-4 rounded-xl shadow-lg transition-all duration-300"
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
      <section className="relative z-10 w-full px-[5%] lg:px-[8%] py-20 pt-36 min-h-screen flex items-center">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column - Content (7 columns) */}
            <motion.div
              className="lg:col-span-7 space-y-8 pr-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl xl:text-6xl leading-tight text-gray-900">
                  Your AI-Powered Mental Health
                  <br />
                  <span className="relative">
                    Companion
                    <div className="absolute -bottom-2 left-0 w-full h-3 bg-orange-200 -z-10 rounded"></div>
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl">
                  Discover the Power of AI to Transform Your
                  Mental Health Journey
                </p>
              </div>

              {/* Why Choose Section */}
              <motion.div
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-lg max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                <h2 className="text-xl lg:text-2xl text-gray-900 mb-6">
                  Why Choose Manova?
                </h2>

                <div className="flex flex-col sm:flex-row gap-4">
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

            {/* Right Column - Logo Display (5 columns) */}
            <motion.div
              className="lg:col-span-5 flex items-center justify-center pl-8"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="relative w-full max-w-md h-80 lg:h-96">
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

      {/* Community Section */}
      <section className="relative z-10 w-full px-[5%] lg:px-[8%] py-16">
        <motion.div
          className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-blue-50/50 rounded-3xl border border-blue-100/50 backdrop-blur-sm p-8 lg:p-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          whileHover={{ scale: 1.01 }}
        >
          {/* Left side - Chat illustration (5 columns) */}
          <motion.div
            className="lg:col-span-5 flex justify-center"
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

          {/* Right side - Content (7 columns) */}
          <motion.div
            className="lg:col-span-7 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 2 }}
          >
            <div className="space-y-4">
              <h3 className="text-2xl lg:text-3xl text-gray-900">
                Join Our
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}
                  Supportive Community
                </span>
              </h3>

              <p className="text-lg text-gray-600 leading-relaxed">
                Connect with others on similar wellness
                journeys. Share experiences, find encouragement,
                and grow together in a safe, moderated
                environment designed for mental health support.
              </p>
            </div>

            {/* Community features */}
            <div className="space-y-3">
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
                  <span className="text-gray-700">
                    {feature}
                  </span>
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
        </motion.div>
      </section>

      {/* Features Section - Professional & Responsive */}
      <section className="relative z-10 w-full bg-gradient-to-br from-gray-25 via-blue-25/30 to-purple-25/20 py-16">
        <div className="w-full px-[5%] lg:px-[8%]">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.h2
                className="text-2xl md:text-3xl lg:text-4xl text-gray-900 mb-4 leading-tight font-medium tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                viewport={{ once: true }}
              >
                Powered by AI, Driven by Compassion
              </motion.h2>
              <motion.p
                className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed font-normal"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  title: "AI-Powered Insights",
                  description:
                    "Advanced algorithms analyze your patterns and provide personalized recommendations for your mental wellness journey, adapting to your unique needs.",
                  gradient:
                    "from-purple-500 via-purple-600 to-blue-600",
                  icon: Brain,
                  delay: 0.1,
                },
                {
                  title: "24/7 Support",
                  description:
                    "Always available compassionate AI companion that listens, understands, and provides guidance whenever you need it most.",
                  gradient:
                    "from-teal-500 via-teal-600 to-cyan-500",
                  icon: Headphones,
                  delay: 0.2,
                },
                {
                  title: "Privacy First",
                  description:
                    "Your mental health data is encrypted and secure. We believe privacy is essential for authentic expression and trust.",
                  gradient:
                    "from-pink-500 via-pink-600 to-red-500",
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
                    className="bg-white rounded-xl p-6 lg:p-7 shadow-lg hover:shadow-xl border border-gray-100/80 backdrop-blur-sm h-full flex flex-col transition-all duration-300 group-hover:-translate-y-2"
                    whileHover={{
                      scale: 1.02,
                      boxShadow:
                        "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Icon Container */}
                    <motion.div
                      className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <feature.icon
                        className="w-7 h-7 text-white"
                        strokeWidth={1.5}
                      />
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-lg lg:text-xl text-gray-900 mb-3 font-semibold leading-tight group-hover:text-gray-800 transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed font-normal flex-1 group-hover:text-gray-700 transition-colors duration-300 text-sm lg:text-base">
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

        {/* Subtle background decorations */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-100/40 to-purple-100/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-purple-100/30 to-pink-100/30 rounded-full blur-3xl"></div>
      </section>

      {/* AI Flow Stepper Section */}
      <section className="relative z-10 w-full py-24 bg-gradient-to-br from-violet-50 via-blue-50 to-purple-50">
        <div className="w-full px-[5%] lg:px-[8%]">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl text-gray-900 mb-4">
              Your AI-Powered Wellness Journey
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto">
              Discover how Manova's intelligent system guides
              you through a personalized mental health
              experience
            </p>
          </motion.div>

          {/* Horizontal Stepper */}
          <div className="relative w-full">
            {/* Connection Line */}
            <div className="absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-200 via-blue-200 to-purple-200 hidden lg:block">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-400 via-blue-400 to-purple-400 rounded-full"
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 2, delay: 0.5 }}
                viewport={{ once: true }}
              />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4">
              {[
                {
                  step: 1,
                  icon: MessageCircle,
                  title: "Welcome & Assessment",
                  description:
                    "Share your mental health goals and current state through our intelligent intake process.",
                  gradient: "from-violet-100 to-violet-200",
                  iconColor: "text-violet-600",
                  delay: 0.2,
                },
                {
                  step: 2,
                  icon: Brain,
                  title: "AI Analysis",
                  description:
                    "Our advanced AI analyzes your responses to create a personalized wellness profile.",
                  gradient: "from-blue-100 to-blue-200",
                  iconColor: "text-blue-600",
                  delay: 0.4,
                },
                {
                  step: 3,
                  icon: Activity,
                  title: "Daily Check-ins",
                  description:
                    "Engage with gentle daily prompts that track your mood, energy, and overall well-being.",
                  gradient: "from-purple-100 to-purple-200",
                  iconColor: "text-purple-600",
                  delay: 0.6,
                },
                {
                  step: 4,
                  icon: Target,
                  title: "Personalized Recommendations",
                  description:
                    "Receive tailored coping strategies, mindfulness exercises, and wellness activities.",
                  gradient: "from-indigo-100 to-indigo-200",
                  iconColor: "text-indigo-600",
                  delay: 0.8,
                },
                {
                  step: 5,
                  icon: TrendingUp,
                  title: "Progress Insights",
                  description:
                    "Track your mental health journey with detailed analytics and celebrate your growth.",
                  gradient: "from-violet-100 to-blue-200",
                  iconColor: "text-violet-600",
                  delay: 1.0,
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  className="relative flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: step.delay,
                  }}
                  viewport={{ once: true }}
                >
                  {/* Step Circle */}
                  <motion.div
                    className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${step.gradient} border-4 border-white shadow-lg flex items-center justify-center mb-6 z-10`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Step Number */}
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-violet-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-lg">
                      {step.step}
                    </div>

                    {/* Icon */}
                    <motion.div
                      className={`${step.iconColor} w-12 h-12`}
                      animate={{
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: step.delay,
                      }}
                    >
                      <step.icon className="w-full h-full" />
                    </motion.div>
                  </motion.div>

                  {/* Content */}
                  <div className="space-y-4 max-w-xs">
                    <h3 className="text-lg text-gray-900 font-medium">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute -top-2 -left-2 w-3 h-3 bg-gradient-to-r from-violet-300 to-blue-300 rounded-full opacity-60"></div>
                  <div className="absolute -bottom-2 -right-2 w-2 h-2 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full opacity-40"></div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-600 mb-6">
              Ready to experience personalized AI mental health
              support?
            </p>
            <motion.button
              className="bg-gradient-to-r from-violet-500 via-blue-500 to-purple-500 text-white px-8 py-4 rounded-2xl hover:from-violet-600 hover:via-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg"
              whileHover={{
                scale: 1.05,
                boxShadow:
                  "0 20px 40px rgba(139, 92, 246, 0.2)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Begin Your Journey
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Coming Soon Banner */}
      <section className="relative z-10 w-full py-12 bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-50">
        <div className="w-full px-[5%] lg:px-[8%]">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex justify-center mb-4">
                <motion.div
                  className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg"
                  animate={{
                    y: [0, -6, 0],
                    rotate: [0, 2, -2, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Smartphone className="w-8 h-8 text-white" />
                </motion.div>
              </div>

              <h2 className="text-2xl md:text-3xl lg:text-4xl text-gray-900 mb-3">
                Coming Soon to
                <span className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  App Stores
                </span>
              </h2>

              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Be the first to experience Manova on your mobile
                device. Get notified when we launch.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left Column - App Store Badges */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl text-gray-900 mb-4 text-center lg:text-left">
                  Download on
                </h3>

                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 justify-center lg:justify-start">
                  {/* App Store Badge */}
                  <motion.div
                    className="group cursor-pointer"
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="bg-black rounded-xl p-3 shadow-lg group-hover:shadow-xl transition-all duration-300 min-w-[160px]">
                      <div className="flex items-center space-x-3">
                        {/* Apple Logo */}
                        <div className="flex-shrink-0">
                          <svg
                            className="w-8 h-8"
                            viewBox="0 0 24 24"
                            fill="white"
                          >
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                          </svg>
                        </div>
                        <div className="text-white">
                          <div className="text-xs opacity-80">
                            Download on the
                          </div>
                          <div className="text-base font-semibold">
                            App Store
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Google Play Badge */}
                  <motion.div
                    className="group cursor-pointer"
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="bg-black rounded-xl p-3 shadow-lg group-hover:shadow-xl transition-all duration-300 min-w-[160px]">
                      <div className="flex items-center space-x-3">
                        {/* Google Play Logo */}
                        <div className="flex-shrink-0">
                          <svg
                            className="w-8 h-8"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"
                              fill="#4285f4"
                            />
                            <path
                              d="M14.54,11.15L16.81,8.88L20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L14.54,11.15Z"
                              fill="#ea4335"
                            />
                            <path
                              d="M6.05,21.34L16.81,15.12L15.39,12L14.54,12.85L6.05,21.34Z"
                              fill="#fbbc04"
                            />
                            <path
                              d="M6.05,2.66L14.54,11.15L15.39,12L16.81,8.88L6.05,2.66Z"
                              fill="#34a853"
                            />
                          </svg>
                        </div>
                        <div className="text-white">
                          <div className="text-xs opacity-80">
                            GET IT ON
                          </div>
                          <div className="text-base font-semibold">
                            Google Play
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="text-center lg:text-left">
                  <p className="text-sm text-gray-500">
                    Free download • No subscription required •
                    Premium features available
                  </p>
                </div>
              </motion.div>

              {/* Right Column - Email Capture & Features */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                {/* Email Capture */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-200/50">
                  <div className="text-center mb-4">
                    <h3 className="text-lg text-gray-900 mb-2">
                      Get Early Access
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Be the first to experience Manova on
                      mobile
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full pl-10 pr-3 py-3 bg-white border border-blue-100 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm"
                      />
                    </div>
                    <motion.button
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg font-medium text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>Notify Me</span>
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </div>

                  <p className="text-xs text-gray-500 mt-3 text-center">
                    No spam, just launch updates.
                  </p>
                </div>

                {/* Coming Soon Features */}
                <div className="space-y-3">
                  {[
                    {
                      title: "Mobile-First Design",
                      description:
                        "Optimized specifically for touch interfaces and mobile workflows",
                      icon: Smartphone,
                    },
                    {
                      title: "Offline Support",
                      description:
                        "Continue your wellness journey even without an internet connection",
                      icon: Shield,
                    },
                    {
                      title: "Smart Notifications",
                      description:
                        "Gentle reminders and encouragement delivered at the right time",
                      icon: Brain,
                    },
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.8,
                        delay: 0.6 + index * 0.1,
                      }}
                      viewport={{ once: true }}
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <feature.icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-base text-gray-900 mb-1">
                          {feature.title}
                        </h4>
                        <p className="text-gray-600 text-xs leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Floating background elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-200/30 to-blue-300/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-r from-blue-300/20 to-blue-400/20 rounded-full blur-2xl"></div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900 text-white w-full">
        <div className="w-full px-[5%] lg:px-[8%] py-16">
          {/* Main Footer Content */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
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
                <div className="h-12 w-auto">
                  <img
                    src={
                      image_616efd6ea4d8a30941c9778a6ef2df2647b70871
                    }
                    alt="Manova Logo"
                    className="h-12 w-auto object-contain filter brightness-0 invert"
                  />
                </div>
                <div className="text-xl font-semibold text-white tracking-tight">
                  Manova
                </div>
              </div>

              <p className="text-gray-300 leading-relaxed max-w-2xl">
                Empowering mental wellness through AI-driven
                insights and compassionate support. Your journey
                to better mental health starts here.
              </p>

              {/* Navigation Links */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">
                    Product
                  </h4>
                  <ul className="space-y-3">
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
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {link.name}
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">
                    Support
                  </h4>
                  <ul className="space-y-3">
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
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {link.name}
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">
                    Company
                  </h4>
                  <ul className="space-y-3">
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
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {link.name}
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">
                    Legal
                  </h4>
                  <ul className="space-y-3">
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
                          className="text-gray-400 hover:text-white transition-colors"
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
              className="lg:col-span-5 space-y-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {/* Newsletter Signup */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="text-xl font-medium text-white">
                    Stay Updated
                  </h4>
                  <p className="text-gray-400">
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
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-white">
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

                <div className="pt-4">
                  <p className="text-gray-400 text-sm">
                    Join our growing community of mental health
                    advocates and professionals.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Bottom */}
          <motion.div
            className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="text-gray-400 text-sm">
              © 2024 Manova. All rights reserved. Dedicated to
              mental wellness and AI innovation.
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a
                href="#"
                className="hover:text-white transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors"
              >
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
  );
}