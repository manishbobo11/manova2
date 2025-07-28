import React, { useEffect, memo, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Send, 
  MessageCircle, 
  AlertTriangle, 
  Brain,
  Sparkles,
  Plus,
  RotateCcw,
  Smile
} from 'lucide-react';
import { useWellnessChat } from '../hooks/useWellnessChat';

const SarthiChatbox = ({ userId, onNewChat }) => {
  const {
    inputValue,
    isInitialized,
    uniqueMessages,
    currentSessionId,
    isLoading,
    isTyping,
    error,
    inputRef,
    messagesEndRef,
    handleInputChange,
    handleSendMessage,
    handleKeyDown,
    startNewChat,
    initializeChat,
    canSend,
    isConnected
  } = useWellnessChat(userId);

  // Initialize chat on mount
  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  // Pass startNewChat function to parent
  useEffect(() => {
    if (onNewChat && startNewChat) {
      onNewChat(startNewChat);
    }
  }, [onNewChat, startNewChat]);

  // Auto-focus when ready
  useEffect(() => {
    if (isConnected && inputRef.current && !inputValue) {
      const timer = setTimeout(() => {
        if (inputRef.current && !document.activeElement?.tagName?.toLowerCase() === 'textarea') {
          inputRef.current.focus();
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isConnected, inputValue]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-rose-50/30 via-white to-sky-50/30">
      
      {/* Messages Container */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                  <div>
                    <p className="text-rose-800 font-medium">Connection Issue</p>
                    <p className="text-rose-600 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <AnimatePresence>
            {uniqueMessages.map((message, index) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                index={index}
                isLast={index === uniqueMessages.length - 1}
              />
            ))}
          </AnimatePresence>

          {/* Enhanced Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <TypingIndicator />
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Enhanced Input Area */}
      <ChatInput
        inputRef={inputRef}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onSend={handleSendMessage}
        canSend={canSend}
        isLoading={isLoading}
        isTyping={isTyping}
        isConnected={isConnected}
      />
    </div>
  );
};

// Enhanced Chat Header Component
const ChatHeader = memo(({ isConnected, onNewChat, isLoading }) => (
  <div className="flex items-center justify-between p-6 border-b border-sage-100/50 bg-gradient-to-r from-sage-50/50 to-sky-50/50 rounded-t-2xl backdrop-blur-sm">
    <div className="flex items-center space-x-4">
      <motion.div 
        className="relative"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-12 h-12 bg-gradient-to-br from-sage-400 to-sky-400 rounded-2xl flex items-center justify-center shadow-lg">
          <Heart className="h-6 w-6 text-white" />
        </div>
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>
      
      <div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-sage-700 to-sky-700 bg-clip-text text-transparent font-inter">
          Sarthi 🌱
        </h2>
        <p className="text-sage-600 text-sm font-semibold font-inter">Your AI wellness companion</p>
        <div className="flex items-center space-x-2 mt-1">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <span className="text-xs text-sage-500 font-medium">
            {isConnected ? 'Connected & listening' : 'Connecting...'}
          </span>
        </div>
      </div>
    </div>

    <motion.button
      onClick={onNewChat}
      disabled={isLoading}
      className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
        isLoading
          ? 'bg-sage-100 text-sage-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-sage-100 to-sky-100 text-sage-700 hover:from-sage-200 hover:to-sky-200 shadow-md hover:shadow-lg'
      }`}
      whileHover={!isLoading ? { scale: 1.02 } : {}}
      whileTap={!isLoading ? { scale: 0.98 } : {}}
    >
      <Plus className="h-4 w-4" />
      <span>New Chat</span>
    </motion.button>
  </div>
));

// Enhanced Message Bubble Component
const MessageBubble = memo(({ message, index, isLast }) => {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="flex justify-center"
      >
        <div className="bg-sage-100/50 text-sage-700 text-sm font-medium px-4 py-2 rounded-full border border-sage-200/50">
          {message.content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 200,
        damping: 20
      }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}
    >
      <div className={`flex items-start space-x-3 max-w-[85%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        
        {/* Avatar */}
        {!isUser && (
          <motion.div 
            className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-md ${
              message.crisisResponse 
                ? 'bg-gradient-to-br from-rose-400 to-pink-400' 
                : 'bg-gradient-to-br from-sage-400 to-sky-400'
            }`}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            {message.crisisResponse ? (
              <AlertTriangle className="h-5 w-5 text-white" />
            ) : (
              <Heart className="h-5 w-5 text-white" />
            )}
          </motion.div>
        )}

        {/* Message Content */}
        <div className="flex flex-col space-y-2">
          <motion.div
            className={`px-6 py-4 rounded-2xl border ${
              isUser
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-300 shadow-md'
                : message.crisisResponse
                ? 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200 text-rose-900 shadow-sm'
                : 'bg-neutral-50 border-gray-200 text-gray-800 shadow-md'
            }`}
            whileHover={{ scale: 1.01 }}
          >
            {/* Message Text with Emoji Support */}
            <MessageContent content={message.content} isUser={isUser} />
            
            {/* Timestamp */}
            <p className={`text-xs mt-3 ${
              isUser ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {message.timestamp?.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </motion.div>

          {/* Enhanced Suggestions */}
          {!isUser && message.suggestions && message.suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-200 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center mb-3">
                <Brain className="h-4 w-4 text-sky-600 mr-2" />
                <span className="text-sm font-semibold text-sky-800">Gentle suggestions ✨</span>
              </div>
              <div className="space-y-2">
                {message.suggestions.map((suggestion, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="flex items-start space-x-2 text-sm text-sky-700"
                  >
                    <Sparkles className="h-3 w-3 text-sky-500 mt-0.5 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Journal Prompt */}
          {!isUser && message.journalPrompt && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-sage-50 to-emerald-50 border border-sage-200 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center mb-2">
                <Heart className="h-4 w-4 text-sage-600 mr-2" />
                <span className="text-sm font-semibold text-sage-800">Journal reflection 📔</span>
              </div>
              <p className="text-sm text-sage-700 italic">
                "{message.journalPrompt}"
              </p>
            </motion.div>
          )}
        </div>

        {/* User Avatar */}
        {isUser && (
          <motion.div 
            className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-sky-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-md"
            whileHover={{ scale: 1.1, rotate: -5 }}
          >
            <MessageCircle className="h-5 w-5 text-white" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});

// Enhanced Message Content with Emoji Support
const MessageContent = memo(({ content, isUser }) => {
  // Simple emoji and bold text support
  const formatMessage = (text) => {
    // Split by bold markers
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className={isUser ? 'text-blue-100' : 'text-gray-800'}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <p className={`leading-relaxed whitespace-pre-wrap font-medium font-inter ${
      isUser ? 'text-white' : 'text-gray-800'
    }`} style={{ wordBreak: 'break-word' }}>
      {formatMessage(content)}
    </p>
  );
});

// Enhanced Typing Indicator
const TypingIndicator = memo(() => (
  <div className="flex items-start space-x-3">
    <motion.div 
      className="w-10 h-10 bg-gradient-to-br from-sage-400 to-sky-400 rounded-2xl flex items-center justify-center shadow-md"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <Heart className="h-5 w-5 text-white" />
    </motion.div>
    
    <div className="bg-neutral-50 border border-gray-200 rounded-3xl px-6 py-4 shadow-md">
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-sage-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600 font-medium ml-2">
          Sarthi is thinking...
        </span>
      </div>
    </div>
  </div>
));

// Simple Emoji Picker Component
const EmojiPicker = memo(({ onEmojiSelect, onClose, isOpen }) => {
  const emojis = [
    '😊', '😢', '😤', '😔', '😌', '😍', '🤗', '😱', 
    '🤔', '😂', '😭', '🥺', '😳', '😅', '🙂', '😓',
    '❤️', '💙', '💚', '💛', '💜', '🧡', '🖤', '🤍',
    '👍', '👎', '👋', '🙏', '💪', '✨', '🌟', '⭐'
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute bottom-16 left-0 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50 w-80 max-w-[calc(100vw-2rem)]"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Pick an emoji</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-8 gap-2">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => {
              onEmojiSelect(emoji);
              onClose();
            }}
            className="w-8 h-8 text-lg hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
          >
            {emoji}
          </button>
        ))}
      </div>
    </motion.div>
  );
});

// Enhanced Chat Input Component
const ChatInput = memo(({ 
  inputRef, 
  inputValue, 
  onInputChange, 
  onKeyDown, 
  onSend, 
  canSend, 
  isLoading, 
  isTyping, 
  isConnected 
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Close emoji picker when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && !event.target.closest('.emoji-picker-container')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const handleEmojiSelect = (emoji) => {
    if (inputRef.current) {
      const start = inputRef.current.selectionStart;
      const end = inputRef.current.selectionEnd;
      const newValue = inputValue.slice(0, start) + emoji + inputValue.slice(end);
      
      // Create synthetic event for onInputChange
      const syntheticEvent = {
        target: { value: newValue }
      };
      onInputChange(syntheticEvent);
      
      // Reset cursor position after emoji insertion
      setTimeout(() => {
        if (inputRef.current) {
          const newCursorPos = start + emoji.length;
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
          inputRef.current.focus();
        }
      }, 0);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-gray-50 shadow-md rounded-b-xl">
      <div className="p-4 md:p-6">
        <div className="flex items-end space-x-3 w-full">
          
          {/* Emoji Button */}
          <div className="relative emoji-picker-container">
            <motion.button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                showEmojiPicker 
                  ? 'bg-blue-100 border-blue-300 text-blue-600' 
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Smile className="h-5 w-5" />
            </motion.button>
            
            <AnimatePresence>
              <EmojiPicker 
                isOpen={showEmojiPicker}
                onEmojiSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
              />
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className="flex-1 relative min-w-0">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={onInputChange}
              onKeyDown={onKeyDown}
              placeholder={
                isConnected 
                  ? "Share what's on your mind... 💭" 
                  : "Connecting to Sarthi..."
              }
              className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-400 resize-none text-gray-800 placeholder-gray-400 font-medium font-inter transition-all shadow-sm overflow-hidden"
              rows={1}
              style={{ 
                minHeight: '56px',
                maxHeight: '120px',
                overflowY: inputValue.length > 100 ? 'auto' : 'hidden',
                boxSizing: 'border-box'
              }}
              disabled={!isConnected || isLoading || isTyping}
            />
            
            {/* Character counter for long messages */}
            {inputValue.length > 200 && (
              <div className="absolute bottom-3 right-4 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded">
                {inputValue.length}/500
              </div>
            )}
          </div>

          {/* Send Button */}
          <motion.button
            onClick={onSend}
            disabled={!canSend}
            className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-md ${
              canSend
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            whileHover={canSend ? { scale: 1.05 } : {}}
            whileTap={canSend ? { scale: 0.95 } : {}}
          >
            {isLoading || isTyping ? (
              <RotateCcw className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </motion.button>
        </div>

        {/* Helper Text */}
        <p className="text-xs text-gray-500 mt-3 text-center font-medium">
          💚 This AI companion is for emotional support. In case of emergency, consult a nearby hospital or dial KIRAN Helpline 1800-599-0019.
        </p>
      </div>
    </div>
  );
});

// Set display names for dev tools
ChatHeader.displayName = 'ChatHeader';
MessageBubble.displayName = 'MessageBubble';
MessageContent.displayName = 'MessageContent';
TypingIndicator.displayName = 'TypingIndicator';
ChatInput.displayName = 'ChatInput';
EmojiPicker.displayName = 'EmojiPicker';

export default SarthiChatbox;