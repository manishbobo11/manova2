import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, Heart, DollarSign, User, Brain } from "lucide-react";

// Domain icon mapping
const domainIcons = {
  "Work & Career": Activity,
  "Personal Life": Heart,
  "Financial Stress": DollarSign,
  "Health": Activity,
  "Self-Worth & Identity": User,
  "default": Brain
};

// ✅ 1. Pass currentCheckinData as prop (not whole user history)
const WellnessScore = ({ currentCheckinData, className = "" }) => {
  const [domainScores, setDomainScores] = useState([]);
  const [overallScore, setOverallScore] = useState(null);
  const [mood, setMood] = useState("");

  // 📌 Format of `currentCheckinData` expected:
  // [
  //   { domain: "Work & Career", score: 45 },
  //   { domain: "Personal Life", score: 33 },
  //   ...
  // ]

  useEffect(() => {
    if (!currentCheckinData) return;

    setDomainScores(currentCheckinData);

    // Calculate weighted wellness score
    const scores = currentCheckinData.map((d) => 100 - d.score); // reverse stress to wellness
    const average = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length / 10);
    setOverallScore(average);

    // Mood mapping
    if (average >= 8) setMood("You're thriving 🎉");
    else if (average >= 6) setMood("Managing Well");
    else if (average >= 4) setMood("Needs Attention");
    else setMood("High Stress Detected");
  }, [currentCheckinData]);

  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-600 bg-green-100";
    if (score >= 6) return "text-blue-600 bg-blue-100";
    if (score >= 4) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getDomainColor = (score) => {
    if (score <= 25) return "text-green-600";
    if (score <= 50) return "text-blue-600";
    if (score <= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score) => {
    if (score <= 25) return "bg-green-500";
    if (score <= 50) return "bg-blue-500";
    if (score <= 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (!currentCheckinData || currentCheckinData.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No wellness data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {/* Overall Score Section - Updated to match your design */}
      {overallScore !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold">Your Wellness Score</h1>
          <div className="text-5xl font-semibold text-yellow-500 mt-2">{overallScore}/10</div>
          <p className="mt-2 text-gray-600">{mood}</p>
        </motion.div>
      )}

      {/* Domain Breakdown - Updated to match your design */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {domainScores.map(({ domain, score }) => {
          const label =
            score < 40 ? "Good" :
            score < 60 ? "Moderate Concern" :
            "High Concern";

          const labelColor =
            label === "Good" ? "bg-blue-100 text-blue-700" :
            label === "Moderate Concern" ? "bg-yellow-100 text-yellow-700" :
            "bg-red-100 text-red-700";

          return (
            <motion.div
              key={domain}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg p-4 shadow border"
            >
              <div className="text-sm font-medium text-gray-600 mb-1">{domain}</div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Stress Level</span>
                <span className="text-sm font-semibold">{score}%</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="bg-yellow-400 h-2"
                />
              </div>
              <div className={`mt-2 text-xs px-2 py-1 rounded-full w-fit ${labelColor}`}>
                {label}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      {overallScore !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-blue-50 rounded-lg"
        >
          <h4 className="font-semibold text-blue-900 mb-2">Summary</h4>
          <p className="text-blue-800 text-sm">
            {overallScore >= 8 
              ? "Excellent! You're maintaining great wellness across all domains."
              : overallScore >= 6
              ? "Good progress! Consider focusing on areas with higher stress levels."
              : overallScore >= 4
              ? "You may benefit from additional support in managing stress."
              : "Consider reaching out for professional support to help manage high stress levels."
            }
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default WellnessScore; 