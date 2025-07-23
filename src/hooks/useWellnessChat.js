import { useState, useRef, useCallback, useEffect } from 'react';
import { useChatSession } from '../contexts/ChatSessionContext';

export const useWellnessChat = (userId) => {
  const {
    messages,
    currentSessionId,
    isLoading,
    isTyping,
    language,
    error,
    sendMessage,
    createNewSession,
    loadSession,
    changeLanguage,
    clearSession
  } = useChatSession();

  const [inputValue, setInputValue] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [showTypingDelay, setShowTypingDelay] = useState(false);
  const [sessionGreeted, setSessionGreeted] = useState(new Set());
  
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const lastMessageCountRef = useRef(0);
  const scrollTimeoutRef = useRef(null);

  // Deduplicate messages for stable rendering
  const uniqueMessages = messages.filter((message, index, arr) => 
    arr.findIndex(m => m.id === message.id) === index
  );

  // Enhanced auto-scroll with single trigger
  useEffect(() => {
    if (uniqueMessages.length > lastMessageCountRef.current) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest'
          });
          lastMessageCountRef.current = uniqueMessages.length;
        }
      }, 100);
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [uniqueMessages.length]);

  // Enhanced typing indicator with realistic delays
  useEffect(() => {
    if (isTyping) {
      setShowTypingDelay(false);
      const timer = setTimeout(() => {
        setShowTypingDelay(true);
      }, 800); // Realistic thinking delay

      return () => clearTimeout(timer);
    } else {
      setShowTypingDelay(false);
    }
  }, [isTyping]);

  // Initialize chat session
  const initializeChat = useCallback(async () => {
    if (isInitialized || !userId) return;
    
    try {
      const result = await loadSession(null);
      if (result.success) {
        if (uniqueMessages.length > 0) {
          setSessionGreeted(prev => new Set([...prev, result.sessionId]));
        }
        setIsInitialized(true);
      } else {
        await createNewSession(language || 'English', false);
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      setIsInitialized(true);
    }
  }, [isInitialized, userId, loadSession, createNewSession, language, uniqueMessages.length]);

  // Handle input change without causing re-renders
  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value);
  }, []);

  // Handle send message with optimized focus management
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading || isTyping) return;

    const messageToSend = inputValue.trim();
    setInputValue(''); // Clear immediately for better UX
    
    try {
      await sendMessage(messageToSend);
      
      // Scroll to bottom after sending message
      requestAnimationFrame(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest'
          });
        }
        
        // Maintain focus without causing flicker
        if (inputRef.current && document.activeElement !== inputRef.current) {
          inputRef.current.focus();
        }
      });
    } catch (error) {
      setInputValue(messageToSend); // Restore on error
      console.error('Error sending message:', error);
    }
  }, [inputValue, isLoading, isTyping, sendMessage]);

  // Handle key press with modern event handling
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Start new conversation
  const startNewChat = useCallback(async () => {
    try {
      await clearSession();
      setSessionGreeted(new Set());
      const result = await createNewSession(language || 'English', false);
      if (result.success && inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      console.error('Error starting new chat:', error);
    }
  }, [clearSession, createNewSession, language]);

  return {
    // State
    inputValue,
    isInitialized,
    uniqueMessages,
    currentSessionId,
    isLoading,
    isTyping: isTyping && showTypingDelay,
    language,
    error,
    
    // Refs
    inputRef,
    messagesEndRef,
    
    // Actions
    handleInputChange,
    handleSendMessage,
    handleKeyDown,
    startNewChat,
    initializeChat,
    changeLanguage,
    
    // Computed
    canSend: inputValue.trim() && !isLoading && !isTyping && currentSessionId,
    isConnected: !!currentSessionId
  };
};