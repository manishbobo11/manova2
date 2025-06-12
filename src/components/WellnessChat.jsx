import React, { useState, useEffect, useRef } from 'react';
import mcpService from '../services/mcp';
import { ContextStore } from '../services/firebase';
import { ChevronRight, Brain, Heart, DollarSign, Activity, User, CheckCircle, RotateCcw } from 'lucide-react';

const WellnessChat = ({ userId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [userContext, setUserContext] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadUserContext();
  }, [userId]);

  const loadUserContext = async () => {
    const context = await ContextStore.getUserContext(userId);
    setUserContext(context);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await mcpService.generateResponse(userId, userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      await loadUserContext(); // Refresh context after new message
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearContext = async () => {
    if (window.confirm('Are you sure you want to clear your wellness history? This cannot be undone.')) {
      await ContextStore.clearUserContext(userId);
      await loadUserContext();
      setMessages([]);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Wellness Assistant</h2>
        <div className="space-x-2">
          <button
            onClick={() => setShowContext(!showContext)}
            className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
          >
            {showContext ? 'Hide Context' : 'Show Context'}
          </button>
          <button
            onClick={handleClearContext}
            className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
          >
            Clear History
          </button>
        </div>
      </div>

      {showContext && userContext && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Your Wellness Context</h3>
          <p>Recent Mood: {userContext.mood || 'Not recorded'}</p>
          <p>Stress Triggers: {userContext.stressTriggers?.join(', ') || 'None identified'}</p>
          <p>Coping Strategies: {userContext.copingStrategies?.join(', ') || 'None identified'}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-100 ml-auto'
                : 'bg-gray-100'
            } max-w-[80%]`}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="bg-gray-100 p-3 rounded-lg max-w-[80%]">
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default WellnessChat; 