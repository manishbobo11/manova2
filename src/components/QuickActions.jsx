import React from 'react';
import { componentPatterns } from '../utils/designSystem.js';

const QuickActions = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Start Assessment Card */}
      <div className={componentPatterns.cards.base}>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-neutral-700">Start Assessment</h2>
          <p className="text-neutral-500 text-sm mt-1">Track and assess your wellness regularly</p>
          <button 
            className="mt-4 font-medium px-6 py-2 rounded-lg transition-colors duration-200"
            style={{ 
              backgroundColor: '#2563eb',
              color: '#ffffff'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#1d4ed8';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#2563eb';
            }}
          >
            <span style={{ color: '#ffffff' }}>Begin Check-In</span>
          </button>
        </div>
      </div>

      {/* View Analytics Card */}
      <div className={componentPatterns.cards.base}>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-neutral-700">View Analytics</h2>
          <p className="text-neutral-500 text-sm mt-1">Explore trends and progress insights</p>
          <button className="mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors duration-200 border border-gray-300">
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions; 