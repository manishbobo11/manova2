/**
 * Therapist Matching Service - Core Function
 * Matches therapist specialization to user's top stress domain
 */

import { therapistDatabase } from '../data/therapists';

/**
 * Get therapist recommendations based on user's stress tags/domains
 * @param {Array} userStressTags - Array of stress domains like ['Work Stress', 'Anxiety', 'Relationships']
 * @returns {Array} Array of recommended therapists sorted by match score
 */
export const getTherapistRecommendations = (userStressTags) => {
  try {
    console.log('🔍 Matching therapists for stress tags:', userStressTags);
    
    if (!userStressTags || userStressTags.length === 0) {
      console.log('⚠️ No stress tags provided, returning general therapists');
      return getGeneralTherapists();
    }

    // Score each therapist based on specialization match
    const scoredTherapists = therapistDatabase.map(therapist => {
      const matchScore = calculateSpecializationMatch(userStressTags, therapist.specializations);
      
      return {
        ...therapist,
        matchScore: matchScore,
        matchReason: generateMatchReason(userStressTags, therapist.specializations)
      };
    });

    // Sort by match score (highest first) and return top matches
    const topMatches = scoredTherapists
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6); // Return top 6 therapists

    console.log('✅ Found therapist matches:', topMatches.length);
    return topMatches;

  } catch (error) {
    console.error('❌ Error matching therapists:', error);
    return getGeneralTherapists();
  }
};

/**
 * Calculate match score between user stress tags and therapist specializations
 * @param {Array} userStressTags - User's stress domains
 * @param {Array} therapistSpecializations - Therapist's specialization areas
 * @returns {number} Match score between 0-100
 */
const calculateSpecializationMatch = (userStressTags, therapistSpecializations) => {
  if (!therapistSpecializations || therapistSpecializations.length === 0) {
    return 30; // Base score for general therapists
  }

  let totalScore = 0;
  let maxPossibleScore = userStressTags.length * 100;

  userStressTags.forEach(userTag => {
    let bestMatch = 0;
    
    therapistSpecializations.forEach(therapistSpec => {
      const matchScore = calculateIndividualMatch(userTag, therapistSpec);
      bestMatch = Math.max(bestMatch, matchScore);
    });
    
    totalScore += bestMatch;
  });

  // Calculate percentage match
  const matchPercentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 30;
  
  // Ensure minimum score of 30 and maximum of 100
  return Math.min(100, Math.max(30, Math.round(matchPercentage)));
};

/**
 * Calculate match score between individual stress tag and therapist specialization
 * @param {string} userTag - User's stress domain
 * @param {string} therapistSpec - Therapist's specialization
 * @returns {number} Match score between 0-100
 */
const calculateIndividualMatch = (userTag, therapistSpec) => {
  const userTagLower = userTag.toLowerCase();
  const therapistSpecLower = therapistSpec.toLowerCase();

  // Exact match
  if (userTagLower === therapistSpecLower) {
    return 100;
  }

  // Direct word match
  if (therapistSpecLower.includes(userTagLower) || userTagLower.includes(therapistSpecLower)) {
    return 95;
  }

  // Related specialization matching
  const relatedMatches = {
    'work stress': ['work stress', 'workplace stress', 'career counseling', 'burnout', 'professional stress'],
    'anxiety': ['anxiety', 'generalized anxiety', 'social anxiety', 'anxiety disorders', 'panic disorders'],
    'relationships': ['relationship counseling', 'couples therapy', 'family therapy', 'social relationships', 'relationship issues'],
    'health anxiety': ['health anxiety', 'medical stress', 'chronic illness', 'health psychology', 'medical trauma'],
    'academic stress': ['academic stress', 'student counseling', 'educational psychology', 'performance anxiety', 'study stress'],
    'depression': ['depression', 'mood disorders', 'major depression', 'bipolar disorder', 'emotional regulation'],
    'trauma recovery': ['trauma therapy', 'ptsd', 'trauma recovery', 'emotional trauma', 'crisis intervention'],
    'family therapy': ['family therapy', 'family counseling', 'family systems', 'parenting support', 'family dynamics'],
    'mindfulness': ['mindfulness therapy', 'meditation therapy', 'mindfulness-based therapy', 'stress reduction', 'relaxation techniques'],
    'couples therapy': ['couples therapy', 'marriage counseling', 'relationship therapy', 'premarital counseling', 'relationship repair']
  };

  // Check for related matches
  for (const [category, relatedTerms] of Object.entries(relatedMatches)) {
    if (userTagLower.includes(category.toLowerCase()) || category.toLowerCase().includes(userTagLower)) {
      for (const term of relatedTerms) {
        if (therapistSpecLower.includes(term)) {
          return 85;
        }
      }
    }
  }

  // Partial keyword matching
  const userWords = userTagLower.split(' ');
  const therapistWords = therapistSpecLower.split(' ');
  
  let wordMatches = 0;
  userWords.forEach(userWord => {
    if (therapistWords.some(therapistWord => 
      therapistWord.includes(userWord) || userWord.includes(therapistWord)
    )) {
      wordMatches++;
    }
  });

  if (wordMatches > 0) {
    return Math.min(75, (wordMatches / userWords.length) * 75);
  }

  // General wellness match
  const generalTerms = ['wellness', 'general', 'counseling', 'therapy', 'mental health'];
  if (generalTerms.some(term => therapistSpecLower.includes(term))) {
    return 40;
  }

  return 20; // Minimal compatibility
};

/**
 * Generate match reason explaining why therapist is recommended
 * @param {Array} userStressTags - User's stress domains
 * @param {Array} therapistSpecializations - Therapist's specializations
 * @returns {string} Human-readable match explanation
 */
const generateMatchReason = (userStressTags, therapistSpecializations) => {
  const primaryStress = userStressTags[0];
  const matchingSpecs = therapistSpecializations.filter(spec => 
    calculateIndividualMatch(primaryStress, spec) > 70
  );

  if (matchingSpecs.length > 0) {
    return `Specializes in ${matchingSpecs[0]}, directly addressing your ${primaryStress.toLowerCase()} concerns.`;
  }

  const relatedSpecs = therapistSpecializations.filter(spec => 
    calculateIndividualMatch(primaryStress, spec) > 40
  );

  if (relatedSpecs.length > 0) {
    return `Experienced in ${relatedSpecs[0]}, which relates to your ${primaryStress.toLowerCase()} challenges.`;
  }

  return `Provides comprehensive mental health support that can help with your wellness journey.`;
};

/**
 * Get general therapists when no specific matching is possible
 * @returns {Array} Array of general therapists
 */
const getGeneralTherapists = () => {
  try {
    return therapistDatabase
      .filter(therapist => 
        therapist.specializations.some(spec => 
          spec.toLowerCase().includes('general') || 
          spec.toLowerCase().includes('wellness') ||
          spec.toLowerCase().includes('anxiety') ||
          spec.toLowerCase().includes('counseling')
        )
      )
      .map(therapist => ({
        ...therapist,
        matchScore: 50,
        matchReason: 'Provides general mental health and wellness support.'
      }))
      .slice(0, 6);
  } catch (error) {
    console.error('Error getting general therapists:', error);
    return [];
  }
};

export default { getTherapistRecommendations };