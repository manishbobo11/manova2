/**
 * Chat History Widget for Dashboard
 * Shows recent chat sessions with quick resume functionality
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Calendar, 
  Clock, 
  ExternalLink, 
  RefreshCw,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { chatPersistence } from '../services/firebase/chatPersistence';

const ChatHistoryWidget = ({ userId, onResumeChat }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (userId) {
      loadChatHistory();
    }
  }, [userId]);

  const loadChatHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await chatPersistence.getChatHistory(userId, 5);
      
      if (result.success) {
        setChatHistory(result.chatHistory);
        console.log(`📋 Loaded ${result.chatHistory.length} chat sessions`);
      } else {
        setError(result.error);
        console.error('❌ Failed to load chat history:', result.error);
      }
    } catch (err) {
      setError(err.message);
      console.error('❌ Error loading chat history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadChatHistory();
    setRefreshing(false);
  };

  const handleResumeChat = (sessionId) => {
    if (onResumeChat) {
      onResumeChat(sessionId);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown date';
    
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getLanguageEmoji = (language) => {
    switch (language) {
      case 'Hindi': return '🇮🇳';
      case 'Hinglish': return '🔄';
      case 'English': return '🇺🇸';
      default: return '💬';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-lg border border-[#D8D8D8] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-black flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-[#007CFF]" />
            Recent Chats
          </h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl shadow-lg border border-[#D8D8D8] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-black flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-[#007CFF]" />
            Recent Chats
          </h3>
          <button
            onClick={handleRefresh}
            className="p-2 text-[#777] hover:text-black rounded-2xl hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <div className="text-center py-4">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 px-4 py-2 bg-[#007CFF] hover:bg-[#0066CC] text-white rounded-2xl text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-[#D8D8D8] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-black flex items-center">
          <MessageCircle className="h-5 w-5 mr-2 text-[#007CFF]" />
          Recent Chats
          {chatHistory.length > 0 && (
            <span className="ml-2 px-2 py-1 text-xs bg-blue-50 text-[#007CFF] rounded-full border border-blue-100">
              {chatHistory.length}
            </span>
          )}
        </h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 text-[#777] hover:text-black rounded-2xl hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {chatHistory.length === 0 ? (
        <div className="text-center py-8">
          <Sparkles className="h-12 w-12 text-[#777] mx-auto mb-3" />
          <p className="text-[#777] text-sm">No chat history yet</p>
          <p className="text-[#777] text-xs mt-1">Start a conversation with Sarthi!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {chatHistory.map((session, index) => (
              <motion.div
                key={session.sessionId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="group border border-[#D8D8D8] rounded-2xl p-4 hover:border-[#007CFF] hover:shadow-sm transition-all duration-200 cursor-pointer"
                onClick={() => handleResumeChat(session.sessionId)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {/* Session Icon */}
                    <div className="p-2 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-colors">
                      <MessageCircle className="h-4 w-4 text-[#007CFF]" />
                    </div>
                    
                    {/* Session Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-black truncate">
                          {session.summary || 'Chat Session'}
                        </span>
                        <span className="text-xs">
                          {getLanguageEmoji(session.languagePref)}
                        </span>
                      </div>
                      
                      {session.preview && (
                        <p className="text-xs text-[#777] line-clamp-2 mb-2">
                          {session.preview}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-3 text-xs text-[#777]">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(session.lastUpdated)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(session.lastUpdated)}</span>
                        </div>
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {session.messageCount || 0} messages
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Resume Button */}
                  <motion.div
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <div className="p-2 bg-[#007CFF] text-white rounded-2xl">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      {chatHistory.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#D8D8D8]">
          <p className="text-xs text-[#777] text-center">
            Click any chat to resume where you left off
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatHistoryWidget;