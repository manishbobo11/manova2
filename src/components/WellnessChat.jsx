import React, { useState, useEffect, useRef } from 'react';
import mcpService from '../services/mcp';
import { ContextStore } from '../services/firebase';
import { ChevronRight, Brain, Heart, DollarSign, Activity, User, CheckCircle, RotateCcw } from 'lucide-react';
import LanguageToggle from './LanguageToggle';

const WellnessChat = ({ userId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [userContext, setUserContext] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('Hinglish');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadUserContext();
    loadLanguagePreference();
  }, [userId]);

  const loadUserContext = async () => {
    const context = await ContextStore.getUserContext(userId);
    setUserContext(context);
  };

  const loadLanguagePreference = () => {
    if (userId) {
      const savedLanguage = localStorage.getItem(`manova_language_${userId}`);
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
      }
    }
  };

  const handleLanguageChange = async (newLanguage) => {
    setCurrentLanguage(newLanguage);
    
    // Update user context with new language preference
    try {
      await ContextStore.updateUserContext(userId, {
        languagePreference: newLanguage
      });
      console.log(`✅ Language preference updated to: ${newLanguage}`);
    } catch (error) {
      console.error('Error updating language preference:', error);
    }
  };


  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setIsTyping(true);

    // Add typing animation delay
    setTimeout(() => {
      setIsTyping(false);
    }, 1000);

    try {
      const response = await mcpService.generateResponse(userId, userMessage, currentLanguage);
      
      // Extract message from response object if needed
      const messageContent = typeof response === 'object' ? response.message || response.content || response : response;
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: messageContent,
        context: typeof response === 'object' ? response.context : null,
        sarthiEnhanced: typeof response === 'object' ? response.sarthiEnhanced : false
      }]);
      await loadUserContext(); // Refresh context after new message
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleClearContext = async () => {
    if (window.confirm('Are you sure you want to clear your wellness history? This cannot be undone.')) {
      await ContextStore.clearUserContext(userId);
      await loadUserContext();
      setMessages([]);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Wellness Assistant</h2>
        <div className="flex items-center space-x-2">
          <LanguageToggle
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
            userId={userId}
            className="mr-2"
          />
          <button
            onClick={() => setShowContext(!showContext)}
            className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
          >
            {showContext ? 'Hide Context' : 'Show Context'}
          </button>
          <button
            onClick={handleClearContext}
            className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
          >
            Clear History
          </button>
        </div>
      </div>

      {showContext && userContext && (
        <div className="mb-4 p-4 bg-neutral-50 rounded-lg">
          <h3 className="font-medium mb-2">Your Wellness Context</h3>
          <p>Recent Mood: {userContext.mood || 'Not recorded'}</p>
          <p>Stress Triggers: {userContext.stressTriggers?.join(', ') || 'None identified'}</p>
          <p>Coping Strategies: {userContext.copingStrategies?.join(', ') || 'None identified'}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-100 ml-auto'
                : 'bg-gray-100'
            } max-w-[80%]`}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="bg-gray-100 p-3 rounded-lg max-w-[80%]">
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white hover:bg-blue-700 font-medium transition px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default WellnessChat; 