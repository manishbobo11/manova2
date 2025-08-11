import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCheckinHistory } from '../services/userSurveyHistory';
import { analyzeStressPatterns } from '../services/userContextBuilder';

const UserContext = createContext();

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children, userId }) => {
  const [userData, setUserData] = useState({
    lastCheckin: null,
    domainScores: [],
    userMood: 'neutral',
    dominantEmotions: { tone: 'neutral', keywords: [] },
    checkinHistory: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) {
        setUserData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        setUserData(prev => ({ ...prev, isLoading: true, error: null }));

        // Fetch check-in history
        const { checkins } = await getCheckinHistory(userId);
        
        if (checkins.length === 0) {
          setUserData({
            lastCheckin: null,
            domainScores: [],
            userMood: 'neutral',
            dominantEmotions: { tone: 'neutral', keywords: [] },
            checkinHistory: [],
            isLoading: false,
            error: null
          });
          return;
        }

        // Get the most recent check-in
        const lastCheckin = checkins[0];
        
        // Calculate domain scores from the last check-in
        const domainScores = calculateDomainScores(lastCheckin);
        
        // Analyze emotional patterns
        const stressPatterns = analyzeStressPatterns(checkins);
        const dominantEmotions = extractDominantEmotions(checkins);
        
        // Determine user mood based on overall wellness score
        const userMood = determineUserMood(lastCheckin.wellnessScore !== null && lastCheckin.wellnessScore !== undefined ? lastCheckin.wellnessScore : null);

        setUserData({
          lastCheckin,
          domainScores,
          userMood,
          dominantEmotions,
          checkinHistory: checkins,
          isLoading: false,
          error: null
        });

      } catch (error) {
        console.error('Error loading user data:', error);
        setUserData(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: error.message 
        }));
      }
    };

    loadUserData();
  }, [userId]);

  // Helper function to calculate domain scores
  const calculateDomainScores = (checkin) => {
    if (!checkin || !checkin.responses) return [];

    const domains = [
      'Work & Career',
      'Personal Life', 
      'Financial Stress',
      'Health',
      'Self-Worth & Identity'
    ];

    return domains.map(domain => {
      const domainResponses = Object.entries(checkin.responses)
        .filter(([questionId]) => questionId.startsWith(domain.toLowerCase().replace(/\s+/g, '_')))
        .map(([, response]) => {
          // Handle different response formats
          if (typeof response === 'object' && response.value !== undefined) {
            return response.value;
          }
          return typeof response === 'number' ? response : 0;
        });

      if (domainResponses.length === 0) {
        return { domain, score: 0 };
      }

      const averageScore = domainResponses.reduce((sum, score) => sum + score, 0) / domainResponses.length;
      const stressScore = Math.round(averageScore * 20); // Convert 0-4 scale to 0-100%

      return { domain, score: stressScore };
    });
  };

  // Helper function to extract dominant emotions
  const extractDominantEmotions = (checkins) => {
    const emotions = [];
    const keywords = [];

    // Extract emotions and keywords from recent check-ins
    checkins.slice(0, 3).forEach(checkin => {
      if (checkin.emotion) emotions.push(checkin.emotion);
      if (checkin.tags && Array.isArray(checkin.tags)) {
        keywords.push(...checkin.tags);
      }
    });

    // Count occurrences
    const emotionCount = emotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {});

    const keywordCount = keywords.reduce((acc, keyword) => {
      acc[keyword] = (acc[keyword] || 0) + 1;
      return acc;
    }, {});

    // Get most common emotion and keywords
    const dominantEmotion = Object.keys(emotionCount).length > 0 
      ? Object.keys(emotionCount).reduce((a, b) => emotionCount[a] > emotionCount[b] ? a : b)
      : 'neutral';

    const topKeywords = Object.keys(keywordCount)
      .sort((a, b) => keywordCount[b] - keywordCount[a])
      .slice(0, 3);

    return {
      tone: dominantEmotion,
      keywords: topKeywords.length > 0 ? topKeywords : ['general wellness']
    };
  };

  // Helper function to determine user mood
  const determineUserMood = (wellnessScore) => {
    if (wellnessScore === null || wellnessScore === undefined) return 'neutral';
    if (wellnessScore >= 8) return 'thriving';
    if (wellnessScore >= 6) return 'managing well';
    if (wellnessScore >= 4) return 'needs attention';
    return 'high stress';
  };

  // Function to update user data (e.g., after new check-in)
  const updateUserData = (newCheckin) => {
    setUserData(prev => {
      const newCheckins = [newCheckin, ...prev.checkinHistory];
      const newDomainScores = calculateDomainScores(newCheckin);
      const newDominantEmotions = extractDominantEmotions(newCheckins);
      const newUserMood = determineUserMood(newCheckin.wellnessScore !== null && newCheckin.wellnessScore !== undefined ? newCheckin.wellnessScore : null);

      return {
        ...prev,
        lastCheckin: newCheckin,
        domainScores: newDomainScores,
        userMood: newUserMood,
        dominantEmotions: newDominantEmotions,
        checkinHistory: newCheckins
      };
    });
  };

  const value = {
    ...userData,
    updateUserData,
    userId
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext }; 