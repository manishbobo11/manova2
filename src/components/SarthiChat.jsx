import React, { useState, useRef, useEffect } from 'react';

const SarthiChat = ({ userId, language = 'en' }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const sendMessage = async (useStreaming = false) => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message to chat
    const newUserMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      if (useStreaming) {
        // Streaming response
        setIsStreaming(true);
        setStreamingContent('');
        
        const response = await fetch('/api/sarthi/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
            userId,
            language,
            chatHistory: messages.slice(-6) // Last 3 exchanges
          })
        });

        if (!response.ok) throw new Error('Streaming failed');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.content) {
                setStreamingContent(prev => prev + data.content);
              }
              if (data.done) {
                setIsStreaming(false);
                setIsLoading(false);
                
                // Add Sarthi's response to chat
                const sarthiMessage = {
                  id: Date.now() + 1,
                  role: 'assistant',
                  content: streamingContent + data.content,
                  timestamp: new Date(),
                  isCrisis: data.isCrisis || false
                };
                
                setMessages(prev => [...prev, sarthiMessage]);
                setStreamingContent('');
                return;
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming chunk:', parseError);
            }
          }
        }
      } else {
        // Regular response
        const response = await fetch('/api/sarthi/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
            userId,
            language,
            chatHistory: messages.slice(-6) // Last 3 exchanges
          })
        });

        if (!response.ok) throw new Error('Chat failed');

        const data = await response.json();
        
        // Add Sarthi's response to chat
        const sarthiMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.content,
          timestamp: new Date(),
          isCrisis: data.isCrisis || false,
          intent: data.intent?.intent,
          confidence: data.confidence
        };
        
        setMessages(prev => [...prev, sarthiMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'I\'m having trouble processing that right now. Could you try again?',
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(false); // Use regular response
  };

  const handleStreamingSubmit = (e) => {
    e.preventDefault();
    sendMessage(true); // Use streaming response
  };

  const clearChat = () => {
    setMessages([]);
    setStreamingContent('');
  };

  const getUserContext = async () => {
    try {
      const response = await fetch(`/api/sarthi/context/${userId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('User Context:', data);
        alert(`User Context loaded! Recent intents: ${data.context?.recentIntents?.map(i => i.intent).join(', ')}`);
      }
    } catch (error) {
      console.error('Error fetching user context:', error);
    }
  };

  return (
    <div className="sarthi-chat-container" style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      border: '1px solid #e0e0e0', 
      borderRadius: '8px',
      height: '600px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '16px', 
        backgroundColor: '#f8f9fa', 
        borderBottom: '1px solid #e0e0e0',
        borderRadius: '8px 8px 0 0'
      }}>
        <h3 style={{ margin: 0, color: '#333' }}>Sarthi - AI Friend & Therapist</h3>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
          Language: {language.toUpperCase()} | User: {userId}
        </div>
      </div>

      {/* Messages */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '16px',
        backgroundColor: '#fff'
      }}>
        {messages.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            color: '#666', 
            marginTop: '20px',
            fontStyle: 'italic'
          }}>
            Start a conversation with Sarthi...
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              marginBottom: '12px',
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: '18px',
                backgroundColor: message.role === 'user' 
                  ? '#007bff' 
                  : message.isCrisis 
                    ? '#dc3545' 
                    : message.isError 
                      ? '#ffc107'
                      : '#f8f9fa',
                color: message.role === 'user' ? '#fff' : '#333',
                fontSize: '14px',
                lineHeight: '1.4'
              }}
            >
              <div>{message.content}</div>
              {message.intent && (
                <div style={{ 
                  fontSize: '10px', 
                  opacity: 0.7, 
                  marginTop: '4px' 
                }}>
                  Intent: {message.intent} ({(message.confidence * 100).toFixed(0)}%)
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Streaming content */}
        {isStreaming && streamingContent && (
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              maxWidth: '70%',
              padding: '12px 16px',
              borderRadius: '18px',
              backgroundColor: '#f8f9fa',
              color: '#333',
              fontSize: '14px',
              lineHeight: '1.4'
            }}>
              {streamingContent}
              <span style={{ animation: 'blink 1s infinite' }}>|</span>
            </div>
          </div>
        )}
        
        {/* Loading indicator */}
        {isLoading && !isStreaming && (
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '18px',
              backgroundColor: '#f8f9fa',
              color: '#666'
            }}>
              Sarthi is thinking...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ 
        padding: '16px', 
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#f8f9fa',
        borderRadius: '0 0 8px 8px'
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '20px',
              fontSize: '14px'
            }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            style={{
              padding: '12px 16px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Send
          </button>
          <button
            type="button"
            onClick={handleStreamingSubmit}
            disabled={isLoading || !inputMessage.trim()}
            style={{
              padding: '12px 16px',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Stream
          </button>
        </form>
        
        {/* Controls */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginTop: '8px',
          justifyContent: 'center'
        }}>
          <button
            onClick={clearChat}
            style={{
              padding: '8px 12px',
              backgroundColor: '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Clear Chat
          </button>
          <button
            onClick={getUserContext}
            style={{
              padding: '8px 12px',
              backgroundColor: '#17a2b8',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Get Context
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default SarthiChat;
