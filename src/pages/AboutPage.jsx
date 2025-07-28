import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  HeartIcon, 
  BrainCircuitIcon, 
  UsersIcon, 
  ShieldCheckIcon,
  SparklesIcon,
  LightbulbIcon
} from 'lucide-react';

// CSS variables for exact Figma colors
const cssVars = `
  :root {
    --primary-blue: #007CFF;
    --primary-blue-hover: #0066CC;
    --border-gray: #C5C5C5;
    --text-gray: #777;
    --border-light: #D8D8D8;
  }
`;

const AboutPage = () => {
  // Add CSS variables on component mount
  useEffect(() => {
    document.title = 'Manova | About';
    const style = document.createElement("style");
    style.textContent = cssVars;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  
  const values = [
    {
      icon: HeartIcon,
      title: "Empathy First",
      description: "We believe mental health support should feel human, not robotic. Every conversation is crafted with genuine care and understanding."
    },
    {
      icon: BrainCircuitIcon,
      title: "AI That Actually Gets You",
      description: "Our AI learns your unique patterns and communication style, offering support that feels personal and relevant to your life."
    },
    {
      icon: UsersIcon,
      title: "Real Community",
      description: "Connect with others who understand your journey. Share experiences, find support, and grow together in a judgment-free space."
    },
    {
      icon: ShieldCheckIcon,
      title: "Your Privacy Matters",
      description: "What you share stays private. We use industry-leading security to protect your personal wellness journey."
    }
  ];

  const team = [
    {
      name: "Sarthi AI",
      role: "Your AI Companion",
      description: "Always here to listen, understand, and guide you through your emotional journey.",
      icon: SparklesIcon
    },
    {
      name: "Expert Therapists",
      role: "Professional Support",
      description: "Licensed mental health professionals available when you need deeper intervention.",
      icon: LightbulbIcon
    }
  ];

  return (
    <div className="w-full bg-white min-h-screen">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-[48px] font-bold font-inter leading-normal text-balance mb-8">
            <span className="text-black">About </span>
            <span className="text-[#007CFF]">Manova</span>
          </h1>
          <p className="text-[20px] font-normal font-inter text-black leading-[32px] w-full max-w-[704px] mx-auto text-balance">
            Your AI-powered mental wellness companion that understands, adapts, and grows with you. Experience personalized support through empathetic conversations and professional-grade insights.
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gray-50 rounded-lg p-8 mb-16"
        >
          <h2 className="text-[48px] font-bold font-inter leading-normal text-center mb-6">
            <span className="text-black">Our </span>
            <span className="text-[#007CFF]">Mission</span>
          </h2>
          <p className="text-[20px] font-normal font-inter text-black leading-[32px] text-center max-w-[704px] mx-auto">
            Making mental wellness accessible to everyone, everywhere. We combine cutting-edge AI with human empathy to create a safe space where you can explore emotions, develop coping strategies, and build resilience at your own pace.
          </p>
        </motion.div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-[48px] font-bold font-inter leading-normal mb-6">
              <span className="text-black">Our </span>
              <span className="text-[#007CFF]">Values</span>
            </h2>
            <p className="text-[20px] font-normal font-inter text-black leading-[32px]">The principles that guide everything we do</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-[#007CFF] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[20px] font-bold font-inter text-black mb-3">{value.title}</h3>
                <p className="text-[16px] font-normal font-inter text-black leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-[48px] font-bold font-inter leading-normal mb-6">
              <span className="text-black">Who's Here for </span>
              <span className="text-[#007CFF]">You</span>
            </h2>
            <p className="text-[20px] font-normal font-inter text-black leading-[32px]">Meet the support system designed to help you thrive</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.2 }}
                className="bg-white border border-gray-200 rounded-lg p-8 text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-[#007CFF] rounded-full flex items-center justify-center mx-auto mb-4">
                  <member.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-[24px] font-bold font-inter text-black mb-2">{member.name}</h3>
                <p className="text-[#007CFF] font-bold font-inter mb-4">{member.role}</p>
                <p className="text-[16px] font-normal font-inter text-black leading-relaxed">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <div className="bg-[#007CFF] rounded-[24px] p-12 text-white text-center">
            <h2 className="text-[48px] font-bold font-inter leading-normal mb-6">
              <span className="text-white">Ready to Begin Your </span>
              <span className="text-white">Journey?</span>
            </h2>
            <p className="text-[20px] font-normal font-inter text-white leading-[32px] mb-8 opacity-90 max-w-[704px] mx-auto">
              Join thousands who have found support, understanding, and growth with Manova.
            </p>
            <motion.button
              onClick={() => window.location.href = '/signup'}
              className="flex py-[16px] px-[24px] justify-center items-center gap-[10px] rounded-[24px] bg-white hover:bg-gray-50 transition-colors shadow-[0px_1px_18px_0px_rgba(0,0,0,0.40)] mx-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-[16px] font-bold font-inter text-[#007CFF]">
                Start Your Journey Today
              </span>
            </motion.button>
          </div>
        </motion.div>
        </div>
    </div>
  );
};

export default AboutPage;