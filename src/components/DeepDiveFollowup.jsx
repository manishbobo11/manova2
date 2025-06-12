import React, { useState, useEffect } from 'react';
import { ChevronRight, Loader2, Heart, Brain, AlertCircle, ThumbsUp, MessageCircle, SkipForward } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveDeepDiveInsight } from '../services/firebase';
import mcpService from '../services/mcp';
import { toFirestoreSafe } from '../utils/firestoreSafe';
import { getAuth } from 'firebase/auth';

const getEmotionColor = (emotion) => {
  const emotionMap = {
    frustration: 'bg-orange-100 text-orange-700 border-orange-200',
    anxiety: 'bg-red-100 text-red-700 border-red-200',
    sadness: 'bg-blue-100 text-blue-700 border-blue-200',
    stress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    overwhelm: 'bg-purple-100 text-purple-700 border-purple-200',
    default: 'bg-indigo-100 text-indigo-700 border-indigo-200'
  };
  return emotionMap[emotion?.toLowerCase()] || emotionMap.default;
};

const getEmotionIcon = (emotion) => {
  const emotionMap = {
    frustration: AlertCircle,
    anxiety: AlertCircle,
    sadness: Heart,
    stress: Brain,
    overwhelm: Brain,
    default: Heart
  };
  return emotionMap[emotion?.toLowerCase()] || emotionMap.default;
};

const sanitizeData = (data) => JSON.parse(JSON.stringify(data));

