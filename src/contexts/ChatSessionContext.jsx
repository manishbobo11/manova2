/**
 * Chat Session Context for Sarthi
 * Manages current chat session state and persistence
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { chatPersistence } from '../services/firebase/chatPersistence';
import { ChatEngine } from '../services/ai/ChatEngine';
import { generateMessageId } from '../utils/messageId';
import { resetVectorContext } from '../utils/vectorStore';
import { ContextStore } from '../services/firebase';

// Action types
const ACTIONS = {
  SET_SESSION: 'SET_SESSION',
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_LANGUAGE: 'SET_LANGUAGE',
  SET_TYPING: 'SET_TYPING',
  CLEAR_SESSION: 'CLEAR_SESSION',
  SET_INTRO_SENT: 'SET_INTRO_SENT',
  SET_SESSION_INITIALIZED: 'SET_SESSION_INITIALIZED'
};

// Initial state
const initialState = {
  currentSessionId: null,
  messages: [],
  isLoading: false,
  isTyping: false,
  error: null,
  language: 'English',
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
      return {
        ...state,
        language: action.payload
      };

    case ACTIONS.CLEAR_SESSION:
      return {
        ...initialState,
        language: state.language,
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
export const ChatSessionProvider = ({ children, userId }) => {
  const [state, dispatch] = useReducer(chatSessionReducer, {
    ...initialState,
    chatEngine: new ChatEngine()
  });

  // Auto-save messages to Firestore when messages change
  useEffect(() => {
    if (state.currentSessionId && state.messages.length > 0) {
      const lastMessage = state.messages[state.messages.length - 1];
      
      // Only save if it's a new message (has no saved flag)
      if (!lastMessage.saved) {
        saveMessageToFirestore(lastMessage);
      }
    }
  }, [state.messages, state.currentSessionId]);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      if (state.currentSessionId) {
        console.log('🧹 Cleaning up chat session:', state.currentSessionId);
      }
    };
  }, [state.currentSessionId]);

  // Save message to Firestore with retry logic
  const saveMessageToFirestore = async (message) => {
    try {
      const result = await chatPersistence.saveMessage(
        userId, 
        state.currentSessionId, 
        message
      );

      if (result.success) {
        // Mark message as saved
        dispatch({
          type: ACTIONS.SET_MESSAGES,
          payload: state.messages.map(msg => 
            msg.id === message.id ? { ...msg, saved: true } : msg
          )
        });
      } else {
        console.error('Failed to save message:', result.error);
      }
    } catch (error) {
      console.error('Error in saveMessageToFirestore:', error);
    }
  };

  // Create new chat session
  const createNewSession = async (language = 'English', skipIntro = false) => {
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

      let initialMessage = null;

      // Only generate intro message if not already sent and not skipping
      if (!state.hasSentIntro && !skipIntro) {
        console.log('🎯 Generating first message for new session');
        
        // Get personalized first message
        const firstMessageResponse = await state.chatEngine.getFirstMessage({
          userId: userId,
          language: language
        });

        initialMessage = {
          id: generateMessageId('ai'),
          type: 'ai',
          content: firstMessageResponse.message,
          timestamp: new Date(),
          emotion: firstMessageResponse.emotion || 'supportive',
          summary: firstMessageResponse.summary || '',
          suggestions: firstMessageResponse.suggestions || [],
          journalPrompt: firstMessageResponse.journalPrompt || '',
          moodContext: firstMessageResponse.moodContext || '',
          saved: false
        };

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
  };

  // Load existing session
  const loadSession = async (sessionId = null) => {
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
  };

  // Send message
  const sendMessage = async (messageText) => {
    try {
      if (!state.currentSessionId) {
        console.error('No active session');
        return { success: false, error: 'No active session' };
      }

      dispatch({ type: ACTIONS.SET_TYPING, payload: true });

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

      // Generate AI response
      const response = await state.chatEngine.generateResponse({
        userMessage: messageText,
        userId,
        language: state.language,
        conversationHistory: [...state.messages, userMessage] // Include the new user message
      });

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

      return { success: true };

    } catch (error) {
      console.error('Error sending message:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: ACTIONS.SET_TYPING, payload: false });
    }
  };

  // Change language
  const changeLanguage = async (newLanguage) => {
    try {
      dispatch({ type: ACTIONS.SET_LANGUAGE, payload: newLanguage });

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