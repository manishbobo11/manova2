import React from 'react';
import { Line } from 'react-chartjs-2';
import { Brain } from 'lucide-react';

const WellnessGraph = ({ checkins = [] }) => {
  // Function to calculate wellness score from responses
  const calculateWellnessScore = (responses) => {
    if (!responses || Object.keys(responses).length === 0) return 0;
    
    const scores = Object.values(responses).map(response => {
      if (response?.stressAnalysis?.enhanced?.score) {
        return response.stressAnalysis.enhanced.score;
      } else if (response?.stressAnalysis?.score) {
        return response.stressAnalysis.score;
      } else if (typeof response === 'number') {
        return response;
      }
      return 0;
    });
    
    if (scores.length === 0) return 0;
    
    const avgStress = scores.reduce((a, b) => a + b, 0) / scores.length;
    // Convert stress score (0-10) to wellness score (10-0, inverted)
    return Math.max(1, Math.min(10, Math.round(10 - avgStress)));
  };

  // Function to calculate average stress score from responses
  const calculateStressScore = (responses) => {
    if (!responses || Object.keys(responses).length === 0) return 0;
    
    const scores = Object.values(responses).map(response => {
      if (response?.stressAnalysis?.enhanced?.score) {
        return response.stressAnalysis.enhanced.score;
      } else if (response?.stressAnalysis?.score) {
        return response.stressAnalysis.score;
      } else if (typeof response === 'number') {
        return response;
      }
      return 0;
    });
    
    if (scores.length === 0) return 0;
    
    return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
  };

  // Process checkins data for chart
  const processChartData = () => {
    if (!checkins || checkins.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Sort checkins by timestamp
    const sortedCheckins = [...checkins].sort((a, b) => {
      const aTime = a.timestamp ? new Date(a.timestamp) : new Date(0);
      const bTime = b.timestamp ? new Date(b.timestamp) : new Date(0);
      return aTime - bTime;
    });

    const labels = [];
    const wellnessScores = [];
    const stressScores = [];

    sortedCheckins.forEach(checkin => {
      // Extract date
      let date;
      if (checkin.timestamp) {
        if (typeof checkin.timestamp === 'string') {
          date = checkin.timestamp;
        } else if (checkin.timestamp.toDate) {
          date = checkin.timestamp.toDate().toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
        } else {
          date = new Date(checkin.timestamp).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
        }
      } else {
        date = 'Unknown';
      }

      // Calculate scores
      const wellnessScore = calculateWellnessScore(checkin.responses);
      const stressScore = calculateStressScore(checkin.responses);

      labels.push(date);
      wellnessScores.push(wellnessScore);
      stressScores.push(stressScore);
    });

    return {
      labels,
      datasets: [
        {
          label: 'Wellness Score',
          data: wellnessScores,
          borderColor: '#007CFF',
          backgroundColor: 'rgba(0, 124, 255, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Stress Score',
          data: stressScores,
          borderColor: '#FF6B6B',
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
  };

  const chartData = processChartData();

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Wellness & Stress Trends Over Time'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 1
        },
        title: {
          display: true,
          text: 'Score (1-10)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Check-in Date'
        }
      }
    },
    elements: {
      line: {
        tension: 0.3
      },
      point: {
        radius: 4,
        hoverRadius: 6
      }
    }
  };

  // Show fallback if no data
  if (!checkins || checkins.length === 0) {
    return (
      <div className="relative">
        <h3 className="text-xl font-bold text-black mb-6">Wellness Trends</h3>
        <div className="bg-white rounded-2xl border border-[#D8D8D8] p-8">
          <div className="flex flex-col items-center justify-center h-80 text-[#777]">
            <div className="w-16 h-16 bg-[#007CFF] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-bold mb-3 text-black">No data available</h4>
            <p className="text-center font-medium">
              Complete some check-ins to see your wellness and stress trends over time!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-black">Wellness Trends</h3>
        <div className="text-sm text-[#777] font-medium">
          {checkins.length} check-in{checkins.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="h-80 relative">
        <div className="absolute inset-0 bg-white rounded-2xl border border-[#D8D8D8]"></div>
        <div className="relative z-10 h-full p-4">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
      
      <div className="mt-6 text-sm text-[#777] text-center font-medium">
        Wellness scores are calculated from your stress responses. Higher wellness = lower stress.
      </div>
    </div>
  );
};

export default WellnessGraph;