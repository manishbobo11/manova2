import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  MailIcon, 
  MessageCircleIcon, 
  PhoneIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HelpCircleIcon,
  BookOpenIcon,
  UsersIcon,
  ShieldIcon
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

const SupportPage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  // Add CSS variables on component mount
  useEffect(() => {
    document.title = 'Manova | Support';
    const style = document.createElement("style");
    style.textContent = cssVars;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const contactMethods = [
    {
      icon: MailIcon,
      title: "Email Support",
      description: "Get help via email for non-urgent inquiries",
      contact: "support@manova.life",
      responseTime: "Within 24 hours"
    },
    {
      icon: MessageCircleIcon,
      title: "In-App Chat",
      description: "Real-time support through our in-app messaging",
      contact: "Available in your dashboard",
      responseTime: "Instant AI + Human backup"
    },
    {
      icon: PhoneIcon,
      title: "Crisis Hotline",
      description: "Immediate support for mental health emergencies",
      contact: "KIRAN Helpline 1800-599-0019 for mental health emergencies",
      responseTime: "24/7 immediate response"
    }
  ];

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "How do I get started with Manova?",
          answer: "Simply sign up for a free account, complete your first emotional check-in, and start chatting with Sarthi, your AI companion. The platform will personalize itself to your needs as you continue using it."
        },
        {
          question: "Is Manova free to use?",
          answer: "Manova offers a free tier that includes basic AI support and wellness tracking. Premium features like therapist consultations and advanced analytics are available through subscription plans."
        },
        {
          question: "Do I need to download an app?",
          answer: "Manova works directly in your web browser, so no download is required. We're also working on mobile apps for iOS and Android for an even better experience."
        }
      ]
    },
    {
      category: "Privacy & Security",
      questions: [
        {
          question: "How is my mental health data protected?",
          answer: "We use enterprise-grade encryption and follow India's DPDP 2023 data protection standards. Your data is never shared without your explicit consent, and you have full control over your information."
        },
        {
          question: "Can therapists see my AI conversations?",
          answer: "Only if you explicitly choose to share them. By default, your conversations with Sarthi AI remain private. You can selectively share insights with licensed therapists if you want professional guidance."
        },
        {
          question: "Can I delete my data?",
          answer: "Yes, you have complete control over your data. You can delete individual conversations, check-ins, or your entire account at any time from your settings page."
        }
      ]
    },
    {
      category: "Using Sarthi AI",
      questions: [
        {
          question: "How intelligent is Sarthi compared to a human therapist?",
          answer: "Sarthi is designed to provide emotional support and basic coping strategies, but it's not a replacement for professional therapy. For serious mental health concerns, we'll recommend connecting with licensed therapists."
        },
        {
          question: "What languages does Sarthi support?",
          answer: "Sarthi currently supports English, Hindi, and Hinglish (mixed Hindi-English). We're continuously adding support for more languages based on user demand."
        },
        {
          question: "Can Sarthi handle crisis situations?",
          answer: "Sarthi is trained to recognize crisis indicators and will immediately provide crisis resources and encourage you to seek professional help. It also connects you to crisis hotlines when needed."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          question: "What browsers are supported?",
          answer: "Manova works best on modern browsers including Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience."
        },
        {
          question: "I'm having trouble with my account. What should I do?",
          answer: "Try refreshing your browser first. If issues persist, contact our support team at support@manova.life with details about the problem you're experiencing."
        },
        {
          question: "How do I update my preferences?",
          answer: "Go to your Settings page from the dashboard menu. You can update your language preferences, notification settings, and privacy controls from there."
        }
      ]
    }
  ];

  const toggleFaq = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenFaq(openFaq === key ? null : key);
  };

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
            <span className="text-black">We're Here to </span>
            <span className="text-[#007CFF]">Help</span>
          </h1>
          <p className="text-[20px] font-normal font-inter text-black leading-[32px] w-full max-w-[704px] mx-auto text-balance">
            Need help? Email us at <a href="mailto:support@manova.life" className="text-[#007CFF] hover:underline font-bold">support@manova.life</a> or connect via in-app chat.
          </p>
        </motion.div>

        {/* Contact Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-[48px] font-bold font-inter leading-normal mb-6">
              <span className="text-black">Get </span>
              <span className="text-[#007CFF]">Support</span>
            </h2>
            <p className="text-[20px] font-normal font-inter text-black leading-[32px]">Choose the best way to reach us based on your needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-[#007CFF] rounded-lg flex items-center justify-center mb-6">
                  <method.icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-[20px] font-bold font-inter text-black mb-3">{method.title}</h3>
                
                <p className="text-[16px] font-normal font-inter text-black mb-4">{method.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-[14px] font-normal font-inter text-black">
                    <span className="font-bold mr-2">Contact:</span>
                    <span className="text-[#007CFF] font-bold">{method.contact}</span>
                  </div>
                  <div className="flex items-center text-[14px] font-normal font-inter text-black">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    <span>{method.responseTime}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-[48px] font-bold font-inter leading-normal mb-6">
              <span className="text-black">Frequently Asked </span>
              <span className="text-[#007CFF]">Questions</span>
            </h2>
            <p className="text-[20px] font-normal font-inter text-black leading-[32px]">Find answers to common questions about Manova</p>
          </div>

          {faqs.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 + categoryIndex * 0.1 }}
              className="mb-8"
            >
              <h3 className="text-[24px] font-bold font-inter text-black mb-4 flex items-center">
                <HelpCircleIcon className="w-5 h-5 mr-3 text-[#007CFF]" />
                {category.category}
              </h3>
              
              <div className="space-y-3">
                {category.questions.map((faq, questionIndex) => {
                  const isOpen = openFaq === `${categoryIndex}-${questionIndex}`;
                  
                  return (
                    <div
                      key={questionIndex}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFaq(categoryIndex, questionIndex)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-bold font-inter text-black pr-4">
                          {faq.question}
                        </span>
                        {isOpen ? (
                          <ChevronUpIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronDownIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="px-6 pb-4 text-[16px] font-normal font-inter text-black leading-relaxed">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-[48px] font-bold font-inter leading-normal mb-6">
              <span className="text-black">Additional </span>
              <span className="text-[#007CFF]">Resources</span>
            </h2>
            <p className="text-[20px] font-normal font-inter text-black leading-[32px]">More ways to get help and stay informed</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-300"
            >
              <BookOpenIcon className="w-12 h-12 text-[#007CFF] mx-auto mb-4" />
              <h3 className="text-[20px] font-bold font-inter text-black mb-3">User Guide</h3>
              <p className="text-[16px] font-normal font-inter text-black mb-4">
                Comprehensive guides on using all Manova features
              </p>
              <button className="text-[#007CFF] hover:underline font-bold font-inter">
                View Documentation
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-300"
            >
              <UsersIcon className="w-12 h-12 text-[#007CFF] mx-auto mb-4" />
              <h3 className="text-[20px] font-bold font-inter text-black mb-3">Community Forum</h3>
              <p className="text-[16px] font-normal font-inter text-black mb-4">
                Connect with other users and share experiences
              </p>
              <button 
                className="text-[#007CFF] hover:underline font-bold font-inter"
                onClick={() => window.location.href = '/community'}
              >
                Join Community
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.3 }}
              className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-300"
            >
              <ShieldIcon className="w-12 h-12 text-[#007CFF] mx-auto mb-4" />
              <h3 className="text-[20px] font-bold font-inter text-black mb-3">Privacy Policy</h3>
              <p className="text-[16px] font-normal font-inter text-black mb-4">
                Learn how we protect your privacy and data
              </p>
              <button className="text-[#007CFF] hover:underline font-bold font-inter">
                Read Policy
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="text-center"
        >
          <div className="bg-[#007CFF] rounded-[24px] p-12 text-white text-center">
            <h2 className="text-[48px] font-bold font-inter leading-normal mb-6">
              <span className="text-white">Still Need </span>
              <span className="text-white">Help?</span>
            </h2>
            <p className="text-[20px] font-normal font-inter text-white leading-[32px] mb-8 opacity-90 max-w-[704px] mx-auto">
              Our support team is here to assist you with any questions or concerns.
            </p>
            <motion.button
              onClick={() => window.location.href = 'mailto:support@manova.life'}
              className="flex py-[16px] px-[24px] justify-center items-center gap-[10px] rounded-[24px] bg-white hover:bg-gray-50 transition-colors shadow-[0px_1px_18px_0px_rgba(0,0,0,0.40)] mx-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-[16px] font-bold font-inter text-[#007CFF]">
                Contact Support
              </span>
            </motion.button>
          </div>
        </motion.div>
        </div>
      </div>
  );
};

export default SupportPage;