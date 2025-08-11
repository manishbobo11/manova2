import React, { useEffect, memo, useMemo, useState, useCallback } from 'react';
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
import { useChatSession } from '../contexts/ChatSessionContext';

const SarthiChatbox = ({ userId, onNewChat, onClose }) => {
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
    isConnected,
    language,
    changeLanguage,
    uiLanguageChoice,
    sessionLanguage,
    setUiLanguageChoice
  } = useWellnessChat(userId);

  // Access sendMessage directly for quick reply chips without changing existing handlers
  const { sendMessage } = useChatSession();
  const firstSentRef = React.useRef(false);

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

  const sessionLangPill = useMemo(() => {
    if (!sessionLanguage) return 'Auto';
    if (sessionLanguage.toLowerCase() === 'english') return 'EN';
    if (sessionLanguage.toLowerCase() === 'hindi') return 'HI';
    if (sessionLanguage.toLowerCase() === 'hinglish') return 'Hinglish';
    return sessionLanguage;
  }, [sessionLanguage]);

  const handleQuickReply = useCallback(async (text) => {
    try {
      await sendMessage(text);
    } catch (e) {
      // no-op UI change
    }
  }, [sendMessage]);

  const lastMessage = uniqueMessages[uniqueMessages.length - 1];
  const showQuickChips = !isTyping && !inputValue && lastMessage && lastMessage.type !== 'user';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
        <div className="px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shadow-sm overflow-hidden on-brand bg-blue-600">
              <img src="/images/mascot.svg" alt="Sarthi Avatar" className="w-8 h-8 md:w-10 md:h-10 object-cover" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm md:text-base font-semibold text-slate-900 truncate">Sarthi — Your Emotional Wellness Companion</h2>
              <p className="text-xs md:text-sm text-slate-600">Here to listen, understand, and support.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              {sessionLangPill}
            </span>
            <select
              aria-label="Language"
              value={uiLanguageChoice || 'Auto'}
              onChange={(e) => {
                const choice = e.target.value;
                setUiLanguageChoice(choice);
              }}
              className="hidden sm:block text-xs md:text-sm bg-white border border-slate-200 rounded-full px-2.5 py-1 text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Hinglish">Hinglish</option>
              <option value="Auto">Auto</option>
            </select>
            <button
              onClick={() => {
                firstSentRef.current = false;
                startNewChat();
              }}
              className="px-3 py-2 md:px-3 md:py-2 rounded-full text-sm font-medium text-slate-700 hover:text-slate-900 bg-transparent hover:bg-slate-100 border border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              New Chat
            </button>
            {onClose && (
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-slate-50">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
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
            {uniqueMessages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>

          {/* Quick reply chips below last agent message */}
          {showQuickChips && (
            <QuickReplyChips onSelect={handleQuickReply} />)
          }

          {/* Typing indicator */}
          {isTyping && (
            <div aria-live="polite">
              <TypingIndicator />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
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

// Message Bubble Component (user/agent variants per spec)
const MessageBubble = memo(({ message }) => {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1 rounded-full border border-slate-200">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[78%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`px-4 py-2 rounded-2xl ${
          isUser
            ? 'font-medium shadow-md'
            : 'bg-white text-slate-800 border border-slate-200 shadow-sm'
        }`}
        style={isUser ? {
          backgroundColor: '#2563eb',
          color: '#ffffff'
        } : {}}
        >
          <p className="leading-relaxed whitespace-pre-wrap" style={{ 
            wordBreak: 'break-word',
            color: isUser ? '#ffffff' : undefined
          }}>
            {message.content}
          </p>
          <p className={`text-xs mt-2`} style={{ 
            color: isUser ? 'rgba(255, 255, 255, 0.8)' : '#9ca3af'
          }}>
            {message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
});

// Enhanced Message Content with Emoji Support
const MessageContent = memo(({ content, isUser }) => {
  // Simple emoji and bold text support
  const formatMessage = (text) => {
    // Handle undefined or null text
    if (!text || typeof text !== 'string') {
      return 'Message content unavailable';
    }
    
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
    <p className={`leading-relaxed whitespace-pre-wrap font-medium font-inter`} 
       style={{ 
         wordBreak: 'break-word',
         color: isUser ? '#ffffff' : '#1f2937'
       }}>
      {formatMessage(content)}
    </p>
  );
});

// Typing Indicator
const TypingIndicator = memo(() => (
  <div className="flex justify-start">
    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-600 animate-pulse">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
      <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
      <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
      <span className="sr-only">Sarthi is typing…</span>
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
        <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
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

// Quick Reply Chips
const QuickReplyChips = memo(({ onSelect }) => {
  const chips = useMemo(() => [
    'That makes sense',
    'Tell me more',
    'Give me a next step'
  ], []);
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((text) => (
        <button
          key={text}
          onClick={() => onSelect(text)}
          className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          {text}
        </button>
      ))}
    </div>
  );
});

// Chat Input Component (updated styles per spec)
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
    <div className="sticky bottom-0 bg-white border-t border-gray-300">
      <div className="p-3 md:p-4">
        <div className="flex items-end gap-2 md:gap-3 w-full">
          {/* Optional emoji toggler retained */}
          <div className="relative emoji-picker-container hidden md:block">
            <motion.button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`flex-shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center border font-medium ${
                showEmojiPicker 
                  ? 'bg-blue-100 border-blue-200 text-blue-700' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`}
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
              placeholder={isConnected ? "Share what's on your mind..." : 'Connecting to Sarthi...'}
              className="w-full px-5 py-3 bg-white border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-slate-800 placeholder-slate-400 transition-all shadow-sm overflow-hidden"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '140px', overflowY: inputValue.length > 100 ? 'auto' : 'hidden', boxSizing: 'border-box' }}
              disabled={!isConnected || isLoading || isTyping}
            />
          </div>

          {/* Send Button */}
          <motion.button
            onClick={onSend}
            disabled={!canSend}
            className={`flex-shrink-0 rounded-full px-4 py-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`}
            style={canSend ? {
              backgroundColor: '#2563eb',
              color: '#ffffff'
            } : {
              backgroundColor: '#e5e7eb',
              color: '#9ca3af'
            }}
            whileHover={canSend ? { 
              scale: 1.03,
              backgroundColor: '#1d4ed8'
            } : {}}
            whileTap={canSend ? { scale: 0.97 } : {}}
          >
            {isLoading || isTyping ? (
              <RotateCcw className="h-5 w-5 animate-spin" style={{ color: '#ffffff' }} />
            ) : (
              <Send className="h-5 w-5" style={{ color: '#ffffff' }} />
            )}
          </motion.button>
        </div>
        <p className="text-[11px] text-slate-500 mt-2 text-center">This AI companion is for support. In an emergency, contact local services or KIRAN Helpline 1800-599-0019.</p>
      </div>
    </div>
  );
});

// Set display names for dev tools
MessageBubble.displayName = 'MessageBubble';
MessageContent.displayName = 'MessageContent';
TypingIndicator.displayName = 'TypingIndicator';
ChatInput.displayName = 'ChatInput';
QuickReplyChips.displayName = 'QuickReplyChips';
EmojiPicker.displayName = 'EmojiPicker';

export default SarthiChatbox;