import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CookieIcon, SettingsIcon, BarChart3Icon, ShieldIcon } from 'lucide-react';

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

const CookiesPage = () => {
  useEffect(() => {
    document.title = 'Manova | Cookie Policy';
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
              <span className="text-black">Cookie </span>
              <span className="text-[#007CFF]">Policy</span>
            </h1>
            <p className="text-[20px] font-normal font-inter text-black leading-[32px] w-full max-w-[704px] mx-auto text-balance">
              Transparency about how we use cookies to improve your experience while protecting your privacy.
            </p>
          </motion.div>

          {/* Cookie Types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {[
              {
                icon: CookieIcon,
                title: "Essential Cookies",
                description: "Required for basic website functionality and security"
              },
              {
                icon: SettingsIcon,
                title: "Preference Cookies",
                description: "Remember your settings and personalization choices"
              },
              {
                icon: BarChart3Icon,
                title: "Analytics Cookies",
                description: "Help us understand how you use Manova to improve the experience"
              },
              {
                icon: ShieldIcon,
                title: "Your Control",
                description: "You can manage cookie preferences in your browser settings"
              }
            ].map((cookie, index) => (
              <motion.div
                key={cookie.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-[#007CFF] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <cookie.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[20px] font-bold font-inter text-black mb-3">{cookie.title}</h3>
                <p className="text-[16px] font-normal font-inter text-black leading-relaxed">{cookie.description}</p>
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
              <h2 className="text-[32px] font-bold font-inter text-black mb-6">How We Use Cookies</h2>
              <p className="text-[18px] font-normal font-inter text-black leading-relaxed mb-4">
                Cookies help us provide you with a better, more personalized experience on Manova. We use them responsibly and only when necessary.
              </p>
              <p className="text-[18px] font-normal font-inter text-black leading-relaxed mb-4">
                We use cookies for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[16px] font-normal font-inter text-black mb-4">
                <li>Keeping you logged in to your account</li>
                <li>Remembering your language and display preferences</li>
                <li>Understanding which features are most helpful to users</li>
                <li>Ensuring website security and preventing fraud</li>
                <li>Analyzing usage patterns to improve our AI companion</li>
              </ul>
              <p className="text-[18px] font-normal font-inter text-black leading-relaxed">
                You can control cookie settings through your browser preferences. Note that disabling certain cookies may affect website functionality.
              </p>
            </div>

            <div className="text-center">
              <p className="text-[16px] font-normal font-inter text-black mb-4">
                Questions about our cookie policy?
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

export default CookiesPage;