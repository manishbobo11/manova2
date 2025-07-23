import React from 'react';
import SarthiChatbot from './SarthiChatbot';
import { ChatProvider } from '../contexts/ChatContext';

const SarthiChatbotDemo = () => {
  // Demo user ID - replace with actual user ID from auth
  const demoUserId = 'demo-user-123';

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
        
        <ChatProvider userId={demoUserId}>
          <SarthiChatbot userId={demoUserId} />
        </ChatProvider>
      </div>
    </div>
  );
};

export default SarthiChatbotDemo;