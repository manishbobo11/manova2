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
          <button className={`mt-4 ${componentPatterns.buttons.primary.base} ${componentPatterns.buttons.primary.default}`}>
            Begin Check-In
          </button>
        </div>
      </div>

      {/* View Analytics Card */}
      <div className={componentPatterns.cards.base}>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-neutral-700">View Analytics</h2>
          <p className="text-neutral-500 text-sm mt-1">Explore trends and progress insights</p>
          <button className={`mt-4 ${componentPatterns.buttons.secondary.base} ${componentPatterns.buttons.secondary.default}`}>
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions; 