const DeepDiveFollowup = ({ domainName, onSave, userId: propUserId = "demo-user-123", isLoading = false, deepDiveData }) => {
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [customReason, setCustomReason] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisFeedback, setAnalysisFeedback] = useState('');
  const [typingDots, setTypingDots] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  // Use userId from prop, or fallback to Firebase Auth if available
  let userId = propUserId;
  if (!userId || userId === 'demo-user-123') {
    try {
      const auth = getAuth();
      const firebaseUserId = auth.currentUser?.uid;
      if (firebaseUserId) {
        userId = firebaseUserId;
      }
    } catch (e) {
      // Firebase Auth not available or not initialized
    }
  }

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setTypingDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  const toggleReason = (reason) => {
    setSelectedReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  };

  const handleSubmit = async () => {
    setValidationError('');

    // Step 2: Check for userId before saving
    if (!userId || !domainName) {
      console.error('No userId found in DeepDiveFollowup. userId:', userId, 'domainName:', domainName);
      setValidationError('Session error. Please refresh the page and try again.');
      return;
    }

    if (selectedReasons.length === 0) {
      setValidationError('Please select at least one reason before continuing.');
      return;
    }

    const allReasons = [...selectedReasons];
    if (customReason.trim()) {
      allReasons.push(customReason.trim());
    }

    setIsAnalyzing(true);
    setAnalysisFeedback('Analyzing your response');

    // Step 3: Log userId before saving
    console.log('Saving deep dive insight for userId:', userId);

    try {
      // Get AI summary of the user's input
      const summaryPrompt = `You're an AI therapist inside a corporate wellness product called Manova.

The user has reported stress in the domain: ${domainName}

Their selected reasons: ${selectedReasons.join(', ')}

Additional context they added: ${customReason}

Root emotional tone (if available): ${deepDiveData?.rootEmotion || 'not detected'}

---

Your job is to respond like a licensed psychologist who:
1. Understands their context deeply (Module Context Protocol)
2. Provides validation (empathetic, warm)
3. Shares 3 personalised and realistic next steps — NOT generic like "do meditation"
4. Language should sound **human, warm, not robotic**

FORMAT:
- Empathic paragraph (1-2 lines max)
- 3 actionable advice, adapted to their domain & stress type
- Wrap-up sentence inviting them to continue or talk to AI assistant
`;

      const summaryResponse = await mcpService.generateResponse(userId, summaryPrompt);
      const summaryContent = summaryResponse?.choices?.[0]?.message?.content || summaryResponse;
      setAiSummary(summaryContent);

      const submission = {
        userId,
        domain: domainName,
        reasons: allReasons,
        customReason: customReason || null,
        aiSummary: typeof summaryContent === 'string' ? summaryContent : JSON.stringify(summaryContent),
        timestamp: new Date().toISOString()
      };

      // Use sanitizeData before saving
      await saveDeepDiveInsight(userId, domainName, sanitizeData(submission));

      // Call parent onSave without continuing
      await onSave({ continue: false, data: submission });
      
      setAnalysisFeedback('Thank you for sharing. Your insights have been saved.');
      setIsComplete(true);
      setIsAnalyzing(false);
    } catch (error) {
      console.error('Error saving deep dive:', error);
      setAnalysisFeedback('There was an error saving your response. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const handleContinue = async () => {
    if (!userId || !domainName || selectedReasons.length === 0) {
      setValidationError('Please select at least one reason before continuing.');
      return;
    }

    const finalInsights = {
      userId,
      domain: domainName,
      reasons: selectedReasons,
      customReason: customReason?.trim() || null,
      aiSummary: aiSummary || null,
      timestamp: new Date().toISOString()
    };

    try {
      console.log("handleContinue finalInsights:", finalInsights);
      await saveDeepDiveInsight(userId, domainName, sanitizeData(finalInsights));
      await onSave({
        userId,
        domain: domainName,
        reasons: selectedReasons,
        customReason: customReason || null,
        aiSummary: aiSummary || null,
        timestamp: new Date().toISOString(),
        continue: true
      });
    } catch (error) {
      console.error('Error saving deep dive insights:', error);
      setValidationError('Failed to save your insights. Please try again.');
    }
  };

  const renderEmotionIcon = (emotion) => {
    const Icon = getEmotionIcon(emotion);
    return Icon ? <Icon className="w-4 h-4 mr-1" /> : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 sm:px-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-semibold text-white">
                Deep-Dive: {domainName}
              </h2>
              {deepDiveData?.rootEmotion && (
                <motion.span
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm"
                >
                  {renderEmotionIcon(deepDiveData.rootEmotion)}
                  <span>{deepDiveData.rootEmotion}</span>
                </motion.span>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 sm:p-8">
            {/* Left Column - Input Section */}
            <div className="space-y-6">
              {/* Checkboxes */}
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  What's contributing to your stress?
                </h3>
                <div className="space-y-3">
                  {deepDiveData?.checkboxes?.map((reason, index) => (
                    <motion.label
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedReasons.includes(reason)}
                onChange={() => toggleReason(reason)}
                        className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-3 text-gray-700 group-hover:text-indigo-900">
                        {reason}
                      </span>
                    </motion.label>
                  ))}
                </div>
        </div>

              {/* Textarea */}
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <label htmlFor="customReason" className="block text-sm font-medium text-gray-700 mb-2">
                  Anything else you'd like to share?
                </label>
          <textarea
                  id="customReason"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Share your thoughts here..."
                  className="w-full h-32 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
        </div>

              {/* Submit Button */}
              {!isAnalyzing && !aiSummary && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
                  disabled={isLoading || selectedReasons.length === 0}
                  className={`w-full py-3 px-6 rounded-xl font-semibold text-white flex items-center justify-center ${
                    isLoading || selectedReasons.length === 0
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </motion.button>
              )}
            </div>

            {/* Right Column - AI Response */}
            {aiSummary && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  {/* Empathic Acknowledgment */}
                  <div className="mb-6">
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {aiSummary.split('\n')[0]}
                    </p>
                  </div>

                  {/* Actionable Steps */}
                  <div className="bg-indigo-50 rounded-lg p-5">
                    <h4 className="text-indigo-900 font-medium text-lg mb-4">
                      Here's how you can handle this situation:
                    </h4>
                    <ul className="space-y-3">
                      {aiSummary.split('\n').slice(1).filter(line => line.trim()).map((step, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start"
                        >
                          <span className="text-indigo-600 mr-3 mt-1">•</span>
                          <span className="text-indigo-700">{step.trim()}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Interactive Buttons */}
                  <div className="flex flex-col space-y-3 mt-6">
                    <button
                      onClick={handleContinue}
                      className="flex items-center justify-center w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 mr-2" />
                      Continue to Next Section
                    </button>

                    <button
                      onClick={() => {
                        setAnalysisFeedback('Connecting you with the AI Assistant...');
                        // Add your AI chat logic here
                      }}
                      className="flex items-center justify-center w-full py-3 px-4 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      I want to talk to the AI Assistant
        </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Loading State */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="col-span-1 lg:col-span-2 text-center py-8"
                >
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
                  <p className="text-indigo-600 text-lg">
                    {analysisFeedback}
                    <span className="inline-block w-4">{typingDots}</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DeepDiveFollowup;
