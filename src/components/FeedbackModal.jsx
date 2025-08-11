import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const FeedbackModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      // Load the Typeform script dynamically only when modal is open
      const script = document.createElement("script");
      script.src = "//embed.typeform.com/next/embed.js";
      script.async = true;
      
      // Check if script is already loaded to avoid duplicates
      const existingScript = document.querySelector('script[src="//embed.typeform.com/next/embed.js"]');
      if (!existingScript) {
        document.body.appendChild(script);
      }
      
      return () => {
        // Clean up: remove script when modal closes
        if (!existingScript && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden relative"
            style={{ maxHeight: '90vh' }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with close button */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 text-white relative">
              <h2 className="text-xl font-bold">Share Your Feedback</h2>
              <p className="text-blue-100 text-sm mt-1">Help us make Manova better for everyone</p>
              
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                aria-label="Close feedback modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Typeform embed container */}
            <div className="p-6">
              <div 
                data-tf-live="01K2ADH7WT5XDPPGF0HNEPB7YS"
                style={{ minHeight: '500px' }}
                className="w-full"
              ></div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal;