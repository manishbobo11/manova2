import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Brain, BarChart3 } from 'lucide-react';

const WellnessGraph = React.memo(({ checkins = [] }) => {
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

  // ENHANCED: Process checkins data for dual-line chart (wellness vs avgStressScore)
  const processChartData = useMemo(() => {
    if (!checkins || checkins.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    const labels = [];
    const wellnessScores = [];
    const avgStressScores = [];

    checkins.forEach(checkin => {
      // Format date properly for X-axis
      let formattedDate = 'Unknown';
      if (checkin.createdAt?.toDate) {
        formattedDate = checkin.createdAt.toDate().toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      } else if (checkin.timestamp) {
        const date = new Date(checkin.timestamp);
        formattedDate = date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      } else if (checkin.date) {
        formattedDate = checkin.date;
      }
      
      // Use the pre-calculated scores from Dashboard, ensure valid numbers
      const wellnessScore = typeof checkin.wellnessScore === 'number' ? checkin.wellnessScore : 0;
      const avgStressScore = typeof checkin.avgStressScore === 'number' ? checkin.avgStressScore : 0;
      
      // Always add data points (even with 0 scores for consistency)
      labels.push(formattedDate);
      wellnessScores.push(wellnessScore);
      avgStressScores.push(avgStressScore);
    });

    return {
      labels,
      datasets: [
        {
          label: 'Wellness Score',
          data: wellnessScores,
          borderColor: '#10B981', // Emerald green
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: false,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        },
        {
          label: 'Average Domain Stress',
          data: avgStressScores,
          borderColor: '#EF4444', // Red
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: false,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#EF4444',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        }
      ]
    };
  }, [checkins]);

  const chartData = processChartData;

  // ENHANCED: Chart options for better dual-line visualization
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          font: {
            weight: 'bold',
            size: 12
          },
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Wellness vs Domain Stress Trends',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: 20
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#007CFF',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 1,
          font: {
            weight: 'bold'
          }
        },
        title: {
          display: true,
          text: 'Score (0-10)',
          font: {
            weight: 'bold',
            size: 14
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Check-in Date',
          font: {
            weight: 'bold',
            size: 14
          }
        },
        ticks: {
          font: {
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 3
      },
      point: {
        radius: 5,
        hoverRadius: 8,
        borderWidth: 2
      }
    }
  };

  // Show fallback if no data or only 1 check-in (need 2+ for trends)
  if (!checkins || checkins.length === 0) {
    return (
      <div className="relative">
        <h3 className="text-xl font-bold text-black mb-6">Wellness Trends</h3>
        <div className="bg-white rounded-2xl border border-gray-300 p-8">
          <div className="flex flex-col items-center justify-center h-80 text-gray-600">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
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

  // Show placeholder if only 1 check-in (need 2+ for trends)
  if (checkins.length === 1) {
    return (
      <div className="relative">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-black">Wellness Trends</h3>
          <div className="text-sm text-gray-600 font-medium">
            1 check-in
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-300 p-8">
          <div className="flex flex-col items-center justify-center h-80 text-gray-600">
            <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-bold mb-3 text-black">More check-ins needed to show trends</h4>
            <p className="text-center font-medium max-w-md">
              Complete at least one more check-in to start seeing your wellness and stress trends over time.
            </p>
            <div className="mt-4 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 font-medium">
                Current Wellness Score: {checkins[0]?.wellnessScore || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-black">Wellness Trends</h3>
        <div className="text-sm text-gray-600 font-medium">
          {checkins.length} check-in{checkins.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="h-80 relative">
        <div className="absolute inset-0 bg-white rounded-2xl border border-gray-300"></div>
        <div className="relative z-10 h-full p-4">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-600 text-center font-medium">
        Wellness scores are calculated from your stress responses. Higher wellness = lower stress.
      </div>
    </div>
  );
});

export default WellnessGraph;