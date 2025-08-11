import React from 'react';
import SarthiChatbot from './SarthiChatbot';
import { ChatSessionProvider } from '../contexts/ChatSessionContext';
import { useAuth } from '../contexts/AuthContext';

const SarthiChatbotDemo = () => {
  const { currentUser } = useAuth();
  
  // Use actual user ID from auth, with fallback for demo
  const userId = currentUser?.uid || 'demo-user-123';
  
  // Create user context for proper name extraction
  const userContext = {
    displayName: currentUser?.displayName || 'Demo User',
    email: currentUser?.email || 'demo@example.com',
    uid: userId
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sarthi - AI Wellness Companion
          </h1>
          <p className="text-lg text-gray-600">
            Your emotionally intelligent wellness companion
          </p>
        </div>
        
        <ChatSessionProvider userId={userId} userContext={userContext}>
          <SarthiChatbot userId={userId} />
        </ChatSessionProvider>
      </div>
    </div>
  );
};

export default SarthiChatbotDemo;