import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, limit, doc } from "firebase/firestore";
import { db } from "../services/firebase";
import { motion } from 'framer-motion';
import { Brain, AlertTriangle, TrendingUp, Calendar, RefreshCw } from 'lucide-react';
import { getUserCheckins } from '../services/userSurveyHistory';

const StressMap = ({ userId }) => {
  const [stressData, setStressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Domain configuration
  const domains = [
    'Work & Career',
    'Personal Life', 
    'Financial Security',
    'Health & Wellness',
    'Identity & Growth'
  ];

  // Color coding function based on stress score
  const getStressColor = (score) => {
    if (score === null || score === undefined) return '#f3f4f6'; // Gray for no data
    if (score >= 0 && score <= 3) return '#22c55e'; // Green (Low)
    if (score >= 4 && score <= 6) return '#eab308'; // Yellow (Moderate)
    if (score >= 7 && score <= 10) return '#ef4444'; // Red (High)
    return '#f3f4f6'; // Default gray
  };

  // Get stress level label
  const getStressLabel = (score) => {
    if (score === null || score === undefined) return 'No Data';
    if (score >= 0 && score <= 3) return 'Low';
    if (score >= 4 && score <= 6) return 'Moderate';
    if (score >= 7 && score <= 10) return 'High';
    return 'Unknown';
  };

  // Fetch stress data from Firestore using UID-based nested fetch
  const fetchStressData = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🗺️ Fetching stress map data for user ${userId}`);

      // Use UID-based nested fetch
      const allCheckins = await getUserCheckins(userId);
      
      // Sort by timestamp and get last 5
      const checkins = allCheckins
        .filter(doc => doc.timestamp)
        .sort((a, b) => {
          const aTime = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
          const bTime = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
          return bTime - aTime;
        })
        .slice(0, 5)
        .map(doc => ({
          ...doc,
          timestamp: doc.timestamp?.toDate ? doc.timestamp.toDate() : new Date(doc.timestamp)
        }));

      console.log(`✅ Fetched ${checkins.length} check-ins for stress map`);

      if (checkins.length === 0) {
        console.log('📝 No check-ins found for stress map');
        return processSampleData();
      }

      // Process the real data
      return processStressData(checkins);

    } catch (err) {
      console.error('❌ Error fetching stress map data:', err);
      throw new Error(`Failed to fetch stress data: ${err.message}`);
    }
  };

  // Process real check-in data for stress map
  const processStressData = (checkins) => {
    const domainScores = {};
    
    // Initialize domain tracking
    domains.forEach(domain => {
      domainScores[domain] = {
        scores: [],
        totalScore: 0,
        count: 0,
        average: null
      };
    });

    // Extract stress scores by domain
    checkins.forEach(checkin => {
      const checkinDomain = checkin.domain;
      
      if (checkin.responses) {
        Object.values(checkin.responses).forEach(response => {
          if (response.stressAnalysis) {
            const score = response.stressAnalysis.enhanced?.score || response.stressAnalysis.score;
            
            if (score && typeof score === 'number' && checkinDomain) {
              // Map domain names to standardized format
              const mappedDomain = mapDomainName(checkinDomain);
              
              if (domainScores[mappedDomain]) {
                domainScores[mappedDomain].scores.push(score);
                domainScores[mappedDomain].totalScore += score;
                domainScores[mappedDomain].count += 1;
              }
            }
          }
        });
      }
    });

    // Calculate averages
    Object.keys(domainScores).forEach(domain => {
      const data = domainScores[domain];
      if (data.count > 0) {
        data.average = Math.round((data.totalScore / data.count) * 10) / 10;
      }
    });

    console.log('📊 Processed stress data by domain:', domainScores);

    return {
      domainScores,
      totalCheckins: checkins.length,
      lastCheckin: checkins[0]?.timestamp || null,
      dataPoints: Object.values(domainScores).reduce((total, domain) => total + domain.count, 0)
    };
  };

  // Map various domain names to standardized format
  const mapDomainName = (domain) => {
    const lowerDomain = domain.toLowerCase();
    
    if (lowerDomain.includes('work') || lowerDomain.includes('career')) {
      return 'Work & Career';
    }
    if (lowerDomain.includes('personal') || lowerDomain.includes('relationship')) {
      return 'Personal Life';
    }
    if (lowerDomain.includes('financial') || lowerDomain.includes('money')) {
      return 'Financial Security';
    }
    if (lowerDomain.includes('health') || lowerDomain.includes('wellness')) {
      return 'Health & Wellness';
    }
    if (lowerDomain.includes('identity') || lowerDomain.includes('growth')) {
      return 'Identity & Growth';
    }
    
    // Return original if no mapping found
    return domain;
  };

  // Generate sample data when no real data exists
  const processSampleData = () => {
    console.log('📊 Generating sample stress map data');
    
    const sampleScores = {
      'Work & Career': { scores: [7, 8, 6], average: 7.0, count: 3 },
      'Personal Life': { scores: [4, 5], average: 4.5, count: 2 },
      'Financial Security': { scores: [8, 9, 7], average: 8.0, count: 3 },
      'Health & Wellness': { scores: [3, 4], average: 3.5, count: 2 },
      'Identity & Growth': { scores: [5], average: 5.0, count: 1 }
    };

    return {
      domainScores: sampleScores,
      totalCheckins: 5,
      lastCheckin: new Date(),
      dataPoints: 11,
      isSampleData: true
    };
  };

  // Refresh data
  const refreshData = () => {
    if (userId) {
      fetchStressData(userId)
        .then(data => {
          setStressData(data);
          setLastUpdated(new Date());
        })
        .catch(setError)
        .finally(() => setLoading(false));
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    refreshData();
  }, [userId]);

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading stress map...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">Error loading stress map: {error.message}</span>
          </div>
          <button 
            onClick={refreshData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!stressData || stressData.dataPoints === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="text-center py-8 text-gray-500">
          <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">No Stress Data Available</h3>
          <p className="text-sm">Complete some check-ins to see your domain stress overview!</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg border p-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Domain Stress Overview</h3>
          <p className="text-sm text-gray-600">
            Based on {stressData.dataPoints} data points from last {stressData.totalCheckins} check-ins
            {stressData.isSampleData && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                Sample Data
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refreshData}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stress Map Heatmap */}
      <div className="space-y-3">
        {domains.map((domain) => {
          const domainData = stressData.domainScores[domain];
          const average = domainData?.average;
          const count = domainData?.count || 0;
          const color = getStressColor(average);
          const label = getStressLabel(average);

          return (
            <motion.div
              key={domain}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: domains.indexOf(domain) * 0.1 }}
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Domain Label */}
              <div className="w-40 text-sm font-medium text-gray-700">
                {domain}
              </div>

              {/* Stress Bar */}
              <div className="flex-1 relative">
                <div className="h-8 bg-gray-100 rounded-md overflow-hidden">
                  <div
                    className="h-full transition-all duration-500 ease-out flex items-center justify-center"
                    style={{
                      backgroundColor: color,
                      width: average !== null ? `${(average / 10) * 100}%` : '0%'
                    }}
                  >
                    {average !== null && (
                      <span className="text-white text-xs font-medium">
                        {average.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stress Level Label */}
              <div className="w-20 text-sm text-right">
                <span
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: color,
                    color: average !== null && average >= 4 ? 'white' : '#374151'
                  }}
                >
                  {label}
                </span>
              </div>

              {/* Data Count */}
              <div className="w-16 text-xs text-gray-500 text-right">
                {count > 0 ? `${count} pts` : 'No data'}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Stress Level:</span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }}></div>
              <span className="text-xs text-gray-600">Low (0-3)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#eab308' }}></div>
              <span className="text-xs text-gray-600">Moderate (4-6)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
              <span className="text-xs text-gray-600">High (7-10)</span>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {stressData.lastCheckin && (
          <div className="mt-3 flex items-center text-xs text-gray-500">
            <Calendar className="h-3 w-3 mr-1" />
            Last check-in: {stressData.lastCheckin.toLocaleDateString()}
            <TrendingUp className="h-3 w-3 ml-3 mr-1" />
            {stressData.dataPoints} total stress data points analyzed
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StressMap;