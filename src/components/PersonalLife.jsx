import React, { useState } from 'react';

const feedbackMap = {
  0: {
    emoji: "😓",
    msg: "It looks like you haven't had any time to recharge. That's okay—life gets busy. But let's work on creating space for your well-being.",
    tip: "Even 10 minutes a day doing what calms you—walk, music, journaling—can reset your mind."
  },
  1: {
    emoji: "😟",
    msg: "You've rarely had time to restore yourself. That might be silently draining your energy.",
    tip: "What's one activity you enjoyed in the past but stopped? Let's reintroduce that this week."
  },
  2: {
    emoji: "😐",
    msg: "You're sometimes taking time for yourself. Let's turn this into a routine, not an exception.",
    tip: "Can you protect 30 minutes a week just for you? Call it your 'non-negotiable time.'"
  },
  3: {
    emoji: "🙂",
    msg: "You're often recharging — that's great! Let's find ways to deepen that routine.",
    tip: "Think about adding small rituals like a mid-week walk, screen detox, or weekend reflection."
  },
  4: {
    emoji: "😌",
    msg: "Amazing! You're prioritizing your well-being. That's the kind of balance others strive for.",
    tip: "Want to mentor someone else struggling with stress? Giving back multiplies your peace."
  }
};

const options = [
  "Never",
  "Rarely",
  "Sometimes",
  "Often",
  "Very Often"
];

export default function PersonalLife() {
  const [selectedScore, setSelectedScore] = useState(null);

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-indigo-700">Personal Life: Self-Care & Restoration</h2>
      <div className="mb-4 text-gray-800 font-medium">
        In the past month, how often have you been able to engage in activities that genuinely restore and energize you?
      </div>
      <div className="flex flex-col gap-3 mb-4">
        {options.map((label, idx) => (
          <label key={idx} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${selectedScore === idx ? 'bg-indigo-50 border-indigo-400' : 'bg-gray-50 border-gray-200 hover:border-indigo-300'}`}>
            <input
              type="radio"
              name="selfcare-frequency"
              value={idx}
              checked={selectedScore === idx}
              onChange={() => setSelectedScore(idx)}
              className="mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-gray-900 font-medium">{label}</span>
          </label>
        ))}
      </div>
      {selectedScore !== null && feedbackMap[selectedScore] && (
        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 animate-fade-in">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">{feedbackMap[selectedScore].emoji}</span>
            <span className="text-blue-900 font-semibold">{feedbackMap[selectedScore].msg}</span>
          </div>
          <div className="text-blue-700 text-sm pl-8">{feedbackMap[selectedScore].tip}</div>
        </div>
      )}
    </div>
  );
} 