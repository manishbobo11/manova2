import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Brain, AlertTriangle, Calendar, Target } from 'lucide-react';
import { useMoodData } from '../hooks/useMoodData';
import { generateMoodInsights } from '../services/ai/moodAnalytics';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MoodTrackingDashboard = ({ userId }) => {
  const { moodData, loading, error } = useMoodData(userId);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [insights, setInsights] = useState(null);
  const [predictiveData, setPredictiveData] = useState(null);

  useEffect(() => {
    if (moodData && moodData.entries?.length > 0) {
      generateMoodInsights(moodData, selectedPeriod)
        .then(setInsights)
        .catch(console.error);
    }
  }, [moodData, selectedPeriod]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
        <p>Error loading mood data: {error}</p>
      </div>
    );
  }

  const moodTrendData = {
    labels: moodData?.dates || [],
    datasets: [
      {
        label: 'Mood Score',
        data: moodData?.moodScores || [],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Stress Level',
        data: moodData?.stressLevels || [],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const moodTrendOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Mood & Stress Trends',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(99, 102, 241, 0.5)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time Period'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Score (1-10)'
        },
        min: 1,
        max: 10,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const moodDistributionData = {
    labels: ['Excellent', 'Good', 'Neutral', 'Poor', 'Very Poor'],
    datasets: [
      {
        data: moodData?.moodDistribution || [0, 0, 0, 0, 0],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(156, 163, 175, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(156, 163, 175)',
          'rgb(251, 146, 60)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const triggersData = {
    labels: moodData?.topTriggers?.map(t => t.trigger) || [],
    datasets: [
      {
        label: 'Impact Frequency',
        data: moodData?.topTriggers?.map(t => t.frequency) || [],
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
      },
    ],
  };

  const MoodInsightCard = ({ title, value, trend, icon: Icon, color }) => (
    <motion.div
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {trend && (
            <div className="flex items-center mt-1">
              {trend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(trend)}% vs last period
              </span>
            </div>
          )}
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </motion.div>
  );

  const PredictiveInsightCard = ({ insight }) => (
    <motion.div
      className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-start space-x-3">
        <Brain className="h-6 w-6 text-purple-600 mt-1" />
        <div>
          <h3 className="font-semibold text-purple-900 mb-2">AI Prediction</h3>
          <p className="text-purple-800 text-sm leading-relaxed">{insight}</p>
        </div>
      </div>
    </motion.div>
  );

  const TriggerCard = ({ trigger, frequency, impact }) => (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-indigo-300 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900">{trigger}</h4>
        <span className="text-sm text-gray-500">{frequency} times</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${impact}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mood Analytics</h1>
          <p className="text-gray-600 mt-1">AI-powered insights into your emotional wellbeing</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MoodInsightCard
          title="Average Mood"
          value={moodData?.averageMood?.toFixed(1) || '0.0'}
          trend={insights?.moodTrend}
          icon={Calendar}
          color="text-blue-600"
        />
        <MoodInsightCard
          title="Stress Level"
          value={moodData?.averageStress?.toFixed(1) || '0.0'}
          trend={insights?.stressTrend}
          icon={AlertTriangle}
          color="text-red-600"
        />
        <MoodInsightCard
          title="Mood Stability"
          value={`${moodData?.stabilityScore || 0}%`}
          trend={insights?.stabilityTrend}
          icon={Target}
          color="text-green-600"
        />
        <MoodInsightCard
          title="Risk Score"
          value={moodData?.riskScore || '0'}
          trend={insights?.riskTrend}
          icon={Brain}
          color="text-purple-600"
        />
      </div>

      {/* Predictive Insights */}
      {insights?.predictiveInsight && (
        <PredictiveInsightCard insight={insights.predictiveInsight} />
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mood Trend Chart */}
        <motion.div
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Line data={moodTrendData} options={moodTrendOptions} />
        </motion.div>

        {/* Mood Distribution */}
        <motion.div
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold mb-4">Mood Distribution</h3>
          <div className="h-64">
            <Doughnut
              data={moodDistributionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Triggers and Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Triggers */}
        <motion.div
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold mb-4">Top Mood Triggers</h3>
          <div className="space-y-3">
            {moodData?.topTriggers?.map((trigger, index) => (
              <TriggerCard
                key={index}
                trigger={trigger.trigger}
                frequency={trigger.frequency}
                impact={trigger.impact}
              />
            )) || <p className="text-gray-500 text-center py-4">No triggers identified yet</p>}
          </div>
        </motion.div>

        {/* Trigger Impact Chart */}
        <motion.div
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold mb-4">Trigger Impact Analysis</h3>
          {moodData?.topTriggers?.length > 0 ? (
            <Bar
              data={triggersData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Frequency'
                    }
                  }
                }
              }}
            />
          ) : (
            <p className="text-gray-500 text-center py-8">No trigger data available</p>
          )}
        </motion.div>
      </div>

      {/* AI Recommendations */}
      {insights?.recommendations && (
        <motion.div
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold mb-4">AI Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.recommendations.map((rec, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{rec.title}</h4>
                <p className="text-sm text-gray-600">{rec.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MoodTrackingDashboard;

