import React, { useState } from 'react';
// Navbar is now handled globally in App.jsx
import DeepDiveUI from './DeepDiveUI';

const DeepDiveSection = () => {
  const [selectedStressTags, setSelectedStressTags] = useState([]);
  const [additionalThoughts, setAdditionalThoughts] = useState('');

  // Sample stress options - you can replace with your actual data
  const stressOptions = [
    'Work pressure',
    'Financial concerns',
    'Relationship issues',
    'Health problems',
    'Sleep difficulties',
    'Social anxiety',
    'Family stress',
    'Academic pressure',
    'Technology overload',
    'Environmental factors'
  ];

  const handleStressTagsChange = (tags) => {
    setSelectedStressTags(tags);
  };

  const handleContinue = () => {
    // Handle continue logic here
    console.log('Selected stress tags:', selectedStressTags);
    console.log('Additional thoughts:', additionalThoughts);
  };

  const handleSkip = () => {
    // Handle skip logic here
    console.log('Skipping deep dive');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full px-6 lg:px-16 py-10 bg-gradient-to-b from-blue-50 to-blue-100 min-h-screen">
      {/* Left: Main content */}
      <div className="flex-1 space-y-6">

        <div className="bg-white shadow-xl rounded-2xl p-6 space-y-4">
          <h2 className="text-3xl font-bold text-gray-900 leading-tight">Deep Dive: Health</h2>
          <p className="text-gray-700">Let's explore what's contributing to your stress</p>

          {/* Stress contributors */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">What's contributing to your stress?</h3>
            <DeepDiveUI
              stressOptions={stressOptions}
              selectedStressTags={selectedStressTags}
              onStressTagsChange={handleStressTagsChange}
              maxSelections={3}
              placeholder="Choose stress contributors..."
              className="rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
            {selectedStressTags.length > 0 && (
              <p className="text-green-600 font-medium">
                ✅ You've selected {selectedStressTags.length} stress contributor{selectedStressTags.length !== 1 ? 's' : ''}.
              </p>
            )}
          </div>

          {/* Additional Thoughts */}
          <div className="mt-4">
            <label htmlFor="additional-thoughts" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Thoughts
            </label>
            <textarea
              id="additional-thoughts"
              value={additionalThoughts}
              onChange={(e) => setAdditionalThoughts(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Anything else you'd like to share?"
              rows={4}
            />
          </div>

          {/* Continue Button */}
          <div className="pt-4">
          <button 
            onClick={handleContinue}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow-lg hover:scale-[1.05] transition ease-in-out duration-200"
          >
            Continue
          </button>
          <p 
            onClick={handleSkip}
            className="text-sm text-center text-gray-500 mt-2 cursor-pointer hover:text-gray-700"
          >
            Skip Deep Dive
          </p>
          </div>
        </div>
      </div>

      {/* Right: Progress + Tips */}
      <div className="hidden lg:flex flex-col gap-6 w-[300px]">
        <div className="bg-white p-4 rounded-xl shadow">
          <h4 className="font-semibold text-gray-700">Progress</h4>
          <p className="text-sm">
            Questions Answered: <strong>2</strong>
          </p>
          <p className="text-sm">
            Stress Contributors: <strong>{selectedStressTags.length}/3</strong>
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-xl shadow text-green-800 text-sm">
          ✅ Be honest with your responses for better insights
          <br />
          ✅ Take your time to reflect
          <br />
          ✅ Share additional thoughts
        </div>

        <div className="bg-purple-50 p-4 rounded-xl shadow text-purple-800 text-sm">
          💡 This is a safe space. Your responses help us support you better.
        </div>
      </div>
    </div>
  );
};

export default DeepDiveSection; 