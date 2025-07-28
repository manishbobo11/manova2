import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ClipboardListIcon, 
  BrainCircuitIcon, 
  LightbulbIcon, 
  TrendingUpIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  MessageCircleIcon,
  UserIcon,
  SparklesIcon
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

const HowItWorksPage = () => {
  // Add CSS variables on component mount
  useEffect(() => {
    document.title = 'Manova | How It Works';
    const style = document.createElement("style");
    style.textContent = cssVars;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  
  const steps = [
    {
      number: "01",
      title: "Start Check-ins",
      description: "Begin your wellness journey with personalized emotional check-ins that help us understand your current state of mind.",
      icon: ClipboardListIcon,
      features: [
        "Quick 2-3 minute emotional assessments",
        "Personalized questions based on your history",
        "Safe, private space to express yourself",
        "Track your mood patterns over time"
      ]
    },
    {
      number: "02",
      title: "Get Analyzed by Sarthi AI",
      description: "Our advanced AI companion Sarthi analyzes your responses with empathy and intelligence to understand your emotional patterns.",
      icon: BrainCircuitIcon,
      features: [
        "AI-powered emotional intelligence analysis",
        "Personalized insights based on your unique patterns",
        "Empathetic conversations in your preferred language",
        "Deep understanding of your emotional triggers"
      ]
    },
    {
      number: "03",
      title: "Receive Coping Strategies & Therapist Support",
      description: "Get personalized coping strategies and connect with professional therapists when you need deeper support.",
      icon: LightbulbIcon,
      features: [
        "Personalized wellness recommendations",
        "Evidence-based coping strategies",
        "Access to licensed mental health professionals",
        "Crisis intervention when needed"
      ]
    },
    {
      number: "04",
      title: "Track Your Emotional Growth",
      description: "Monitor your progress over time with detailed analytics and celebrate your emotional growth milestones.",
      icon: TrendingUpIcon,
      features: [
        "Visual progress tracking and analytics",
        "Milestone celebrations and achievements",
        "Long-term emotional pattern insights",
        "Continuous improvement recommendations"
      ]
    }
  ];

  const additionalFeatures = [
    {
      icon: MessageCircleIcon,
      title: "24/7 AI Support",
      description: "Sarthi is always available for emotional support and guidance, whenever you need it."
    },
    {
      icon: UserIcon,
      title: "Anonymous Community",
      description: "Connect with others in a safe, supportive environment while maintaining your privacy."
    },
    {
      icon: SparklesIcon,
      title: "Personalized Experience",
      description: "Every interaction adapts to your unique emotional needs and communication style."
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
            <span className="text-black">How </span>
            <span className="text-[#007CFF]">Manova</span>
            <span className="text-black"> Works</span>
          </h1>
          <p className="text-[20px] font-normal font-inter text-black leading-[32px] w-full max-w-[704px] mx-auto text-balance">
            Your journey to better mental wellness in four simple steps
          </p>
        </motion.div>

        {/* Main Flow Section */}
        <div className="mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="mb-12 last:mb-0"
            >
              <div className={`grid lg:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                {/* Content */}
                <div className={`${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-lg bg-[#007CFF] flex items-center justify-center text-white font-bold text-lg mr-4">
                      {step.number}
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-[#007CFF] flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-[32px] font-bold font-inter text-black mb-4">{step.title}</h3>
                  
                  <p className="text-[18px] font-normal font-inter text-black leading-relaxed mb-6">
                    {step.description}
                  </p>
                  
                  <div className="space-y-3">
                    {step.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 mr-3 text-[#007CFF]" />
                        <span className="text-[16px] font-normal font-inter text-black">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual */}
                <div className={`${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                  <div className="bg-[#007CFF] rounded-lg p-8 text-white text-center">
                    <step.icon className="w-16 h-16 mx-auto mb-4 opacity-90" />
                    <div className="text-4xl font-bold opacity-20 mb-4">
                      {step.number}
                    </div>
                    <h4 className="text-xl font-bold font-inter">{step.title}</h4>
                  </div>
                </div>
              </div>

              {/* Arrow connector (except for last item) */}
              {index < steps.length - 1 && (
                <div className="flex justify-center my-8">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.2 }}
                    className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
                  >
                    <ArrowRightIcon className="w-4 h-4 text-gray-600 rotate-90 lg:rotate-0" />
                  </motion.div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Additional Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-[48px] font-bold font-inter leading-normal mb-6">
              <span className="text-black">What Makes </span>
              <span className="text-[#007CFF]">Manova</span>
              <span className="text-black"> Special</span>
            </h2>
            <p className="text-[20px] font-normal font-inter text-black leading-[32px]">Additional features that enhance your wellness journey</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-[#007CFF] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[20px] font-bold font-inter text-black mb-3">{feature.title}</h3>
                <p className="text-[16px] font-normal font-inter text-black leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center"
        >
          <div className="bg-[#007CFF] rounded-[24px] p-12 text-white text-center">
            <h2 className="text-[48px] font-bold font-inter leading-normal mb-6">
              <span className="text-white">Ready to Start Your Wellness </span>
              <span className="text-white">Journey?</span>
            </h2>
            <p className="text-[20px] font-normal font-inter text-white leading-[32px] mb-8 opacity-90 max-w-[704px] mx-auto">
              Take the first step towards better mental health with personalized AI support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => window.location.href = '/signup'}
                className="flex py-[16px] px-[24px] justify-center items-center gap-[10px] rounded-[24px] bg-white hover:bg-gray-50 transition-colors shadow-[0px_1px_18px_0px_rgba(0,0,0,0.40)]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-[16px] font-bold font-inter text-[#007CFF]">
                  Get Started Free
                </span>
              </motion.button>
              <motion.button
                onClick={() => window.location.href = '/survey'}
                className="flex py-[16px] px-[24px] justify-center items-center gap-[10px] rounded-[24px] border-2 border-white text-white hover:bg-white hover:text-[#007CFF] transition-colors duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-[16px] font-bold font-inter">
                  Try a Check-in
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>
        </div>
      </div>
  );
};

export default HowItWorksPage;