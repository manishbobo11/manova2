/**
 * Chat Session Context for Sarthi
 * Manages current chat session state and persistence
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { chatPersistence } from '../services/firebase/chatPersistence';
import { ChatEngine } from '../services/ai/ChatEngine';
import { generateMessageId } from '../utils/messageId';
import { resetVectorContext } from '../utils/vectorStore';
import { ContextStore } from '../services/firebase';
import getFirstName from '../utils/getFirstName';
import { detectMessageLanguage } from '../utils/languageDetection';

// Action types
const ACTIONS = {
  SET_SESSION: 'SET_SESSION',
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  MARK_MESSAGE_SAVED: 'MARK_MESSAGE_SAVED',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_LANGUAGE: 'SET_LANGUAGE',
  SET_TYPING: 'SET_TYPING',
  CLEAR_SESSION: 'CLEAR_SESSION',
  SET_INTRO_SENT: 'SET_INTRO_SENT',
  SET_SESSION_INITIALIZED: 'SET_SESSION_INITIALIZED',
  DETECT_INITIAL_LANGUAGE: 'DETECT_INITIAL_LANGUAGE',
  SET_UI_LANGUAGE_CHOICE: 'SET_UI_LANGUAGE_CHOICE',
  SET_SESSION_LANGUAGE: 'SET_SESSION_LANGUAGE',
  SET_FIRST_NAME: 'SET_FIRST_NAME',
  SET_FIRST_MESSAGE_SENT: 'SET_FIRST_MESSAGE_SENT'
};

// Helper functions for localStorage
const STORAGE_KEY_CHOICE = 'sarthi_lang_choice';
const STORAGE_KEY_SESSION = 'sarthi_session_lang';

const getStoredLanguageChoice = () => {
  try {
    return localStorage.getItem(STORAGE_KEY_CHOICE) || 'Auto';
  } catch (error) {
    console.warn('Failed to read uiLanguageChoice from localStorage:', error);
    return 'Auto';
  }
};

const getStoredSessionLanguage = () => {
  try {
    return localStorage.getItem(STORAGE_KEY_SESSION) || null;
  } catch (error) {
    console.warn('Failed to read sessionLanguage from localStorage:', error);
    return null;
  }
};

const setStoredLanguageChoice = (choice) => {
  try {
    localStorage.setItem(STORAGE_KEY_CHOICE, choice);
  } catch (error) {
    console.warn('Failed to write uiLanguageChoice to localStorage:', error);
  }
};

const setStoredSessionLanguage = (language) => {
  try {
    if (language === null) {
      localStorage.removeItem(STORAGE_KEY_SESSION);
    } else {
      localStorage.setItem(STORAGE_KEY_SESSION, language);
    }
  } catch (error) {
    console.warn('Failed to write sessionLanguage to localStorage:', error);
  }
};

// Initial state
const initialState = {
  currentSessionId: null,
  messages: [],
  isLoading: false,
  isTyping: false,
  error: null,
  language: 'English', // Legacy compatibility
  uiLanguageChoice: getStoredLanguageChoice(),
  sessionLanguage: getStoredSessionLanguage(),
  firstName: null,
  firstMessageSent: false,
  sessionData: null,
  chatEngine: null,
  hasSentIntro: false,
  isSessionInitialized: false
};

// Reducer
function chatSessionReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_SESSION:
      return {
        ...state,
        currentSessionId: action.payload.sessionId,
        sessionData: action.payload.sessionData,
        error: null
      };

    case ACTIONS.SET_MESSAGES: {
      return {
        ...state,
        messages: action.payload,
        error: null
      };
    }

    case ACTIONS.ADD_MESSAGE: {
      // Prevent duplicate messages by checking if message ID already exists
      const messageExists = state.messages.some(msg => msg.id === action.payload.id);
      if (messageExists) {
        console.warn('Attempted to add duplicate message:', action.payload.id);
        return state;
      }
      
      // Ensure message has a unique ID
      const messageWithUniqueId = {
        ...action.payload,
        id: action.payload.id || generateMessageId(action.payload.type || 'msg')
      };
      
      return {
        ...state,
        messages: [...state.messages, messageWithUniqueId]
      };
    }

    case ACTIONS.MARK_MESSAGE_SAVED: {
      return {
        ...state,
        messages: state.messages.map(msg => 
          msg.id === action.payload.messageId ? { ...msg, saved: true } : msg
        )
      };
    }

    case ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case ACTIONS.SET_TYPING:
      return {
        ...state,
        isTyping: action.payload
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };

    case ACTIONS.SET_LANGUAGE:
      // Legacy compatibility - persist language to localStorage
      setStoredSessionLanguage(action.payload);
      return {
        ...state,
        language: action.payload,
        sessionLanguage: action.payload
      };

    case ACTIONS.SET_UI_LANGUAGE_CHOICE:
      setStoredLanguageChoice(action.payload);
      return {
        ...state,
        uiLanguageChoice: action.payload
      };

    case ACTIONS.SET_SESSION_LANGUAGE:
      setStoredSessionLanguage(action.payload);
      return {
        ...state,
        sessionLanguage: action.payload
      };

    case ACTIONS.SET_FIRST_NAME:
      return {
        ...state,
        firstName: action.payload
      };

    case ACTIONS.SET_FIRST_MESSAGE_SENT:
      return {
        ...state,
        firstMessageSent: action.payload
      };

    case ACTIONS.CLEAR_SESSION:
      return {
        ...initialState,
        language: state.language,
        uiLanguageChoice: state.uiLanguageChoice,
        sessionLanguage: state.sessionLanguage,
        firstName: state.firstName,
        chatEngine: state.chatEngine,
        hasSentIntro: false  // Reset intro flag when clearing session
      };

    case ACTIONS.SET_INTRO_SENT:
      return {
        ...state,
        hasSentIntro: action.payload
      };

    case ACTIONS.SET_SESSION_INITIALIZED:
      return {
        ...state,
        isSessionInitialized: action.payload
      };

    default:
      return state;
  }
}

// Context
const ChatSessionContext = createContext();

// Provider component
export const ChatSessionProvider = ({ children, userId, userContext = null }) => {
  const [state, dispatch] = useReducer(chatSessionReducer, {
    ...initialState,
    chatEngine: new ChatEngine()
  });

  // Initialize firstName on mount
  useEffect(() => {
    if (userContext) {
      const firstName = getFirstName(userContext);
      dispatch({ type: ACTIONS.SET_FIRST_NAME, payload: firstName });
    }
  }, [userContext]);

  // Save message to Firestore with retry logic
  const saveMessageToFirestore = useCallback(async (message) => {
    try {
      const result = await chatPersistence.saveMessage(
        userId, 
        state.currentSessionId, 
        message
      );

      if (result.success) {
        // Mark message as saved - this won't trigger the messages useEffect
        dispatch({
          type: ACTIONS.MARK_MESSAGE_SAVED,
          payload: { messageId: message.id }
        });
      } else {
        console.error('Failed to save message:', result.error);
      }
    } catch (error) {
      console.error('Error in saveMessageToFirestore:', error);
    }
  }, [userId, state.currentSessionId]);

  // Auto-save messages to Firestore when messages change
  useEffect(() => {
    if (state.currentSessionId && state.messages.length > 0) {
      const lastMessage = state.messages[state.messages.length - 1];
      
      // Only save if it's a new message (has no saved flag)
      if (!lastMessage.saved) {
        saveMessageToFirestore(lastMessage);
      }
    }
  }, [state.messages, state.currentSessionId, saveMessageToFirestore]);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      if (state.currentSessionId) {
        console.log('🧹 Cleaning up chat session:', state.currentSessionId);
      }
    };
  }, [state.currentSessionId]);

  // Create new chat session
  const createNewSession = useCallback(async (language = 'English', skipIntro = false) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: ACTIONS.SET_ERROR, payload: null });

      // Close current session if exists
      if (state.currentSessionId) {
        await chatPersistence.closeSession(
          userId, 
          state.currentSessionId, 
          state.chatEngine
        );
      }

      // Reset first message sent flag
      dispatch({ type: ACTIONS.SET_FIRST_MESSAGE_SENT, payload: false });

      let initialMessage = null;

      // Only generate intro message if not already sent and not skipping
      if (!state.hasSentIntro && !skipIntro) {
        console.log('🎯 Generating first message for new session');

        // Pure language greetings (no cross-language fillers)
        const greetings = {
          English: (name) => `Hey ${name}, how have you been feeling lately? I'm here with you.`,
          Hindi: (name) => `नमस्ते ${name}, आप कैसा महसूस कर रहे हैं? मैं यहाँ हूँ आपके साथ।`,
          Hinglish: (name) => `Arre ${name}, kaise ho? Kya chal raha hai? Main yahin hoon — baat shuru karein?`,
          Auto: (name) => `Hey ${name}, I'm here with you. Type a message and I'll follow your language.`
        };
        
        // Determine greeting language based on dropdown choice (strict pipeline)
        let greetingLanguage;
        if (state.uiLanguageChoice !== 'Auto') {
          greetingLanguage = state.uiLanguageChoice;
          dispatch({ type: ACTIONS.SET_SESSION_LANGUAGE, payload: state.uiLanguageChoice });
        } else {
          // Auto mode - neutral greeting, sessionLanguage remains null until first user message
          greetingLanguage = 'Auto';
          dispatch({ type: ACTIONS.SET_SESSION_LANGUAGE, payload: null });
        }

        const firstName = state.firstName || getFirstName(userContext || {});
        const greetingBuilder = greetings[greetingLanguage] || greetings['English'];
        const greetingText = greetingBuilder(firstName);

        initialMessage = {
          id: generateMessageId('ai'),
          type: 'ai',
          content: greetingText,
          timestamp: new Date(),
          emotion: 'supportive',
          summary: '',
          suggestions: [],
          journalPrompt: '',
          moodContext: '',
          saved: false
        };

        console.info('[Sarthi] NewChat', { uiLanguageChoice: state.uiLanguageChoice, sessionLanguage: greetingLanguage === 'Auto' ? null : greetingLanguage });
        // Mark intro as sent
        dispatch({ type: ACTIONS.SET_INTRO_SENT, payload: true });
      } else {
        console.log('⏭️ Skipping intro message generation (hasSentIntro:', state.hasSentIntro, ', skipIntro:', skipIntro, ')');
      }

      // Create new session
      const result = await chatPersistence.createChatSession(
        userId, 
        language, 
        initialMessage
      );

      if (result.success) {
        dispatch({
          type: ACTIONS.SET_SESSION,
          payload: {
            sessionId: result.sessionId,
            sessionData: result.sessionData
          }
        });

        // Only set messages if we have an initial message
        if (initialMessage) {
          dispatch({
            type: ACTIONS.SET_MESSAGES,
            payload: [{ ...initialMessage, saved: true }]
          });
        } else {
          dispatch({
            type: ACTIONS.SET_MESSAGES,
            payload: []
          });
        }

        dispatch({ type: ACTIONS.SET_LANGUAGE, payload: language });
        dispatch({ type: ACTIONS.SET_SESSION_INITIALIZED, payload: true });
        
        console.log(`🆕 Created new chat session: ${result.sessionId}`);
        return { success: true, sessionId: result.sessionId };
      } else {
        dispatch({ type: ACTIONS.SET_ERROR, payload: result.error });
        return { success: false, error: result.error };
      }

    } catch (error) {
      console.error('Error creating new session:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [userId, state.language]);

  // Load existing session
  const loadSession = useCallback(async (sessionId = null) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: ACTIONS.SET_ERROR, payload: null });

      // If no sessionId provided, get latest session
      let targetSessionId = sessionId;
      if (!targetSessionId) {
        const latestResult = await chatPersistence.getLatestSession(userId);
        if (latestResult.success && latestResult.session) {
          targetSessionId = latestResult.session.sessionId;
        }
      }

      if (!targetSessionId) {
        // No existing session, create new one
        return await createNewSession(state.language);
      }

      // Load messages for the session
      const messagesResult = await chatPersistence.loadSessionMessages(userId, targetSessionId);
      
      if (messagesResult.success) {
        dispatch({
          type: ACTIONS.SET_SESSION,
          payload: {
            sessionId: targetSessionId,
            sessionData: null // Will be loaded separately if needed
          }
        });

        dispatch({
          type: ACTIONS.SET_MESSAGES,
          payload: messagesResult.messages.map(msg => ({ ...msg, saved: true }))
        });

        console.log(`📚 Loaded session: ${targetSessionId} with ${messagesResult.messages.length} messages`);
        return { success: true, sessionId: targetSessionId };
      } else {
        dispatch({ type: ACTIONS.SET_ERROR, payload: messagesResult.error });
        return { success: false, error: messagesResult.error };
      }

    } catch (error) {
      console.error('Error loading session:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [userId, state.chatEngine, state.currentSessionId, state.firstName, state.hasSentIntro, state.sessionLanguage, state.uiLanguageChoice, userContext, createNewSession]);

  // Send message
  const sendMessage = async (messageText) => {
    try {
      if (!state.currentSessionId) {
        console.error('No active session');
        return { success: false, error: 'No active session' };
      }

      dispatch({ type: ACTIONS.SET_TYPING, payload: true });

      // Check if this is the first user message for language detection
      const userMessages = state.messages.filter(msg => msg.type === 'user');
      const isFirstUserMessage = userMessages.length === 0;
      
      // Detect language switch requests
      const lowerMessage = messageText.toLowerCase();
      let languageSwitchRequest = null;
      if (lowerMessage.includes('reply in english') || lowerMessage.includes('english please') || lowerMessage.includes('switch to english')) {
        languageSwitchRequest = 'English';
      } else if (lowerMessage.includes('reply in hindi') || lowerMessage.includes('hindi please') || lowerMessage.includes('switch to hindi')) {
        languageSwitchRequest = 'Hindi';
      } else if (lowerMessage.includes('reply in hinglish') || lowerMessage.includes('hinglish please') || lowerMessage.includes('switch to hinglish')) {
        languageSwitchRequest = 'Hinglish';
      }

      // Strict first user message detection (Auto mode only)
      if (isFirstUserMessage && state.uiLanguageChoice === 'Auto' && state.sessionLanguage === null) {
        // Simple detection logic as per requirements
        const hasDevanagari = /[\u0900-\u097F]/.test(messageText);
        const hasLatin = /[A-Za-z]/.test(messageText);
        
        let detectedLanguage;
        if (hasDevanagari && hasLatin) {
          detectedLanguage = 'Hinglish';
        } else if (hasDevanagari) {
          detectedLanguage = 'Hindi';
        } else {
          detectedLanguage = 'English';
        }
        
        console.info('[Sarthi] STRICT language detection on first message:', detectedLanguage);
        dispatch({ type: ACTIONS.SET_SESSION_LANGUAGE, payload: detectedLanguage });
        dispatch({ type: ACTIONS.SET_LANGUAGE, payload: detectedLanguage }); // Legacy compatibility
        dispatch({ type: ACTIONS.SET_FIRST_MESSAGE_SENT, payload: true });
      }

      // Add user message with unique ID
      const userMessage = {
        id: generateMessageId('user'),
        type: 'user',
        content: messageText,
        timestamp: new Date(),
        saved: false
      };

      dispatch({ type: ACTIONS.ADD_MESSAGE, payload: userMessage });

      // Ensure unique timestamps and prevent race conditions
      await new Promise(resolve => setTimeout(resolve, 50));

      // Determine effective language for this send
      const langToUse = state.sessionLanguage || (state.uiLanguageChoice !== 'Auto' ? state.uiLanguageChoice : 'English');

      const firstName = state.firstName || getFirstName(userContext || {});
      // Note: latestInsight is handled by ChatEngine internally
      
      // Trace logging as required
      console.info('[Sarthi] POST /api/chat', { 
        sessionLanguage: langToUse, 
        uiLanguageChoice: state.uiLanguageChoice, 
        hasInsight: true 
      });
      // Generate AI response with current language and language switch info
      const response = await state.chatEngine.generateResponse({
        userMessage: messageText,
        userId,
        language: langToUse,
        conversationHistory: [...state.messages, userMessage], // Include the new user message
        userContext: userContext,
        languageSwitchRequest, // Pass language switch request to backend
        firstName // Pass firstName for personalization
      });

      // Handle language switch response
      if (response.shouldSwitchLanguage) {
        const newLanguage = response.shouldSwitchLanguage;
        dispatch({ type: ACTIONS.SET_UI_LANGUAGE_CHOICE, payload: newLanguage });
        dispatch({ type: ACTIONS.SET_SESSION_LANGUAGE, payload: newLanguage });
        dispatch({ type: ACTIONS.SET_LANGUAGE, payload: newLanguage }); // Legacy compatibility
        console.info('[Sarthi] Language switched to', newLanguage);
      }

      // Add AI response with unique ID
      const aiMessage = {
        id: generateMessageId('ai'),
        type: 'ai',
        content: response.message,
        timestamp: new Date(),
        emotion: response.emotion || 'supportive',
        crisisResponse: response.crisisDetected || false,
        summary: response.summary || '',
        suggestions: response.suggestions || [],
        journalPrompt: response.journalPrompt || '',
        moodContext: response.moodContext || '',
        saved: false
      };

      dispatch({ type: ACTIONS.ADD_MESSAGE, payload: aiMessage });

      // Check if we should generate summary (after 10+ messages)
      if (state.messages.length >= 10 && state.messages.length % 10 === 0) {
        setTimeout(() => {
          chatPersistence.generateSessionSummary(
            userId, 
            state.currentSessionId, 
            state.chatEngine
          );
        }, 2000);
      }

      return { 
        success: true
      };

    } catch (error) {
      console.error('Error sending message:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: ACTIONS.SET_TYPING, payload: false });
    }
  };

  // Change language
  // Language management functions
  const setUiLanguageChoice = (choice) => {
    console.info('[Sarthi] STRICT setUiLanguageChoice', choice);
    dispatch({ type: ACTIONS.SET_UI_LANGUAGE_CHOICE, payload: choice });
    
    // Strict pipeline: If choice is not Auto, immediately set sessionLanguage
    if (choice !== 'Auto') {
      console.info('[Sarthi] STRICT setSessionLanguage (dropdown-first)', choice);
      dispatch({ type: ACTIONS.SET_SESSION_LANGUAGE, payload: choice });
      dispatch({ type: ACTIONS.SET_LANGUAGE, payload: choice }); // Legacy compatibility
    } else {
      // Auto mode: clear sessionLanguage until first user message
      console.info('[Sarthi] STRICT Auto mode - clearing sessionLanguage until first message');
      dispatch({ type: ACTIONS.SET_SESSION_LANGUAGE, payload: null });
    }
  };

  const setSessionLanguage = (language) => {
    console.info('[Sarthi] setSessionLanguage', language);
    dispatch({ type: ACTIONS.SET_SESSION_LANGUAGE, payload: language });
    dispatch({ type: ACTIONS.SET_LANGUAGE, payload: language }); // Legacy compatibility
  };

  // Legacy changeLanguage function for backward compatibility
  const changeLanguage = async (newLanguage) => {
    try {
      dispatch({ type: ACTIONS.SET_LANGUAGE, payload: newLanguage });
      try {
        localStorage.setItem('sarthi_lang', newLanguage);
        console.info('[Sarthi] setLang', newLanguage);
      } catch { /* ignore */ }

      // Update session metadata
      if (state.currentSessionId) {
        await chatPersistence.updateSessionMetadata(
          userId, 
          state.currentSessionId, 
          { languagePref: newLanguage }
        );
      }

      // Don't automatically add greeting on language change
      // This prevents duplicate greetings when switching languages
      console.log(`🌐 Language changed to ${newLanguage} - no auto-greeting`);

      return { success: true };

    } catch (error) {
      console.error('Error changing language:', error);
      return { success: false, error: error.message };
    }
  };

  // Get chat history for user
  const getChatHistory = async (limitCount = 10) => {
    try {
      return await chatPersistence.getChatHistory(userId, limitCount);
    } catch (error) {
      console.error('Error getting chat history:', error);
      return { success: false, error: error.message, chatHistory: [] };
    }
  };

  // Clear current session
  const clearSession = async () => {
    try {
      console.log('🧹 Clearing current chat session');
      
      // Clear session state
      dispatch({ type: ACTIONS.CLEAR_SESSION });
      
      // Reset vector context (clear embeddings)
      if (userId) {
        console.log('🔄 Resetting vector context...');
        const vectorResetResult = await resetVectorContext(userId);
        if (vectorResetResult.success) {
          console.log('✅ Vector context reset successfully');
        } else {
          console.warn('⚠️ Vector context reset failed:', vectorResetResult.error);
        }
        
        // Clear Firebase user context
        try {
          console.log('🔄 Clearing Firebase user context...');
          await ContextStore.clearUserContext(userId);
          console.log('✅ Firebase user context cleared successfully');
        } catch (contextError) {
          console.warn('⚠️ Failed to clear Firebase user context:', contextError);
        }
      }
      
      // Reset session memory and persona state
      if (userId && state.chatEngine) {
        console.log('🔄 Resetting session memory and persona state...');
        state.chatEngine.resetSession(userId);
      }
      
    } catch (error) {
      console.error('❌ Error clearing session:', error);
      // Still clear the session state even if reset operations fail
      dispatch({ type: ACTIONS.CLEAR_SESSION });
    }
  };

  // Reset session state
  const resetSession = async () => {
    try {
      console.log('🔄 Performing complete session reset');
      
      // Clear session state
      dispatch({ type: ACTIONS.CLEAR_SESSION });
      dispatch({ type: ACTIONS.SET_ERROR, payload: null });
      
      // Reset vector context (clear embeddings)
      if (userId) {
        console.log('🔄 Resetting vector context...');
        const vectorResetResult = await resetVectorContext(userId);
        if (vectorResetResult.success) {
          console.log('✅ Vector context reset successfully');
        } else {
          console.warn('⚠️ Vector context reset failed:', vectorResetResult.error);
        }
        
        // Clear Firebase user context
        try {
          console.log('🔄 Clearing Firebase user context...');
          await ContextStore.clearUserContext(userId);
          console.log('✅ Firebase user context cleared successfully');
        } catch (contextError) {
          console.warn('⚠️ Failed to clear Firebase user context:', contextError);
        }
      }
      
      // Reset session memory and persona state
      if (userId && state.chatEngine) {
        console.log('🔄 Resetting session memory and persona state...');
        state.chatEngine.resetSession(userId);
      }
      
    } catch (error) {
      console.error('❌ Error resetting session:', error);
      // Still clear the session state even if reset operations fail
      dispatch({ type: ACTIONS.CLEAR_SESSION });
      dispatch({ type: ACTIONS.SET_ERROR, payload: null });
    }
  };

  // Context value
  const contextValue = {
    ...state,
    createNewSession,
    loadSession,
    sendMessage,
    changeLanguage,
    setUiLanguageChoice,
    setSessionLanguage,
    getChatHistory,
    clearSession,
    resetSession,
    dispatch
  };

  return (
    <ChatSessionContext.Provider value={contextValue}>
      {children}
    </ChatSessionContext.Provider>
  );
};

// Hook to use the context
export const useChatSession = () => {
  const context = useContext(ChatSessionContext);
  if (!context) {
    throw new Error('useChatSession must be used within a ChatSessionProvider');
  }
  return context;
};

export default ChatSessionContext;