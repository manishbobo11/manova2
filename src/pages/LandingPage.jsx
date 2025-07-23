import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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

// Animated Hero Section Component
const AnimatedHeroSection = () => {
  const featureTags = [
    { text: "Secure", color: "from-green-400 to-emerald-500", delay: 0.2 },
    { text: "Trusted", color: "from-blue-400 to-blue-600", delay: 0.4 },
    { text: "AI-Powered", color: "from-purple-400 to-purple-600", delay: 0.6 },
    {
      text: "24/7 Support",
      color: "from-orange-400 to-orange-600",
      delay: 0.8,
    },
  ];

  return (
    <div className="hidden lg:block absolute left-[740px] top-[149px] w-[580px] h-[593px]">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Background gradient circle */}
        <motion.div
          className="absolute inset-8 bg-gradient-to-br from-blue-100 via-purple-50 to-blue-50 rounded-full opacity-60"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        {/* Floating decorative dots */}
        <motion.div
          className="absolute top-16 left-12 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full shadow-lg opacity-70"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.7 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
        <motion.div
          className="absolute top-24 right-14 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full shadow-lg opacity-60"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />
        <motion.div
          className="absolute bottom-24 left-16 w-4 h-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full shadow-lg opacity-80"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.8 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        />
        <motion.div
          className="absolute bottom-20 right-12 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg opacity-70"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.7 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        />

        {/* Main Manova Logo */}
        <motion.div
          className="absolute inset-0 flex justify-center items-center"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <div className="bg-white rounded-3xl p-4 md:p-6 shadow-[0_0_30px_rgba(173,216,230,0.3)] w-40 sm:w-56 md:w-64 flex items-center justify-center">
            <img
              src="/logo/manova-logo.png"
              alt="Manova"
              className="w-full h-full object-contain"
            />
          </div>
        </motion.div>

        {/* Floating Feature Tags */}
        {featureTags.map((tag, index) => (
          <motion.div
            key={tag.text}
            className={`absolute px-4 py-2 rounded-full bg-gradient-to-r ${tag.color} text-white text-sm font-semibold shadow-lg backdrop-blur-sm`}
            style={{
              top: `${20 + index * 15}%`,
              left: index % 2 === 0 ? "10%" : "70%",
            }}
            initial={{
              scale: 0,
              opacity: 0,
              y: 20,
              x: index % 2 === 0 ? -20 : 20,
            }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
              x: 0,
            }}
            transition={{
              duration: 0.8,
              delay: tag.delay,
              ease: "easeOut",
            }}
            whileHover={{
              scale: 1.1,
              y: -5,
            }}
          >
            {tag.text}
          </motion.div>
        ))}

        {/* Additional floating elements */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-2 h-2 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-60"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 0.6, delay: 1.1 }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full opacity-70"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.7 }}
          transition={{ duration: 0.6, delay: 1.3 }}
        />
      </div>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();

  // Add CSS variables on component mount
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = cssVars;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="min-h-screen w-full bg-white overflow-hidden">
      {/* Navigation Header - Now handled by unified Navbar component */}

      {/* Main Content Section */}
      <div className="w-full max-w-[1440px] mx-auto relative bg-white min-h-[calc(100vh-67px)]">
        {/* Animated Hero Section */}
        <AnimatedHeroSection />

        {/* Left Side Content */}
        <div className="lg:absolute lg:left-[138px] lg:top-[217px] lg:w-[580px] lg:h-[457px] w-full max-w-2xl mx-auto lg:mx-0 px-4 lg:px-0 py-8 lg:py-0">
          <div className="flex flex-col items-start gap-[25px] h-full">
            {/* Title and Description Section */}
            <div className="flex flex-col items-start gap-[36px] w-full">
              {/* Main Headline */}
              <h1 className="text-[48px] font-bold font-inter leading-normal">
                <span className="text-black">Your AI-Powered </span>
                <span className="text-[#007CFF]">Mental Health</span>
                <span className="text-black"> Companion</span>
              </h1>

              {/* Description */}
              <p className="text-[20px] font-normal font-inter text-black leading-[32px] w-full">
                Transform your mental wellness journey with AI that Understand ,
                adapts and grows with you available 24/7 with complete privacy.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col lg:flex-row gap-[10px] lg:gap-[16px] w-full lg:w-auto">
              <motion.button
                onClick={() => navigate("/signup")}
                className="flex py-[16px] px-[24px] justify-center items-center gap-[10px] rounded-[24px] bg-[#007CFF] hover:bg-[#0066CC] transition-colors shadow-[0px_1px_18px_0px_rgba(0,0,0,0.40)]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-[16px] font-bold font-inter text-white">
                  Start Your Journey
                </span>
              </motion.button>

              <motion.button
                onClick={() => navigate("/community")}
                className="flex py-[16px] px-[24px] justify-center items-center gap-[10px] rounded-[24px] border border-[#007CFF] bg-white hover:bg-gray-50 transition-colors shadow-[0px_1px_12px_0px_rgba(0,0,0,0.40)]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-[16px] font-bold font-inter text-[#007CFF]">
                  Join the Community
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Feeling Stuck Section */}
      <section className="w-full bg-white py-16 lg:py-24">
        <div className="w-full max-w-[1440px] mx-auto relative px-4">
          {/* Main Title */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[48px] font-bold font-inter leading-normal mb-6">
              <span className="text-black">Feeling Stuck? </span>
              <span className="text-[#007CFF]">Let's Begin</span>
            </h2>
            <p className="text-[20px] font-normal font-inter text-black leading-[32px] max-w-[704px] mx-auto text-center">
              Experience how Manova Adaptive Check-ins transform uncertainty
              into understanding through intelligent, personalized conversations
            </p>
          </motion.div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center mt-16">
            {/* Left Side - Illustration */}
            <motion.div
              className="flex justify-center lg:justify-start"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="relative w-full max-w-[477px] h-[621px]">
                {/* Speech Bubble */}
                <div className="absolute top-0 left-0 w-[286px] h-[187px]">
                  <svg
                    className="absolute left-0 top-0 w-full h-full"
                    viewBox="0 0 244 165"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M97.5422 7.96692C112.441 -0.986846 131.065 -0.986845 145.963 7.96692L159.771 16.2648C165.936 19.9701 172.842 22.2728 179.997 23.0089L203.753 25.4523C219.503 27.0726 230.946 41.171 229.292 56.9171L229.195 57.84C228.37 65.6923 230.841 73.5347 236.018 79.4962C247.641 92.8816 243.093 113.686 226.944 120.998L217.251 125.387C210.584 128.406 204.981 133.363 201.173 139.613L199.501 142.358C189.718 158.415 170.954 166.661 152.509 163.011L131.265 158.807C124.984 157.564 118.521 157.564 112.24 158.807L90.9963 163.011C72.5512 166.661 53.7878 158.415 44.0042 142.358L42.3323 139.613C38.5241 133.363 32.9212 128.406 26.2542 125.387L16.5618 120.998C0.412456 113.685 -4.13606 92.8816 7.48755 79.4962C12.6643 73.5347 15.1355 65.6923 14.3108 57.84L14.2131 56.9171C12.5595 41.171 24.0026 27.0726 39.7522 25.4523L63.5081 23.0089C70.6634 22.2728 77.5692 19.9701 83.7346 16.2648L97.5422 7.96692Z"
                      fill="white"
                      stroke="#CCCCCC"
                      strokeWidth="2"
                    />
                  </svg>
                  <div className="absolute left-[49px] top-[74px] w-[188px] h-[48px] text-center">
                    <p className="text-[20px] font-normal font-inter text-black leading-normal">
                      I Don't even Know how I Feel....
                    </p>
                  </div>
                </div>

                {/* Person Illustration */}
                <div className="absolute left-[66px] top-[145px] w-[410px] h-[477px]">
                  <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/228eef6a0abd38abf22d10c66f0c95447f3705e8?width=820"
                    alt="Person thinking"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </motion.div>

            {/* Right Side - Content */}
            <motion.div
              className="flex flex-col items-center text-center lg:text-left lg:items-start gap-[28px]"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <p className="text-[20px] font-normal font-inter text-black leading-normal">
                Sometimes, it's hard to name your feelings
              </p>

              <h3 className="text-[30px] font-bold font-inter text-[#007CFF] leading-normal">
                That's Where Manova Starts
              </h3>

              <p className="text-[20px] font-normal font-inter text-black leading-[32px] max-w-[580px]">
                When emotions feel overwhelming and unclear, our AI companion
                meets you exactly where you are no judgment, just understanding.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Meet Your Adaptive Check-In Section */}
      <section className="w-full bg-white py-16 lg:py-24">
        <div className="w-full max-w-[1440px] mx-auto relative px-4">
          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Side - Content */}
            <motion.div
              className="lg:w-[704px] lg:h-[547px] flex flex-col gap-[100px]"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              {/* Title and Description */}
              <div className="flex flex-col gap-[65px]">
                <h2 className="text-[48px] font-bold font-inter leading-normal">
                  <span className="text-black">Meet Your </span>
                  <span className="text-[#007CFF]">Adaptive Check-In</span>
                </h2>

                <p className="text-[20px] font-normal font-inter text-black leading-[32px]">
                  Through gentle, intelligent conversations, Manova learns to
                  ask the right questions at the right time, helping you
                  discover patterns and insights about your mental health.
                </p>
              </div>

              {/* Feature Items */}
              <div className="w-full max-w-[530px] flex flex-col gap-[24px]">
                {/* AI learns your communication style */}
                <motion.div
                  className="flex items-center py-[18px] px-[75px] rounded-[100px] bg-[rgba(169,211,255,0.20)]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-[50px] w-full">
                    <svg
                      className="w-[24px] h-[24px] flex-shrink-0"
                      viewBox="0 0 24 25"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 18.5V5.5"
                        stroke="#007CFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M15 13.5C14.1348 13.2471 13.3748 12.7206 12.834 11.9995C12.2932 11.2784 12.0005 10.4014 12 9.5C11.9995 10.4014 11.7068 11.2784 11.166 11.9995C10.6252 12.7206 9.8652 13.2471 9 13.5"
                        stroke="#007CFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M17.598 6.99989C17.8281 6.60138 17.9635 6.15527 17.9936 5.69608C18.0237 5.23689 17.9478 4.77693 17.7717 4.35178C17.5956 3.92663 17.324 3.54769 16.9781 3.24427C16.6321 2.94085 16.221 2.72108 15.7765 2.60198C15.332 2.48288 14.866 2.46763 14.4147 2.5574C13.9634 2.64718 13.5387 2.83959 13.1737 3.11973C12.8086 3.39988 12.5129 3.76025 12.3093 4.17298C12.1058 4.5857 12 5.03971 12 5.49989C12 5.03971 11.8942 4.5857 11.6907 4.17298C11.4871 3.76025 11.1914 3.39988 10.8263 3.11973C10.4613 2.83959 10.0366 2.64718 9.5853 2.5574C9.13396 2.46763 8.66803 2.48288 8.22353 2.60198C7.77904 2.72108 7.3679 2.94085 7.02193 3.24427C6.67596 3.54769 6.40442 3.92663 6.22833 4.35178C6.05224 4.77693 5.97632 5.23689 6.00643 5.69608C6.03655 6.15527 6.17189 6.60138 6.402 6.99989"
                        stroke="#007CFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M17.9971 5.625C18.5849 5.77614 19.1306 6.05905 19.5928 6.45231C20.0551 6.84557 20.4218 7.33887 20.6652 7.89485C20.9086 8.45082 21.0223 9.05489 20.9977 9.66131C20.9731 10.2677 20.8108 10.8606 20.5231 11.395"
                        stroke="#007CFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M18 18.4999C18.8805 18.4998 19.7364 18.2093 20.4349 17.6733C21.1335 17.1372 21.6356 16.3857 21.8635 15.5352C22.0914 14.6847 22.0323 13.7827 21.6954 12.9693C21.3585 12.1558 20.7625 11.4762 20 11.0359"
                        stroke="#007CFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M19.967 17.9829C20.0371 18.5251 19.9953 19.076 19.8441 19.6014C19.693 20.1269 19.4357 20.6157 19.0882 21.0379C18.7407 21.46 18.3104 21.8064 17.8238 22.0557C17.3372 22.305 16.8046 22.4518 16.259 22.4872C15.7134 22.5227 15.1664 22.4458 14.6516 22.2615C14.1369 22.0772 13.6654 21.7893 13.2662 21.4157C12.8671 21.042 12.5488 20.5905 12.331 20.089C12.1132 19.5875 12.0006 19.0467 12 18.4999C11.9994 19.0467 11.8867 19.5875 11.669 20.089C11.4512 20.5905 11.1329 21.042 10.7338 21.4157C10.3346 21.7893 9.86313 22.0772 9.34838 22.2615C8.83364 22.4458 8.28657 22.5227 7.74097 22.4872C7.19537 22.4518 6.66283 22.305 6.17622 22.0557C5.68961 21.8064 5.25927 21.46 4.91178 21.0379C4.56429 20.6157 4.30703 20.1269 4.15589 19.6014C4.00474 19.076 3.96291 18.5251 4.033 17.9829"
                        stroke="#007CFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6.00007 18.4999C5.11957 18.4998 4.26368 18.2093 3.56514 17.6733C2.8666 17.1372 2.36444 16.3857 2.13655 15.5352C1.90865 14.6847 1.96775 13.7827 2.30469 12.9693C2.64162 12.1558 3.23755 11.4762 4.00007 11.0359"
                        stroke="#007CFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6.00293 5.625C5.41513 5.77614 4.86943 6.05905 4.40716 6.45231C3.94489 6.84557 3.57817 7.33887 3.33477 7.89485C3.09138 8.45082 2.97769 9.05489 3.00232 9.66131C3.02695 10.2677 3.18925 10.8606 3.47693 11.395"
                        stroke="#007CFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="text-[20px] font-normal font-inter text-black text-center flex-1">
                      AI learns your communication style
                    </p>
                  </div>
                </motion.div>

                {/* Empathetic responses tailored to you */}
                <motion.div
                  className="flex items-center py-[18px] px-[75px] rounded-[100px] bg-[rgba(169,211,255,0.20)]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-[39px] w-full">
                    <svg
                      className="w-[24px] h-[24px] flex-shrink-0"
                      viewBox="0 0 24 25"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19 14.5C20.49 13.04 22 11.29 22 9C22 7.54131 21.4205 6.14236 20.3891 5.11091C19.3576 4.07946 17.9587 3.5 16.5 3.5C14.74 3.5 13.5 4 12 5.5C10.5 4 9.26 3.5 7.5 3.5C6.04131 3.5 4.64236 4.07946 3.61091 5.11091C2.57946 6.14236 2 7.54131 2 9C2 11.3 3.5 13.05 5 14.5L12 21.5L19 14.5Z"
                        stroke="#007CFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="text-[20px] font-normal font-inter text-black text-center flex-1">
                      Empathetic responses tailored to you
                    </p>
                  </div>
                </motion.div>

                {/* Gentle insights reveal hidden patterns */}
                <motion.div
                  className="flex items-center py-[18px] px-[75px] rounded-[100px] bg-[rgba(169,211,255,0.20)]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-[36px] w-full">
                    <svg
                      className="w-[24px] h-[24px] flex-shrink-0"
                      viewBox="0 0 24 25"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15 14.5C15.2 13.5 15.7 12.8 16.5 12C17.5 11.1 18 9.8 18 8.5C18 6.9087 17.3679 5.38258 17.2426 4.25736C15.1174 3.13214 13.5913 2.5 12 2.5C10.4087 2.5 8.88258 3.13214 7.75736 4.25736C6.63214 5.38258 6 6.9087 6 8.5C6 9.5 6.2 10.7 7.5 12C8.2 12.7 8.8 13.5 9 14.5"
                        stroke="#007CFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 18.5H15"
                        stroke="#007CFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10 22.5H14"
                        stroke="#007CFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="text-[20px] font-normal font-inter text-black text-center flex-1">
                      Gentle insights reveal hidden patterns
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Side - Illustration */}
            <motion.div
              className="flex justify-center lg:justify-end"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-full max-w-[379px] h-[569px]">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/7e1cf403a656cfddd8e4183e8c7eb9d6d3e7b0ed?width=758"
                  alt="Happy person using Manova adaptive check-in"
                  className="w-full h-full object-contain"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Watch Your Progress Unfold Section */}
      <section className="w-full bg-white py-16 lg:py-24">
        <div className="w-full max-w-[1440px] mx-auto relative px-4">
          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Side - Progress Card */}
            <motion.div
              className="flex justify-center lg:justify-start"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="w-[364px] h-[664px] rounded-[28px] border border-white bg-white shadow-[0px_4px_40px_0px_rgba(0,0,0,0.30)] relative">
                {/* Card Title */}
                <h3 className="text-[20px] font-bold font-inter text-black absolute left-[93px] top-[31px] w-[181px] h-[24px]">
                  30 Days of Growth
                </h3>

                {/* Progress Circle */}
                <div className="absolute left-[127px] top-[95px] w-[114px] h-[113px]">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 128 128"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M120.654 63.6003C120.654 74.7948 117.334 85.7379 111.115 95.0458C104.896 104.354 96.0559 111.608 85.7135 115.892C75.3712 120.176 63.9907 121.297 53.0113 119.113C42.032 116.929 31.9467 111.539 24.031 103.623C16.1153 95.7072 10.7247 85.622 8.5407 74.6426C6.35675 63.6632 7.4776 52.2828 11.7615 41.9404C16.0454 31.5981 23.3 22.7583 32.6079 16.539C41.9157 10.3196 52.8588 7.00003 64.0533 7"
                      stroke="#CCCCCC"
                      strokeWidth="14"
                    />
                    <path
                      d="M63.6804 7C74.8749 7 85.818 10.3195 95.1259 16.5389C104.434 22.7582 111.688 31.5979 115.972 41.9403C120.256 52.2826 121.377 63.6631 119.193 74.6425C117.009 85.6218 111.619 95.7071 103.703 103.623C95.7873 111.538 85.7021 116.929 74.7227 119.113C63.7433 121.297 52.3629 120.176 42.0205 115.892C31.6782 111.608 22.8384 104.354 16.619 95.0459C10.3997 85.7381 7.08011 74.795 7.08008 63.6005"
                      stroke="#00D636"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute left-[31px] top-[40px] w-[52px] h-[33px]">
                    <span className="text-[24px] font-normal text-[#00D636] font-nunito">
                      75%
                    </span>
                  </div>
                </div>

                {/* Progress Items */}
                <div className="absolute left-[24px] top-[238px] w-[315px] h-[371px] flex flex-col gap-[16px]">
                  {/* Week 1 - Recognized triggers */}
                  <div className="flex items-center gap-[12px] p-[16px] rounded-[14px] bg-[#DEFFF4]">
                    <svg
                      className="w-[24px] h-[24px] flex-shrink-0"
                      viewBox="0 0 25 25"
                      fill="none"
                    >
                      <path
                        d="M22.4381 10.373C22.8948 12.6143 22.5693 14.9445 21.5159 16.9748C20.4625 19.0052 18.745 20.6131 16.6496 21.5304C14.5542 22.4476 12.2077 22.6188 10.0014 22.0154C7.79503 21.412 5.86225 20.0704 4.52534 18.2145C3.18842 16.3585 2.52818 14.1003 2.65473 11.8164C2.78127 9.53257 3.68694 7.36113 5.22071 5.66421C6.75448 3.96729 8.82364 2.84747 11.0831 2.49149C13.3426 2.13551 15.6558 2.5649 17.6371 3.70804"
                        stroke="#1AE24C"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.63696 11.373L12.637 14.373L22.637 4.37305"
                        stroke="#1AE24C"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex flex-col gap-[10px] w-[176px]">
                      <h4 className="text-[18px] font-bold font-inter text-black">
                        Recognized triggers
                      </h4>
                      <p className="text-[16px] font-normal font-inter text-black">
                        Week 1
                      </p>
                    </div>
                  </div>

                  {/* Week 2 - Felt burnout early */}
                  <div className="flex items-center gap-[12px] p-[16px] rounded-[14px] bg-[#FFFDEA]">
                    <svg
                      className="w-[24px] h-[24px] flex-shrink-0"
                      viewBox="0 0 25 25"
                      fill="none"
                    >
                      <path
                        d="M12.637 6.11865V12.1187L16.637 14.1187"
                        stroke="#E0E312"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12.637 22.1187C18.1598 22.1187 22.637 17.6415 22.637 12.1187C22.637 6.5958 18.1598 2.11865 12.637 2.11865C7.11412 2.11865 2.63696 6.5958 2.63696 12.1187C2.63696 17.6415 7.11412 22.1187 12.637 22.1187Z"
                        stroke="#E0E312"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex flex-col gap-[10px] w-[154px]">
                      <h4 className="text-[18px] font-bold font-inter text-black">
                        Felt burnout early
                      </h4>
                      <p className="text-[16px] font-normal font-inter text-black">
                        Week 2
                      </p>
                    </div>
                  </div>

                  {/* Week 3 - Took a mental break */}
                  <div className="flex items-center gap-[12px] p-[16px] rounded-[14px] bg-[#DEFFF4]">
                    <svg
                      className="w-[24px] h-[24px] flex-shrink-0"
                      viewBox="0 0 25 25"
                      fill="none"
                    >
                      <path
                        d="M22.4381 10.8647C22.8948 13.106 22.5693 15.4362 21.5159 17.4665C20.4625 19.4969 18.745 21.1048 16.6496 22.0221C14.5542 22.9393 12.2077 23.1105 10.0014 22.5071C7.79503 21.9037 5.86225 20.5621 4.52534 18.7062C3.18842 16.8502 2.52818 14.592 2.65473 12.3081C2.78127 10.0243 3.68694 7.85283 5.22071 6.15591C6.75448 4.45899 8.82364 3.33917 11.0831 2.98319C13.3426 2.62721 15.6558 3.0566 17.6371 4.19974"
                        stroke="#1AE24C"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.63696 11.8647L12.637 14.8647L22.637 4.86475"
                        stroke="#1AE24C"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex flex-col gap-[10px] w-[176px]">
                      <h4 className="text-[18px] font-bold font-inter text-black">
                        Took a mental break
                      </h4>
                      <p className="text-[16px] font-normal font-inter text-black">
                        Week 3
                      </p>
                    </div>
                  </div>

                  {/* Week 4 - Built healthy habits */}
                  <div className="flex items-center gap-[12px] p-[16px] rounded-[14px] bg-[#E5F5FF]">
                    <svg
                      className="w-[24px] h-[24px] flex-shrink-0"
                      viewBox="0 0 25 25"
                      fill="none"
                    >
                      <path
                        d="M12.637 22.6104C18.1598 22.6104 22.637 18.1332 22.637 12.6104C22.637 7.0875 18.1598 2.61035 12.637 2.61035C7.11412 2.61035 2.63696 7.0875 2.63696 12.6104C2.63696 18.1332 7.11412 22.6104 12.637 22.6104Z"
                        stroke="#007CFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12.637 18.6104C15.9507 18.6104 18.637 15.9241 18.637 12.6104C18.637 9.29664 15.9507 6.61035 12.637 6.61035C9.32325 6.61035 6.63696 9.29664 6.63696 12.6104C6.63696 15.9241 9.32325 18.6104 12.637 18.6104Z"
                        stroke="#007CFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12.637 14.6104C13.7415 14.6104 14.637 13.7149 14.637 12.6104C14.637 11.5058 13.7415 10.6104 12.637 10.6104C11.5324 10.6104 10.637 11.5058 10.637 12.6104C10.637 13.7149 11.5324 14.6104 12.637 14.6104Z"
                        stroke="#007CFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex flex-col gap-[10px] w-[167px]">
                      <h4 className="text-[18px] font-bold font-inter text-black">
                        Built healthy habits
                      </h4>
                      <p className="text-[16px] font-normal font-inter text-black">
                        Week 4
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Content */}
            <motion.div
              className="flex flex-col gap-[61px] lg:w-[704px] lg:h-[577px]"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {/* Title and Description */}
              <div className="flex flex-col gap-[50px]">
                <h2 className="text-[48px] font-bold font-inter leading-normal">
                  <span className="text-black">Watch Your </span>
                  <span className="text-[#007CFF]">Progress Unfold</span>
                </h2>

                <p className="text-[20px] font-normal font-inter text-black leading-[32px]">
                  Track meaningful insights, celebrate breakthroughs, and build
                  sustainable habits. Each check-in becomes a step forward in
                  your mental wellness journey.
                </p>
              </div>

              {/* Feature Items */}
              <div className="w-full max-w-[530px] flex flex-col gap-[24px]">
                {/* Identify emotional patterns */}
                <motion.div
                  className="flex items-center py-[18px] px-[75px] rounded-[100px] bg-[rgba(169,211,255,0.20)]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-[32px] w-full">
                    <svg
                      className="w-[24px] h-[24px] flex-shrink-0"
                      viewBox="0 0 24 25"
                      fill="none"
                    >
                      <path
                        d="M12 22.8613C17.5228 22.8613 22 18.3842 22 12.8613C22 7.33848 17.5228 2.86133 12 2.86133C6.47715 2.86133 2 7.33848 2 12.8613C2 18.3842 6.47715 22.8613 12 22.8613Z"
                        stroke="#007CFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 18.8613C15.3137 18.8613 18 16.175 18 12.8613C18 9.54762 15.3137 6.86133 12 6.86133C8.68629 6.86133 6 9.54762 6 12.8613C6 16.175 8.68629 18.8613 12 18.8613Z"
                        stroke="#007CFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 14.8613C13.1046 14.8613 14 13.9659 14 12.8613C14 11.7568 13.1046 10.8613 12 10.8613C10.8954 10.8613 10 11.7568 10 12.8613C10 13.9659 10.8954 14.8613 12 14.8613Z"
                        stroke="#007CFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="text-[20px] font-normal font-inter text-black text-center flex-1">
                      Identify emotional patterns
                    </p>
                  </div>
                </motion.div>

                {/* Build personalized coping strategies */}
                <motion.div
                  className="flex items-center py-[18px] px-[75px] rounded-[100px] bg-[rgba(169,211,255,0.20)]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-[32px] w-full">
                    <svg
                      className="w-[24px] h-[24px] flex-shrink-0"
                      viewBox="0 0 24 25"
                      fill="none"
                    >
                      <path
                        d="M20 13.8613C20 18.8613 16.5 21.3613 12.34 22.8113C12.1222 22.8851 11.8855 22.8816 11.67 22.8013C7.5 21.3613 4 18.8613 4 13.8613V6.86129C4 6.59607 4.10536 6.34172 4.29289 6.15418C4.48043 5.96665 4.73478 5.86129 5 5.86129C7 5.86129 9.5 4.66129 11.24 3.14129C11.4519 2.96029 11.7214 2.86084 12 2.86084C12.2786 2.86084 12.5481 2.96029 12.76 3.14129C14.51 4.67129 17 5.86129 19 5.86129C19.2652 5.86129 19.5196 5.96665 19.7071 6.15418C19.8946 6.34172 20 6.59607 20 6.86129V13.8613Z"
                        stroke="#007CFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="text-[20px] font-normal font-inter text-black text-center flex-1">
                      Build personalized coping strategies
                    </p>
                  </div>
                </motion.div>

                {/* Celebrate small victories */}
                <motion.div
                  className="flex items-center py-[18px] px-[75px] rounded-[100px] bg-[rgba(169,211,255,0.20)]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-[32px] w-full">
                    <svg
                      className="w-[24px] h-[24px] flex-shrink-0"
                      viewBox="0 0 24 25"
                      fill="none"
                    >
                      <path
                        d="M15.477 13.7512L16.992 22.2772C17.009 22.3776 16.9949 22.4808 16.9516 22.573C16.9084 22.6651 16.838 22.7419 16.7499 22.793C16.6619 22.8441 16.5603 22.8671 16.4588 22.8589C16.3573 22.8507 16.2607 22.8118 16.182 22.7472L12.602 20.0602C12.4292 19.9311 12.2192 19.8613 12.0035 19.8613C11.7878 19.8613 11.5778 19.9311 11.405 20.0602L7.819 22.7462C7.74032 22.8107 7.64386 22.8496 7.54249 22.8578C7.44112 22.866 7.33967 22.843 7.25166 22.7921C7.16365 22.7411 7.09327 22.6645 7.04991 22.5726C7.00656 22.4806 6.99228 22.3775 7.009 22.2772L8.523 13.7512"
                        stroke="#007CFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 14.8613C15.3137 14.8613 18 12.175 18 8.86133C18 5.54762 15.3137 2.86133 12 2.86133C8.68629 2.86133 6 5.54762 6 8.86133C6 12.175 8.68629 14.8613 12 14.8613Z"
                        stroke="#007CFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="text-[20px] font-normal font-inter text-black text-center flex-1">
                      Celebrate small victories
                    </p>
                  </div>
                </motion.div>

                {/* Develop lasting wellness habits */}
                <motion.div
                  className="flex items-center py-[18px] px-[75px] rounded-[100px] bg-[rgba(169,211,255,0.20)]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-[32px] w-full">
                    <svg
                      className="w-[24px] h-[24px] flex-shrink-0"
                      viewBox="0 0 24 25"
                      fill="none"
                    >
                      <path
                        d="M16 7.86133H22V13.8613"
                        stroke="#007CFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M22 7.86133L13.5 16.3613L8.5 11.3613L2 17.8613"
                        stroke="#007CFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="text-[20px] font-normal font-inter text-black text-center flex-1">
                      Develop lasting wellness habits
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* CTA Button */}
              <motion.div
                className="flex justify-center lg:justify-start mt-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                viewport={{ once: true }}
              >
                <motion.button
                  onClick={() => navigate("/signup")}
                  className="flex items-center justify-center py-[16px] px-[24px] gap-[10px] rounded-[24px] bg-[#007CFF] hover:bg-[#0066CC] transition-colors shadow-[0px_2px_20px_0px_rgba(0,0,0,0.25)] w-[356px] h-[55px]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-[16px] font-bold font-inter text-white">
                    Try a Smart Check-In
                  </span>
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
