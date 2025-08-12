import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Heart, 
  AlertTriangle, 
  RotateCcw,
  RefreshCw
} from 'lucide-react';
import { generateMessageId } from '../utils/messageId';
import { useAuth } from '../contexts/AuthContext';

const StreamingSarthiChat = ({ userId, onClose }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUserMessage, setLastUserMessage] = useState('');
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle streaming response
  const handleStreamingResponse = useCallback(async (userMessage) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create abort controller for request cancellation
      abortControllerRef.current = new AbortController();
      
      // Add user message immediately
      const userMsg = {
        id: generateMessageId('user'),
        type: 'user',
        content: userMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMsg]);
      
      // Add bot message with typing status
      const botMsgId = generateMessageId('ai');
      const botMsg = {
        id: botMsgId,
        type: 'ai',
        content: '',
        status: 'typing',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      
      // Set timeout for placeholder message
      timeoutRef.current = setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === botMsgId 
            ? { ...msg, content: "I'm here—thinking through your situation…" }
            : msg
        ));
      }, 1500);

      // Get auth token for the request
      const token = await currentUser?.getIdToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Make streaming request
      const response = await fetch(`/api/sarthi/stream?message=${encodeURIComponent(userMessage)}&language=English`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Clear timeout since we got a response
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          // Handle error events
          if (line.startsWith('event: error')) {
            const nextLine = lines[lines.indexOf(line) + 1];
            if (nextLine && nextLine.startsWith('data: ')) {
              try {
                const errorData = JSON.parse(nextLine.slice(6));
                setMessages(prev => prev.map(msg => 
                  msg.id === botMsgId 
                    ? { 
                        ...msg, 
                        content: errorData.message, 
                        status: 'error',
                        error: errorData.error
                      }
                    : msg
                ));
                setError(errorData.error);
                return;
              } catch (parseError) {
                console.error('Error parsing error event:', parseError);
              }
            }
          }
          
          // Handle data events
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'content':
                  setMessages(prev => prev.map(msg => 
                    msg.id === botMsgId 
                      ? { ...msg, content: msg.content + data.content, status: 'streaming' }
                      : msg
                  ));
                  break;
                  
                case 'complete':
                  setMessages(prev => prev.map(msg => 
                    msg.id === botMsgId 
                      ? { 
                          ...msg, 
                          content: msg.content, // Keep accumulated content
                          status: 'done'
                        }
                      : msg
                  ));
                  return;
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError);
            }
          }
        }
      }

    } catch (error) {
      console.error('Streaming error:', error);
      
      if (error.name === 'AbortError') {
        // Request was cancelled
        return;
      }
      
      // Update the bot message with error
      setMessages(prev => prev.map(msg => 
        msg.status === 'typing' || msg.status === 'streaming'
          ? { 
              ...msg, 
              content: "Sorry, I'm having a hiccup. Can we try that again?",
              status: 'error',
              error: error.message
            }
          : msg
      ));
      setError(error.message);
    } finally {
      setIsLoading(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [userId]);

  // Handle send message
  const handleSendMessage = useCallback(async () => {
    const message = inputValue.trim();
    if (!message || isLoading) return;

    setInputValue('');
    setLastUserMessage(message);
    await handleStreamingResponse(message);
  }, [inputValue, isLoading, handleStreamingResponse]);

  // Handle retry
  const handleRetry = useCallback(async () => {
    if (!lastUserMessage) return;
    setError(null);
    await handleStreamingResponse(lastUserMessage);
  }, [lastUserMessage, handleStreamingResponse]);

  // Handle key press
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-blue-100">
            <Heart className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Sarthi – Your Emotional Wellness Companion</h2>
            <p className="text-base text-gray-700">Your calm, emotionally intelligent friend</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-base font-medium text-gray-700">Connected</span>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>

        {/* Error with retry */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-3"
          >
            <button
              onClick={handleRetry}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry</span>
            </button>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share what's on your mind..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-base transition-all"
              rows="1"
              style={{ minHeight: '44px', maxHeight: '120px' }}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className={`flex-shrink-0 p-3 rounded-lg font-medium transition-all ${
              inputValue.trim() && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <RotateCcw className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          This AI companion is for support. In an emergency, contact local services or KIRAN Helpline 1800-599-0019.
        </p>
      </div>
    </div>
  );
};

// Message Bubble Component
const MessageBubble = ({ message }) => {
  const isUser = message.type === 'user';
  const isTyping = message.status === 'typing';
  const isStreaming = message.status === 'streaming';
  const isError = message.status === 'error';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-start space-x-3 max-w-[78%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {!isUser && (
          <div className={`p-2 rounded-full ${isError ? 'bg-red-100' : 'bg-blue-100'}`}>
            {isError ? (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            ) : (
              <Heart className="h-5 w-5 text-blue-600" />
            )}
          </div>
        )}
        
        <div className={`px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-blue-100 text-blue-900 shadow-sm font-medium'
            : isError
            ? 'bg-red-50 border border-red-200 text-red-900'
            : 'bg-gray-100 text-gray-800'
        }`}>
          <div className="text-base leading-relaxed whitespace-pre-wrap">
            {message.content}
            {isTyping && (
              <span className="inline-block ml-1">
                <TypingIndicator />
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Typing Indicator Component
const TypingIndicator = () => {
  return (
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );
};

export default StreamingSarthiChat;
