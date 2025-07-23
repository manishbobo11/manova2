import { useState, useEffect } from 'react';

/**
 * Hook to manage mood data for the mood tracking dashboard
 * @param {string} userId - User ID
 * @returns {Object} Mood data, loading state, and error state
 */
export const useMoodData = (userId) => {
  const [moodData, setMoodData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMoodData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Generate mock data for demonstration
        // In a real app, this would fetch from your backend/Firebase
        const mockData = generateMockMoodData();
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setMoodData(mockData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchMoodData();
    }
  }, [userId]);

  return { moodData, loading, error };
};

/**
 * Generate mock mood data for demonstration
 * @returns {Object} Mock mood data
 */
const generateMockMoodData = () => {
  const today = new Date();
  const dates = [];
  const moodScores = [];
  const stressLevels = [];
  
  // Generate data for the last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    
    // Generate realistic mood and stress data with some correlation
    const baseMood = 5 + Math.random() * 3; // Base mood between 5-8
    const baseStress = Math.max(1, 10 - baseMood + Math.random() * 2); // Inverse correlation
    
    // Add some weekly patterns (weekends typically better)
    const dayOfWeek = date.getDay();
    const weekendBonus = (dayOfWeek === 0 || dayOfWeek === 6) ? 1 : 0;
    const midweekStress = (dayOfWeek === 2 || dayOfWeek === 3) ? 1 : 0;
    
    moodScores.push(Math.min(10, Math.max(1, baseMood + weekendBonus)));
    stressLevels.push(Math.min(10, Math.max(1, baseStress + midweekStress)));
  }

  // Calculate mood distribution
  const moodDistribution = [0, 0, 0, 0, 0]; // [Excellent, Good, Neutral, Poor, Very Poor]
  moodScores.forEach(score => {
    if (score >= 8) moodDistribution[0]++;
    else if (score >= 6) moodDistribution[1]++;
    else if (score >= 4) moodDistribution[2]++;
    else if (score >= 2) moodDistribution[3]++;
    else moodDistribution[4]++;
  });

  // Generate top triggers
  const topTriggers = [
    { trigger: 'Work Pressure', frequency: 8, impact: 85 },
    { trigger: 'Sleep Issues', frequency: 6, impact: 70 },
    { trigger: 'Social Stress', frequency: 4, impact: 60 },
    { trigger: 'Financial Concerns', frequency: 3, impact: 55 },
    { trigger: 'Health Worries', frequency: 2, impact: 40 }
  ];

  // Calculate averages and scores
  const averageMood = moodScores.reduce((a, b) => a + b, 0) / moodScores.length;
  const averageStress = stressLevels.reduce((a, b) => a + b, 0) / stressLevels.length;
  const stabilityScore = Math.max(0, 100 - (calculateVariance(moodScores) * 10));
  const riskScore = Math.round((stressLevels.filter(s => s > 7).length / stressLevels.length) * 10);

  return {
    dates,
    moodScores,
    stressLevels,
    moodDistribution,
    topTriggers,
    averageMood,
    averageStress,
    stabilityScore,
    riskScore,
    entries: dates.map((date, i) => ({
      date,
      mood: moodScores[i],
      stress: stressLevels[i],
      timestamp: new Date(today.getTime() - (29 - i) * 24 * 60 * 60 * 1000).toISOString()
    }))
  };
};

/**
 * Calculate variance for stability score
 * @param {number[]} values - Array of values
 * @returns {number} Variance
 */
const calculateVariance = (values) => {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  return variance;
};
