/**
 * Previous Chats Dropdown Component
 * Displays user's chat history with option to resume sessions
 */

import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircle, Clock, Calendar } from 'lucide-react';
import { chatPersistence } from '../services/firebase/chatPersistence';

const PreviousChatsDropdown = memo(({ userId, onSessionSelect, currentSessionId, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load chat history when dropdown opens
  useEffect(() => {
    if (isOpen && userId && chatHistory.length === 0) {
      loadChatHistory();
    }
  }, [isOpen, userId]);

  const loadChatHistory = async () => {
    try {
      setLoadingHistory(true);
      const result = await chatPersistence.getChatHistory(userId, 10);
      
      if (result.success) {
        setChatHistory(result.chatHistory);
      } else {
        console.error('Failed to load chat history:', result.error);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSessionSelect = (sessionId) => {
    if (sessionId !== currentSessionId && onSessionSelect) {
      onSessionSelect(sessionId);
    }
    setIsOpen(false);
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown date';
    
    const now = new Date();
    const chatDate = new Date(date);
    const diffInDays = Math.floor((now - chatDate) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return chatDate.toLocaleDateString();
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Filter out current session from history
  const filteredHistory = chatHistory.filter(chat => chat.sessionId !== currentSessionId);

  return (
    <div className="relative">
      {/* Dropdown trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isLoading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <MessageCircle className="h-4 w-4" />
        <span>Previous Chats</span>
        <ChevronDown 
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {loadingHistory ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Loading chat history...
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No previous chats found</p>
                <p className="text-xs text-gray-400 mt-1">Start chatting to build your history!</p>
              </div>
            ) : (
              <div className="py-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  Chat History
                </div>
                {filteredHistory.map((chat, index) => (
                  <motion.button
                    key={chat.sessionId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSessionSelect(chat.sessionId)}
                    className="w-full px-3 py-3 text-left hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-xs font-medium text-gray-600">
                            {formatDate(chat.lastUpdated)}
                          </span>
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {formatTime(chat.lastUpdated)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 font-medium truncate">
                          {chat.summary || chat.preview || 'Chat session'}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {chat.messageCount} {chat.messageCount === 1 ? 'message' : 'messages'}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            {chat.languagePref || 'English'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
            
            {/* Footer */}
            <div className="px-3 py-2 bg-gray-50 rounded-b-lg border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Your conversations are securely stored and private
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
});

PreviousChatsDropdown.displayName = 'PreviousChatsDropdown';

export default PreviousChatsDropdown;