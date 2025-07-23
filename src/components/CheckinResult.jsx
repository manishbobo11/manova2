import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

const CheckinResult = () => {
  const { lastCheckin, domainScores, userMood, dominantEmotions } = useContext(UserContext);
  const topConcerns = domainScores.sort((a, b) => b.score - a.score).slice(0, 2);

  const getStatusColor = (score) => {
    if (score < 35) return { label: "Good", color: "text-green-600", bg: "bg-green-50" };
    if (score < 55) return { label: "Moderate Concern", color: "text-yellow-700", bg: "bg-yellow-50" };
    return { label: "High Concern", color: "text-red-600", bg: "bg-red-50" };
  };

  return (
    <div className="min-h-screen px-6 py-12 max-w-7xl mx-auto space-y-10 text-gray-800 bg-gradient-to-b from-white via-blue-50 to-white">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">Your Wellness Score</h1>
        <div className="text-6xl font-bold text-yellow-500">{lastCheckin?.wellnessScore || 0}/10</div>
        <p className="text-lg text-gray-600 capitalize">{userMood}</p>
      </div>

      <div className="bg-white border border-gray-100 shadow-md rounded-xl p-6 text-sm">
        <p><strong>🧠 Summary:</strong> Based on your recent responses, your emotional tone reflects <b>{dominantEmotions.tone}</b> — keywords: <i>{dominantEmotions.keywords.join(", ")}</i>.</p>
        <p className="mt-1">Focus on <b>{topConcerns.map(d => d.domain).join(" & ")}</b> as they show elevated stress signals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {domainScores.map(({ domain, score }) => {
          const { label, color, bg } = getStatusColor(score);
          return (
            <div key={domain} className="bg-white border rounded-lg p-5 shadow-sm">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-700">{domain}</h3>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${bg} ${color}`}>{label}</span>
              </div>
              <div className="mt-3 w-full h-2 bg-gray-200 rounded-full">
                <div
                  className={`h-2 rounded-full ${score > 55 ? 'bg-red-500' : score > 35 ? 'bg-yellow-400' : 'bg-green-500'}`}
                  style={{ width: `${score}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-600 mt-2">Stress Level: {score}%</div>
            </div>
          );
        })}
      </div>

      <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-xl shadow-md text-gray-800 text-sm">
        <p><strong>💡 AI Suggestion:</strong> You're doing okay overall, but the data suggests recurring tension in <b>{topConcerns[0]?.domain}</b>. Consider journaling or talking with someone about this theme before it intensifies.</p>
      </div>

      <div className="flex justify-center gap-4 pt-6">
        <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">View Full Dashboard</button>
        <button className="bg-white border border-gray-300 px-6 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition">Take Survey Again</button>
      </div>
    </div>
  );
};

export default CheckinResult; 