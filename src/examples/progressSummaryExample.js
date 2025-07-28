/**
 * Example usage of the Progress Trend Analysis Service
 * This demonstrates how to use generateProgressSummary() in your components
 */

import { generateProgressSummary } from '../services/progressTrendLogic.js';

/**
 * Example: Generate progress summary for a user
 */
export const exampleProgressSummary = async () => {
  try {
    console.log('📊 Generating progress summary example...');
    
    // Replace with actual user ID from your auth context
    const userId = "demo-user-123";
    
    // Generate the comprehensive progress summary
    const progressSummary = await generateProgressSummary(userId);
    
    console.log('✅ Progress Summary Generated:', progressSummary);
    
    // Example of how to use the summary in a component
    displayProgressSummary(progressSummary);
    
    return progressSummary;
    
  } catch (error) {
    console.error('❌ Error in progress summary example:', error);
  }
};

/**
 * Example function to display the progress summary in UI
 */
const displayProgressSummary = (summary) => {
  console.log(`
🌟 USER WELLNESS PROGRESS SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 Trend: ${summary.trend}
🎭 Dominant Emotion: ${summary.dominantEmotion}
🔄 Repeat Trigger: ${summary.repeatTrigger}
📅 Timespan: ${summary.timespan || 'N/A'} days
📊 Check-ins Analyzed: ${summary.checkInsAnalyzed}
🎯 Latest Score: ${summary.lastScore || 'N/A'}
📊 Average Score: ${summary.averageScore ? Math.round(summary.averageScore) : 'N/A'}

💭 Summary:
${summary.summary}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
};

/**
 * Example: Use in a React component
 */
export const ProgressSummaryComponent = () => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const loadProgressSummary = async (userId) => {
    setLoading(true);
    try {
      const summary = await generateProgressSummary(userId);
      setProgressData(summary);
    } catch (error) {
      console.error('Error loading progress summary:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // This would be your JSX for displaying the summary
  return {
    loadProgressSummary,
    progressData,
    loading
  };
};

/**
 * Example integration with existing wellness dashboard
 */
export const integrateWithDashboard = async (userId) => {
  console.log('🔗 Integrating progress summary with dashboard...');
  
  const summary = await generateProgressSummary(userId);
  
  // Example: Update dashboard widgets
  const dashboardData = {
    // Wellness overview card
    wellnessOverview: {
      trend: summary.trend,
      score: summary.lastScore,
      change: summary.averageScore ? (summary.lastScore - summary.averageScore) : 0
    },
    
    // Emotional insight card
    emotionalInsight: {
      dominantEmotion: summary.dominantEmotion,
      summary: summary.summary.split('.')[0] + '.' // First sentence
    },
    
    // Progress timeline card
    progressTimeline: {
      timespan: summary.timespan,
      checkIns: summary.checkInsAnalyzed,
      improvement: summary.trend.includes('improvement')
    },
    
    // Action recommendations
    recommendations: {
      trigger: summary.repeatTrigger,
      suggestion: summary.summary.split('—')[1]?.trim() || 'Keep monitoring your wellness patterns.'
    }
  };
  
  console.log('📋 Dashboard integration data:', dashboardData);
  return dashboardData;
};

// Example execution (uncomment to test)
// exampleProgressSummary();