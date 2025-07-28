import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AccessibilityIcon, EyeIcon, EarIcon, MousePointerIcon } from 'lucide-react';

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

const AccessibilityPage = () => {
  useEffect(() => {
    document.title = 'Manova | Accessibility';
    const style = document.createElement("style");
    style.textContent = cssVars;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

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
              <span className="text-black">Accessibility at </span>
              <span className="text-[#007CFF]">Manova</span>
            </h1>
            <p className="text-[20px] font-normal font-inter text-black leading-[32px] w-full max-w-[704px] mx-auto text-balance">
              Mental wellness support should be available to everyone. We're committed to making Manova accessible to all users, regardless of ability.
            </p>
          </motion.div>

          {/* Accessibility Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {[
              {
                icon: AccessibilityIcon,
                title: "WCAG Compliant",
                description: "Following Web Content Accessibility Guidelines for inclusive design"
              },
              {
                icon: EyeIcon,
                title: "Screen Reader Support",
                description: "Full compatibility with popular screen reading technologies"
              },
              {
                icon: EarIcon,
                title: "Audio Descriptions",
                description: "Audio alternatives for visual content and interactions"
              },
              {
                icon: MousePointerIcon,
                title: "Keyboard Navigation",
                description: "Complete functionality accessible via keyboard alone"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-[#007CFF] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[20px] font-bold font-inter text-black mb-3">{feature.title}</h3>
                <p className="text-[16px] font-normal font-inter text-black leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Content Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="prose prose-lg max-w-none"
          >
            <div className="bg-gray-50 rounded-lg p-8 mb-8">
              <h2 className="text-[32px] font-bold font-inter text-black mb-6">Our Commitment</h2>
              <p className="text-[18px] font-normal font-inter text-black leading-relaxed mb-4">
                We believe mental wellness tools should be accessible to everyone. We're actively working to ensure Manova meets the highest accessibility standards.
              </p>
              <p className="text-[18px] font-normal font-inter text-black leading-relaxed mb-4">
                Current accessibility features include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[16px] font-normal font-inter text-black mb-4">
                <li>High contrast color schemes for better visibility</li>
                <li>Scalable fonts that work with browser zoom</li>
                <li>Keyboard navigation throughout the platform</li>
                <li>Alternative text for all images and visual elements</li>
                <li>Clear, descriptive link text and button labels</li>
              </ul>
              <p className="text-[18px] font-normal font-inter text-black leading-relaxed">
                We're continuously improving our accessibility features and welcome feedback from our community.
              </p>
            </div>

            <div className="text-center">
              <p className="text-[16px] font-normal font-inter text-black mb-4">
                Need accessibility assistance or have suggestions?
              </p>
              <a 
                href="mailto:accessibility@manova.life" 
                className="text-[#007CFF] hover:underline font-bold font-inter"
              >
                Contact our accessibility team at accessibility@manova.life
              </a>
            </div>
          </motion.div>
        </div>
      </div>
  );
};

export default AccessibilityPage;