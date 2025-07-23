import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getUserSettings, updateUserSettings } from '../services/firebase/userSettings';

const ChatContext = createContext();

// Initial state
const initialState = {
  messages: [],
  isLoading: false,
  language: 'English',
  userSettings: {},
  error: null,
  crisisDetected: false,
  typingIndicator: false
};

// Action types
const actionTypes = {
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_LOADING: 'SET_LOADING',
  SET_LANGUAGE: 'SET_LANGUAGE',
  SET_USER_SETTINGS: 'SET_USER_SETTINGS',
  SET_ERROR: 'SET_ERROR',
  SET_CRISIS_DETECTED: 'SET_CRISIS_DETECTED',
  SET_TYPING_INDICATOR: 'SET_TYPING_INDICATOR',
  CLEAR_MESSAGES: 'CLEAR_MESSAGES',
  REMOVE_MESSAGE: 'REMOVE_MESSAGE'
};

// Reducer
const chatReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_MESSAGES:
      return {
        ...state,
        messages: action.payload
      };
    
    case actionTypes.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload],
        error: null
      };
    
    case actionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    
    case actionTypes.SET_LANGUAGE:
      return {
        ...state,
        language: action.payload
      };
    
    case actionTypes.SET_USER_SETTINGS:
      return {
        ...state,
        userSettings: action.payload,
        language: action.payload.preferredLanguage || state.language
      };
    
    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    
    case actionTypes.SET_CRISIS_DETECTED:
      return {
        ...state,
        crisisDetected: action.payload
      };
    
    case actionTypes.SET_TYPING_INDICATOR:
      return {
        ...state,
        typingIndicator: action.payload
      };
    
    case actionTypes.CLEAR_MESSAGES:
      return {
        ...state,
        messages: [],
        error: null,
        crisisDetected: false
      };
    
    case actionTypes.REMOVE_MESSAGE:
      return {
        ...state,
        messages: state.messages.filter(msg => msg.id !== action.payload)
      };
    
    default:
      return state;
  }
};

// Chat Context Provider
export const ChatProvider = ({ children, userId }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Load user settings on mount
  useEffect(() => {
    if (userId) {
      loadUserSettings(userId);
    }
  }, [userId]);

  // Load user settings from Firebase
  const loadUserSettings = async (userId) => {
    try {
      const settings = await getUserSettings(userId);
      dispatch({
        type: actionTypes.SET_USER_SETTINGS,
        payload: settings
      });
    } catch (error) {
      console.error('Error loading user settings:', error);
      dispatch({
        type: actionTypes.SET_ERROR,
        payload: 'Failed to load user settings'
      });
    }
  };

  // Actions
  const actions = {
    // Message actions
    addMessage: (message) => {
      const messageWithId = {
        id: Date.now() + Math.random(),
        timestamp: new Date(),
        ...message
      };
      dispatch({
        type: actionTypes.ADD_MESSAGE,
        payload: messageWithId
      });
    },

    setMessages: (messages) => {
      dispatch({
        type: actionTypes.SET_MESSAGES,
        payload: messages
      });
    },

    removeMessage: (messageId) => {
      dispatch({
        type: actionTypes.REMOVE_MESSAGE,
        payload: messageId
      });
    },

    clearMessages: () => {
      dispatch({
        type: actionTypes.CLEAR_MESSAGES
      });
    },

    // Loading state
    setLoading: (loading) => {
      dispatch({
        type: actionTypes.SET_LOADING,
        payload: loading
      });
    },

    // Typing indicator
    setTypingIndicator: (typing) => {
      dispatch({
        type: actionTypes.SET_TYPING_INDICATOR,
        payload: typing
      });
    },

    // Language actions
    setLanguage: async (language) => {
      dispatch({
        type: actionTypes.SET_LANGUAGE,
        payload: language
      });

      // Save to Firebase if user is logged in
      if (userId) {
        try {
          await updateUserSettings(userId, { preferredLanguage: language });
          const updatedSettings = { ...state.userSettings, preferredLanguage: language };
          dispatch({
            type: actionTypes.SET_USER_SETTINGS,
            payload: updatedSettings
          });
        } catch (error) {
          console.error('Error saving language preference:', error);
        }
      }
    },

    // User settings
    updateUserSettings: async (settings) => {
      if (!userId) return;
      
      try {
        await updateUserSettings(userId, settings);
        const updatedSettings = { ...state.userSettings, ...settings };
        dispatch({
          type: actionTypes.SET_USER_SETTINGS,
          payload: updatedSettings
        });
      } catch (error) {
        console.error('Error updating user settings:', error);
        dispatch({
          type: actionTypes.SET_ERROR,
          payload: 'Failed to update settings'
        });
      }
    },

    // Error handling
    setError: (error) => {
      dispatch({
        type: actionTypes.SET_ERROR,
        payload: error
      });
    },

    clearError: () => {
      dispatch({
        type: actionTypes.SET_ERROR,
        payload: null
      });
    },

    // Crisis detection
    setCrisisDetected: (detected) => {
      dispatch({
        type: actionTypes.SET_CRISIS_DETECTED,
        payload: detected
      });
    },

    // Utility functions
    getRecentMessages: (count = 10) => {
      return state.messages.slice(-count);
    },

    getMessagesByType: (type) => {
      return state.messages.filter(msg => msg.type === type);
    },

    getLastUserMessage: () => {
      const userMessages = state.messages.filter(msg => msg.type === 'user');
      return userMessages[userMessages.length - 1];
    },

    getLastAIMessage: () => {
      const aiMessages = state.messages.filter(msg => msg.type === 'ai');
      return aiMessages[aiMessages.length - 1];
    },

    // Chat history management
    exportChatHistory: () => {
      return {
        messages: state.messages,
        language: state.language,
        timestamp: new Date().toISOString(),
        userId
      };
    },

    importChatHistory: (history) => {
      if (history.messages && Array.isArray(history.messages)) {
        dispatch({
          type: actionTypes.SET_MESSAGES,
          payload: history.messages
        });
      }
      if (history.language) {
        dispatch({
          type: actionTypes.SET_LANGUAGE,
          payload: history.language
        });
      }
    }
  };

  const value = {
    ...state,
    actions,
    userId
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// HOC for components that need chat context
export const withChat = (Component) => {
  return function WrappedComponent(props) {
    return (
      <ChatProvider userId={props.userId}>
        <Component {...props} />
      </ChatProvider>
    );
  };
};

export default ChatContext;