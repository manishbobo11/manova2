import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileTextIcon, ScaleIcon, CheckCircleIcon, AlertTriangleIcon } from 'lucide-react';

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

const TermsPage = () => {
  useEffect(() => {
    document.title = 'Manova | Terms of Service';
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
              <span className="text-black">Terms of </span>
              <span className="text-[#007CFF]">Service</span>
            </h1>
            <p className="text-[20px] font-normal font-inter text-black leading-[32px] w-full max-w-[704px] mx-auto text-balance">
              Clear, fair terms that protect both you and our platform while ensuring the best possible mental wellness experience.
            </p>
          </motion.div>

          {/* Key Points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {[
              {
                icon: FileTextIcon,
                title: "Fair Terms",
                description: "Straightforward language, no hidden clauses or surprises"
              },
              {
                icon: ScaleIcon,
                title: "Balanced Rights",
                description: "Protecting both user rights and platform integrity"
              },
              {
                icon: CheckCircleIcon,
                title: "User Safety",
                description: "Guidelines designed to maintain a safe mental health environment"
              },
              {
                icon: AlertTriangleIcon,
                title: "Clear Boundaries",
                description: "Transparent about what we can and cannot provide"
              }
            ].map((point, index) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-[#007CFF] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <point.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[20px] font-bold font-inter text-black mb-3">{point.title}</h3>
                <p className="text-[16px] font-normal font-inter text-black leading-relaxed">{point.description}</p>
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
              <h2 className="text-[32px] font-bold font-inter text-black mb-6">Terms Coming Soon</h2>
              <p className="text-[18px] font-normal font-inter text-black leading-relaxed mb-4">
                We're currently working with legal experts to create comprehensive terms of service that are both protective and user-friendly.
              </p>
              <p className="text-[18px] font-normal font-inter text-black leading-relaxed mb-4">
                Our terms will clearly outline:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[16px] font-normal font-inter text-black">
                <li>Your rights and responsibilities as a user</li>
                <li>How to use Manova safely and effectively</li>
                <li>What constitutes appropriate use of our AI companion</li>
                <li>Intellectual property and content ownership</li>
                <li>Limitation of liability for mental health services</li>
              </ul>
            </div>

            <div className="text-center">
              <p className="text-[16px] font-normal font-inter text-black mb-4">
                Questions about our terms of service?
              </p>
              <a 
                href="mailto:legal@manova.life" 
                className="text-[#007CFF] hover:underline font-bold font-inter"
              >
                Contact our legal team at legal@manova.life
              </a>
            </div>
          </motion.div>
        </div>
      </div>
  );
};

export default TermsPage;