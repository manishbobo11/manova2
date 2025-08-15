import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import StreamingSarthiChat from '../components/StreamingSarthiChat';

const StreamingChatDemo = () => {
  const { currentUser } = useAuth();
  
  // Use actual user ID from auth, with fallback for demo
  const userId = currentUser?.uid || 'demo-user-123';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Streaming Sarthi - AI Wellness Companion
          </h1>
          <p className="text-lg text-gray-600">
            Real-time streaming chat with typing indicators and error handling
          </p>
        </div>
        
        <StreamingSarthiChat userId={userId} />
      </div>
    </div>
  );
};

export default StreamingChatDemo;

