import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Brain, AlertTriangle, MessageCircle, Globe, Heart, Plus } from 'lucide-react';
import { useChatSession } from '../contexts/ChatSessionContext';
import { getUserSettings, updateUserSettings } from '../services/firebase/userSettings';
import { useAuth } from '../contexts/AuthContext';
import PreviousChatsDropdown from './PreviousChatsDropdown';
import ChatInput from './ChatInput';

const SarthiChatbot = ({ userId, resumeSessionId, onSessionLoaded }) => {
  // Get current authenticated user for name extraction
  const { currentUser } = useAuth();
  
  // Extract user's display name with fallback logic
  const userDisplayName = useMemo(() => {
    if (currentUser?.displayName) {
      return currentUser.displayName.split(' ')[0]; // First name only
    }
    if (currentUser?.email) {
      const emailName = currentUser.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'friend'; // Final fallback
  }, [currentUser?.displayName, currentUser?.email]);

  // Chat session state from context
  const {
    messages,
    currentSessionId,
    isLoading,
    isTyping,
    language,
    error,
    createNewSession,
    loadSession,
    sendMessage,
    changeLanguage,
    clearSession
  } = useChatSession();

  // Local UI state
  const [crisisDetected, setCrisisDetected] = useState(false);
  const [userSettings, setUserSettings] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [sessionGreeted, setSessionGreeted] = useState(new Set());
  
  // Single scroll reference for the entire chat container
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const hasScrolledRef = useRef(false);

  // Language options
  const languages = ['English', 'Hindi', 'Hinglish'];

  // Deduplicate messages with improved performance
  const uniqueMessages = useMemo(() => {
    if (!Array.isArray(messages) || messages.length === 0) return [];
    
    const seen = new Set();
    const filtered = [];
    
    for (const message of messages) {
      if (message && message.id && !seen.has(message.id)) {
        seen.add(message.id);
        filtered.push(message);
      }
    }
    
    return filtered;
  }, [messages]);

  // Initialize chatbot with improved error handling and prevention of double-init
  const initializeChatbot = useCallback(async () => {
    try {
      if (isInitialized || !userId) return;
      
      console.log('🚀 Initializing chatbot for user:', userId);
      
      // Load user settings and language preference
      let currentLanguage = 'English';
      try {
        const settings = await getUserSettings(userId);
        setUserSettings(settings);
        currentLanguage = settings.preferredLanguage || 'English';
      } catch (settingsError) {
        console.warn('Failed to load user settings:', settingsError);
      }

      // Try to load existing session first, or create new one
      const result = await loadSession(null);
      
      if (result.success) {
        console.log('✅ Chat session initialized:', result.sessionId);
        
        // Mark this session as already greeted if it has messages
        if (uniqueMessages.length > 0) {
          setSessionGreeted(prev => new Set([...prev, result.sessionId]));
        }
        
        // Update language if different from user settings
        if (language !== currentLanguage) {
          await changeLanguage(currentLanguage);
        }
        
        setIsInitialized(true);
      } else {
        console.error('❌ Failed to initialize chat session:', result.error);
        // Fallback: create new session - greeting will be handled by context
        await createNewSession(currentLanguage, false);
        setIsInitialized(true);
      }
      
    } catch (error) {
      console.error('Error initializing chatbot:', error);
      setIsInitialized(true);
    }
  }, [isInitialized, userId, loadSession, createNewSession, changeLanguage, language, uniqueMessages.length]);

  // Initialize chat session on mount with tab visibility handling
  useEffect(() => {
    initializeChatbot();
    
    // Handle tab visibility changes to prevent chat loss
    const handleVisibilityChange = () => {
      if (!document.hidden && currentSessionId) {
        console.log('👀 Tab became visible, ensuring session is active');
        // Optionally refresh session status here
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup on unmount
    return () => {
      console.log('🧹 SarthiChatbot cleanup');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId, currentSessionId]);

  // Handle resuming a specific session
  useEffect(() => {
    if (resumeSessionId && resumeSessionId !== currentSessionId) {
      console.log('🔄 Resuming specific session:', resumeSessionId);
      loadSession(resumeSessionId).then((result) => {
        if (result.success && onSessionLoaded) {
          onSessionLoaded();
        }
      });
    }
  }, [resumeSessionId, currentSessionId, loadSession, onSessionLoaded]);

  // Single scroll effect - no double scrolling
  useEffect(() => {
    if (uniqueMessages.length > 0 && messagesEndRef.current && !hasScrolledRef.current) {
      hasScrolledRef.current = true;
      
      // Small delay to ensure DOM is updated
      const scrollTimer = setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'end',
            inline: 'nearest'
          });
        }
        hasScrolledRef.current = false;
      }, 50);

      return () => clearTimeout(scrollTimer);
    }
  }, [uniqueMessages.length]);

  // Detect crisis keywords in messages
  useEffect(() => {
    const lastMessage = uniqueMessages[uniqueMessages.length - 1];
    if (lastMessage && lastMessage.type === 'ai' && lastMessage.crisisResponse) {
      setCrisisDetected(true);
    } else {
      setCrisisDetected(false);
    }
  }, [uniqueMessages]);

  // Track session greetings to prevent duplicates
  useEffect(() => {
    if (currentSessionId && !sessionGreeted.has(currentSessionId)) {
      console.log('🎯 New session detected, greeting will be handled by context');
      // Mark as greeted to prevent duplicate welcome logic
      setSessionGreeted(prev => new Set([...prev, currentSessionId]));
    }
  }, [currentSessionId, sessionGreeted]);

  // Memoized MessageList component to prevent unnecessary re-renders
  const MessageList = memo(({ 
    messages, 
    crisisDetected, 
    error, 
    isLoading, 
    isTyping,
    messagesEndRef 
  }) => {
    // Memoize the message list with stable keys
    const messageElements = useMemo(() => {
      if (!Array.isArray(messages)) return [];
      
      return messages.map((message) => {
        // Use message ID as stable key (no fallback to prevent instability)
        if (!message.id) {
          console.warn('Message missing ID:', message);
          return null;
        }
        
        return (
          <MessageBubble 
            key={message.id}
            message={message}
          />
        );
      }).filter(Boolean); // Remove null entries
    }, [messages]);

    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {/* Crisis alert outside of AnimatePresence to prevent re-mounting */}
        {crisisDetected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <CrisisAlert />
          </motion.div>
        )}
        
        {/* Error display */}
        {error && (
          <motion.div
            className="p-4 bg-red-50 border border-red-200 rounded-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 font-medium">Connection Error</span>
            </div>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </motion.div>
        )}
        
        {/* Messages without AnimatePresence to prevent flickering */}
        <div className="space-y-4">
          {messageElements}
        </div>
        
        {/* Typing indicator */}
        {(isLoading || isTyping) && (
          <div aria-live="polite">
            <TypingIndicator />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    );
  }, (prevProps, nextProps) => {
    // Only re-render if messages array length or key props change
    if (prevProps.messages.length !== nextProps.messages.length) return false;
    if (prevProps.crisisDetected !== nextProps.crisisDetected) return false;
    if (prevProps.error !== nextProps.error) return false;
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.isTyping !== nextProps.isTyping) return false;
    
    // Check if the actual message IDs changed (more precise than array reference)
    const prevIds = prevProps.messages.map(m => m.id).join(',');
    const nextIds = nextProps.messages.map(m => m.id).join(',');
    
    return prevIds === nextIds;
  });

  MessageList.displayName = 'MessageList';

  const MessageBubble = memo(({ message }) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';

    if (isSystem) {
      return (
        <div className="flex justify-center mb-4">
          <div className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
            {message.content}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex items-start space-x-3 max-w-[78%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {!isUser && (
            <div className={`p-2 rounded-full ${message.crisisResponse ? 'bg-red-100' : 'bg-blue-100'}`}>
              {message.crisisResponse ? (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              ) : (
                <Heart className="h-5 w-5 text-blue-600" />
              )}
            </div>
          )}
          
          <div className={`px-4 py-3 rounded-2xl ${
              isUser
                ? 'bg-blue-100 text-blue-900 shadow-sm font-medium'
                : message.crisisResponse
                ? 'bg-red-50 border border-red-200 text-red-900'
                : 'bg-gray-100 text-gray-800'
            }`}>
            <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ wordBreak: 'break-word' }}>
              {message.content}
            </p>
            
            {/* V2 UPGRADE: Display therapy suggestions */}
            {!isUser && message.suggestions && message.suggestions.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <Brain className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm font-semibold text-blue-800">Gentle Suggestions</span>
                </div>
                <ul className="space-y-1">
                  {message.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-blue-700 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* V2 UPGRADE: Display journal prompt */}
            {!isUser && message.journalPrompt && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <Heart className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm font-semibold text-green-800">Journal Reflection</span>
                </div>
                <p className="text-sm text-green-700 italic">
                  "{message.journalPrompt}"
                </p>
              </div>
            )}
            
            <p className={`text-xs mt-2 ${isUser ? 'text-white/80' : 'text-slate-400'}`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {isUser && (
            <div className="p-2 rounded-full bg-blue-100">
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </div>
          )}
        </div>
      </div>
    );
  });

  MessageBubble.displayName = 'MessageBubble';

  function CrisisAlert() {
    return (
    <motion.div
      className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
        <div>
          <h3 className="font-bold text-red-900 mb-2 text-lg">Crisis Support Available</h3>
          <p className="text-red-800 text-base font-medium mb-3">
            I'm concerned about what you've shared. If you're having thoughts of self-harm, please reach out for immediate help:
          </p>
          <div className="space-y-2 text-base font-medium">
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
  }

  function LanguageToggle() {
    return (
    <div className="flex items-center space-x-2">
      <Globe className="h-4 w-4 text-gray-600" />
      <select
        value={language}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="text-base font-medium border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isLoading}
      >
        {languages.map(lang => (
          <option key={lang} value={lang}>{lang}</option>
        ))}
      </select>
    </div>
    );
  }

  function NewChatButton() {
    return (
    <motion.button
      onClick={handleNewChat}
      disabled={isLoading}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        isLoading
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-green-100 text-green-700 hover:bg-green-200'
      }`}
      whileHover={!isLoading ? { scale: 1.02 } : {}}
      whileTap={!isLoading ? { scale: 0.98 } : {}}
    >
      <Plus className="h-4 w-4" />
      <span>New Chat</span>
    </motion.button>
    );
  }

  function SessionInfo() {
    return (
    <div className="flex items-center space-x-2 text-sm text-gray-600">
      <MessageCircle className="h-4 w-4" />
      <span>Session: {currentSessionId ? currentSessionId.slice(-8) : 'Loading...'}</span>
    </div>
    );
  }

  const TypingIndicator = memo(() => {
    return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-full bg-blue-100">
          <Heart className="h-5 w-5 text-blue-600" />
        </div>
        <div className="bg-white border border-gray-300 rounded-lg px-4 py-3 shadow-sm">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <span className="ml-2 text-sm text-gray-500 font-medium">Sarthi is thinking...</span>
          </div>
        </div>
      </div>
    </div>
    );
  });

  TypingIndicator.displayName = 'TypingIndicator';

  // Handle message sending with the new ChatInput component
  const handleSendMessage = useCallback(async (messageText) => {
    try {
      const result = await sendMessage(messageText);
      
      if (result.success) {
        console.log('✅ Message sent successfully');
        
        // Handle language switch notifications
        if (result.shouldSwitchLanguage && result.switchedLanguage) {
          const langDisplay = result.switchedLanguage === 'English' ? 'English' 
            : result.switchedLanguage === 'Hindi' ? 'हिंदी' 
            : 'Hinglish';
          
          // Show a toast notification (if available)
          if (typeof window !== 'undefined' && window.postMessage) {
            window.postMessage({
              type: 'LANGUAGE_SWITCHED',
              language: result.switchedLanguage,
              message: `Language switched to ${langDisplay}`
            }, '*');
          }
          
          console.log(`🌐 Language switched to ${result.switchedLanguage}`);
        }
      } else {
        console.error('❌ Failed to send message:', result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error; // Re-throw so ChatInput can handle it
    }
  }, [sendMessage]);

  // Handle starting new chat session
  const handleNewChat = useCallback(async () => {
    try {
      console.log('🆕 Starting new chat session...');
      
      // Clear current session first (now async)
      await clearSession();
      setSessionGreeted(new Set()); // Clear greeting tracking for new chat
      
      const result = await createNewSession(language, false); // Always allow welcome for new chat
      if (result.success) {
        console.log('🆕 New chat session created:', result.sessionId);
      } else {
        console.error('❌ Failed to create new chat:', result.error);
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  }, [clearSession, createNewSession, language]);

  // Handle selecting previous chat session
  const handleSessionSelect = useCallback(async (sessionId) => {
    try {
      console.log('🔄 Loading previous session:', sessionId);
      
      // Clear current session first (now async)
      await clearSession();
      setSessionGreeted(prev => new Set([...prev, sessionId])); // Mark as already greeted
      
      const result = await loadSession(sessionId);
      if (result.success) {
        console.log('✅ Previous session loaded:', sessionId);
        if (onSessionLoaded) {
          onSessionLoaded();
        }
      } else {
        console.error('❌ Failed to load session:', result.error);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  }, [clearSession, loadSession, onSessionLoaded]);

  // Handle language change
  const handleLanguageChange = useCallback(async (newLanguage) => {
    try {
      // Save language preference to Firebase
      if (userId) {
        await updateUserSettings(userId, { preferredLanguage: newLanguage });
        setUserSettings(prev => ({ ...prev, preferredLanguage: newLanguage }));
      }

      // Use context method to change language
      const result = await changeLanguage(newLanguage);
      
      if (result.success) {
        console.log(`✅ Language changed to: ${newLanguage}`);
      } else {
        console.error('❌ Failed to change language:', result.error);
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  }, [userId, changeLanguage]);

  // Memoized header component
  const headerContent = useMemo(() => (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-full bg-blue-100">
          <Heart className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Sarthi – Your Emotional Wellness Companion</h2>
          <p className="text-base text-gray-700">Your calm, emotionally intelligent friend</p>
          <SessionInfo />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          {language === 'Hindi' ? 'HI' : language === 'Hinglish' ? 'Hinglish' : 'EN'}
        </span>
        <PreviousChatsDropdown
          userId={userId}
          onSessionSelect={handleSessionSelect}
          currentSessionId={currentSessionId}
          isLoading={isLoading}
        />
        <LanguageToggle />
        <NewChatButton />
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            currentSessionId ? 'bg-green-400' : 'bg-yellow-400'
          }`}></div>
          <span className="text-base font-medium text-gray-700">
            {currentSessionId ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </div>
    </div>
  ), [userId, currentSessionId, isLoading, handleSessionSelect]);

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col bg-white rounded-lg shadow-lg border border-gray-200">
      {headerContent}

      {/* Messages Container - Fixed height with proper scrolling */}
      <div 
        ref={chatContainerRef}
        className="flex-1 min-h-0 flex flex-col"
      >
        <MessageList
          messages={uniqueMessages}
          crisisDetected={crisisDetected}
          error={error}
          isLoading={isLoading}
          isTyping={isTyping}
          messagesEndRef={messagesEndRef}
        />
      </div>

      {/* Input - Fixed at bottom, always visible */}
      <div className="flex-shrink-0 border-t border-gray-200">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          isTyping={isTyping}
          currentSessionId={currentSessionId}
          placeholder="Share what's on your mind..."
          disabled={false}
        />
      </div>
    </div>
  );
};

export default SarthiChatbot;