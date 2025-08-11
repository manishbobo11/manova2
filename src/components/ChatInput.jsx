/**
 * Optimized Chat Input Component
 * Handles user input with focus management and performance optimization
 */

import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import { Send, RotateCcw } from 'lucide-react';

const ChatInput = memo(({ 
  onSendMessage, 
  isLoading = false, 
  isTyping = false, 
  currentSessionId = null,
  placeholder = "Share what's on your mind...",
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  // Handle input change without debouncing for immediate UI response
  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value);
  }, []);

  // Handle send message
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading || isTyping || disabled) return;

    const messageToSend = inputValue.trim();
    setInputValue(''); // Clear input immediately for better UX
    
    try {
      await onSendMessage(messageToSend);
      
      // Maintain focus on input after sending
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    } catch (error) {
      // Restore input on error
      setInputValue(messageToSend);
      console.error('Error sending message:', error);
    }
  }, [inputValue, isLoading, isTyping, disabled, onSendMessage]);

  // Handle key down (replaces deprecated onKeyPress)
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Auto-focus when session is ready (debounced to prevent conflicts)
  useEffect(() => {
    if (currentSessionId && inputRef.current && !disabled && !inputValue) {
      // Only auto-focus if input is empty to avoid interrupting typing
      const timer = setTimeout(() => {
        if (inputRef.current && !document.activeElement === inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentSessionId, disabled, inputValue]);

  // Check if we can send
  const canSend = inputValue.trim() && !isLoading && !isTyping && currentSessionId && !disabled;

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={currentSessionId ? placeholder : "Connecting to Sarthi..."}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-base font-medium transition-all duration-200"
            rows="2"
            disabled={disabled || isLoading || isTyping || !currentSessionId}
            autoFocus={false} // Prevent auto-focus on re-render
          />
        </div>
        <button
          onClick={handleSendMessage}
          disabled={!canSend}
          className={`p-3 rounded-lg font-medium transition-all duration-200 ${
            canSend
              ? 'bg-blue-600 text-white hover:bg-blue-700 hover:text-white shadow-md'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading || isTyping ? (
            <RotateCcw className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
      <p className="text-sm text-gray-700 mt-2 font-medium">
        This AI assistant is for support and guidance. In case of emergency, please call 911.
      </p>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;