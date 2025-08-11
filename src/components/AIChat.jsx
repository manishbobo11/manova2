import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Brain, AlertTriangle, Heart, MessageCircle, Bot } from 'lucide-react';
import { enhancedAIConversationalAgent, detectCrisisIntervention } from '../services/ai/conversationalAgent';
import { useAuth } from '../contexts/AuthContext';

const AIChat = ({ userId }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [crisisDetected, setCrisisDetected] = useState(false);
  const messagesEndRef = useRef(null);

  const getUserDisplayName = useMemo(() => {
    if (currentUser?.displayName) {
      return currentUser.displayName.split(' ')[0];
    }
    if (currentUser?.email) {
      const emailName = currentUser.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'friend';
  }, [currentUser?.displayName, currentUser?.email]);

  useEffect(() => {
    // Initial greeting message with user's name
    const userName = getUserDisplayName;
    setMessages([
      {
        id: 1,
        type: 'ai',
        content: `Hi ${userName}! 😊 How are you doing today? I'm Sarthi, your emotionally intelligent wellness companion. I'm here to listen, support, and guide you through your journey like a calm, understanding friend.`,
        timestamp: new Date(),
        emotion: 'supportive'
      }
    ]);
  }, [getUserDisplayName]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Check for crisis intervention
      const conversationHistory = [...messages, userMessage].map(msg => msg.content);
      const needsCrisisIntervention = detectCrisisIntervention(conversationHistory);
      setCrisisDetected(needsCrisisIntervention);

      // Generate AI response
      const aiResponse = await enhancedAIConversationalAgent(
        conversationHistory,
        { userId, crisisDetected: needsCrisisIntervention }
      );

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        emotion: needsCrisisIntervention ? 'concerned' : 'supportive',
        crisisResponse: needsCrisisIntervention
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm having trouble connecting right now, but I'm still here for you. Can you tell me more about how you're feeling?",
        timestamp: new Date(),
        emotion: 'supportive'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, isLoading, messages, userId, crisisDetected]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const MessageBubble = React.memo(({ message }) => {
    const isUser = message.type === 'user';
    const isAI = message.type === 'ai';

    return (
      <motion.div
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={`flex items-start space-x-3 max-w-[80%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {!isUser && (
            <div className={`p-2 rounded-full ${message.crisisResponse ? 'bg-red-100' : 'bg-indigo-100'}`}>
              {message.crisisResponse ? (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              ) : (
                <Bot className="h-5 w-5 text-indigo-600" />
              )}
            </div>
          )}
          
          <div
            className={`px-4 py-3 rounded-lg ${
              isUser
                ? 'bg-indigo-600 text-white'
                : message.crisisResponse
                ? 'bg-red-50 border border-red-200 text-red-900'
                : 'bg-white border border-gray-200 text-gray-900'
            } shadow-sm`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            <p className={`text-xs mt-2 ${isUser ? 'text-indigo-100' : 'text-gray-500'}`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {isUser && (
            <div className="p-2 rounded-full bg-gray-100">
              <MessageCircle className="h-5 w-5 text-gray-600" />
            </div>
          )}
        </div>
      </motion.div>
    );
  });

  const CrisisAlert = () => (
    <motion.div
      className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
        <div>
          <h3 className="font-semibold text-red-900 mb-2">Crisis Support Available</h3>
          <p className="text-red-800 text-sm mb-3">
            I'm concerned about what you've shared. If you're having thoughts of self-harm, please reach out for immediate help:
          </p>
          <div className="space-y-2 text-sm">
            <div className="text-red-800">
              <strong>KIRAN Mental Health Helpline:</strong> 1800-599-0019
            </div>
            <div className="text-red-800">
              <strong>Vandrevala Foundation:</strong> +91 9999 666 555
            </div>
            <div className="text-red-800">
              <strong>Emergency:</strong> Consult nearby hospital or call national helpline
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-indigo-100">
            <Brain className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Sarthi – Your Emotional Wellness Companion</h2>
            <p className="text-sm text-gray-600">Your calm, understanding friend</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm text-gray-600">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {crisisDetected && <CrisisAlert />}
        </AnimatePresence>
        
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isLoading && (
          <motion.div
            className="flex justify-start mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-full bg-indigo-100">
                <Bot className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              rows="2"
              disabled={isLoading}
            />
          </div>
          <motion.button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className={`p-3 rounded-lg transition-colors ${
              inputMessage.trim() && !isLoading
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            whileHover={inputMessage.trim() && !isLoading ? { scale: 1.05 } : {}}
            whileTap={inputMessage.trim() && !isLoading ? { scale: 0.95 } : {}}
          >
            <Send className="h-5 w-5" />
          </motion.button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          This AI assistant is for support and guidance. In case of emergency, consult a nearby hospital or dial KIRAN Helpline 1800-599-0019.
        </p>
      </div>
    </div>
  );
};

export default AIChat;
