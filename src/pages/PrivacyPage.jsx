import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldIcon, LockIcon, EyeIcon, DatabaseIcon } from 'lucide-react';

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

const PrivacyPage = () => {
  useEffect(() => {
    document.title = 'Manova | Privacy Policy';
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
              <span className="text-black">Privacy </span>
              <span className="text-[#007CFF]">Policy</span>
            </h1>
            <p className="text-[20px] font-normal font-inter text-black leading-[32px] w-full max-w-[704px] mx-auto text-balance">
              Your privacy and data security are our top priorities. Here's how we protect your mental health information.
            </p>
          </motion.div>

          {/* Privacy Principles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {[
              {
                icon: ShieldIcon,
                title: "DPDP 2023 Compliant",
                description: "Data protected by India's DPDP 2023 with enterprise-grade security"
              },
              {
                icon: LockIcon,
                title: "End-to-End Encryption",
                description: "Your conversations are encrypted and secure from unauthorized access"
              },
              {
                icon: EyeIcon,
                title: "Your Control",
                description: "You decide what to share and with whom - full control over your data"
              },
              {
                icon: DatabaseIcon,
                title: "No Data Sales",
                description: "We never sell your personal information to third parties"
              }
            ].map((principle, index) => (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-[#007CFF] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <principle.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[20px] font-bold font-inter text-black mb-3">{principle.title}</h3>
                <p className="text-[16px] font-normal font-inter text-black leading-relaxed">{principle.description}</p>
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
              <h2 className="text-[32px] font-bold font-inter text-black mb-6">Coming Soon</h2>
              <p className="text-[18px] font-normal font-inter text-black leading-relaxed mb-4">
                We're currently finalizing our comprehensive privacy policy to ensure complete transparency about how we handle your data.
              </p>
              <p className="text-[18px] font-normal font-inter text-black leading-relaxed">
                In the meantime, please know that we follow industry best practices for data protection and never share your personal information without your explicit consent.
              </p>
            </div>

            <div className="text-center">
              <p className="text-[16px] font-normal font-inter text-black mb-4">
                Questions about our privacy practices?
              </p>
              <a 
                href="mailto:privacy@manova.life" 
                className="text-[#007CFF] hover:underline font-bold font-inter"
              >
                Contact our privacy team at privacy@manova.life
              </a>
            </div>
          </motion.div>
        </div>
      </div>
  );
};

export default PrivacyPage;