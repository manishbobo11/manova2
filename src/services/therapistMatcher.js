/**
 * Therapist Matching Service for Manova
 * Matches users with appropriate therapists based on stress domain, language, and current state
 */

// Sample therapist database - in production, this would come from your backend
const SAMPLE_THERAPIST_DATABASE = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Work Stress & Anxiety",
    languages: ["English"],
    availability: "Mon-Fri, 2-6PM",
    mode: "Online",
    email: "sarah.johnson@manova.com",
    bio: "Specializes in workplace stress, burnout recovery, and anxiety management",
    experience: "8 years",
    credentials: "PhD in Clinical Psychology"
  },
  {
    id: 2,
    name: "Dr. Raj Patel",
    specialty: "Relationships & Family",
    languages: ["English", "Hindi", "Hinglish"],
    availability: "Tue-Sat, 10AM-4PM",
    mode: "Online & In-person",
    email: "raj.patel@manova.com",
    bio: "Expert in relationship counseling and family therapy",
    experience: "12 years",
    credentials: "MD Psychiatry, Family Therapy Certified"
  },
  {
    id: 3,
    name: "Dr. Priya Sharma",
    specialty: "Health & Medical Stress",
    languages: ["English", "Hindi"],
    availability: "Mon-Wed, 3-7PM",
    mode: "Online",
    email: "priya.sharma@manova.com",
    bio: "Specializes in health anxiety and chronic illness support",
    experience: "6 years",
    credentials: "PsyD Clinical Health Psychology"
  },
  {
    id: 4,
    name: "Dr. Michael Chen",
    specialty: "Academic & Career",
    languages: ["English"],
    availability: "Thu-Sun, 1-5PM",
    mode: "Online & In-person",
    email: "michael.chen@manova.com",
    bio: "Focuses on academic pressure and career transition support",
    experience: "10 years",
    credentials: "PhD Counseling Psychology"
  },
  {
    id: 5,
    name: "Dr. Anita Gupta",
    specialty: "General Wellness & Mindfulness",
    languages: ["English", "Hindi", "Hinglish"],
    availability: "Mon-Fri, 9AM-1PM",
    mode: "Online",
    email: "anita.gupta@manova.com",
    bio: "Integrative approach combining therapy with mindfulness practices",
    experience: "15 years",
    credentials: "PhD Clinical Psychology, Mindfulness-Based Therapy Certified"
  }
];

/**
 * Matches user with appropriate therapists based on their current state and preferences
 * @param {Object} params - Matching parameters
 * @param {string} params.userStressDomain - Primary stress domain (work, relationships, health, etc.)
 * @param {string} params.userPreferredLanguage - User's preferred language
 * @param {string} params.userCurrentCheckinSummary - Summary of user's current emotional state
 * @param {Array} params.therapistList - Optional custom therapist list (defaults to sample database)
 * @returns {Array} Array of matched therapist objects
 */
export async function getTherapistSuggestions({
  userStressDomain,
  userPreferredLanguage = "English",
  userCurrentCheckinSummary,
  therapistList = SAMPLE_THERAPIST_DATABASE
}) {
  try {
    console.log("🔍 Matching therapists for:", { userStressDomain, userPreferredLanguage });

    // Normalize stress domain for matching
    const normalizedDomain = normalizeStressDomain(userStressDomain);
    
    // Filter therapists by language preference
    const languageMatches = therapistList.filter(therapist => 
      therapist.languages.some(lang => 
        lang.toLowerCase().includes(userPreferredLanguage.toLowerCase())
      )
    );

    // Score therapists based on specialty match
    const scoredTherapists = languageMatches.map(therapist => {
      const specialtyScore = calculateSpecialtyMatch(normalizedDomain, therapist.specialty);
      const availabilityScore = calculateAvailabilityScore(therapist.availability);
      const modeScore = therapist.mode.includes("Online") ? 1 : 0.8; // Prefer online for accessibility
      
      const totalScore = (specialtyScore * 0.6) + (availabilityScore * 0.2) + (modeScore * 0.2);
      
      return {
        ...therapist,
        matchScore: totalScore,
        reason: generateMatchReason(therapist, normalizedDomain, userCurrentCheckinSummary)
      };
    });

    // Sort by match score and return top 2
    const topMatches = scoredTherapists
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 2)
      .map(therapist => ({
        name: therapist.name,
        specialty: therapist.specialty,
        language: therapist.languages.join(", "),
        reason: therapist.reason,
        availability: therapist.availability,
        mode: therapist.mode,
        email: therapist.email,
        bio: therapist.bio,
        experience: therapist.experience,
        credentials: therapist.credentials,
        matchScore: Math.round(therapist.matchScore * 100)
      }));

    console.log("✅ Found therapist matches:", topMatches.length);
    return topMatches;

  } catch (error) {
    console.error("❌ Error matching therapists:", error);
    return [];
  }
}

/**
 * Normalizes stress domain for consistent matching
 */
function normalizeStressDomain(domain) {
  if (!domain) return "general";
  
  const domainMap = {
    "work": ["work", "career", "job", "workplace", "professional"],
    "relationships": ["relationship", "family", "social", "romantic", "marriage"],
    "health": ["health", "medical", "physical", "illness", "chronic"],
    "academic": ["academic", "school", "student", "education", "study"],
    "financial": ["financial", "money", "economic", "debt", "career"],
    "general": ["general", "anxiety", "depression", "stress", "wellness"]
  };

  const lowerDomain = domain.toLowerCase();
  for (const [category, keywords] of Object.entries(domainMap)) {
    if (keywords.some(keyword => lowerDomain.includes(keyword))) {
      return category;
    }
  }
  
  return "general";
}

/**
 * Calculates how well a therapist's specialty matches the user's stress domain
 */
function calculateSpecialtyMatch(userDomain, therapistSpecialty) {
  const specialty = therapistSpecialty.toLowerCase();
  const domain = userDomain.toLowerCase();
  
  // Direct specialty match
  if (specialty.includes(domain)) return 1.0;
  
  // Related specialty matches
  const relatedMatches = {
    "work": ["career", "workplace", "professional", "burnout"],
    "relationships": ["family", "social", "romantic", "marriage"],
    "health": ["medical", "chronic", "wellness", "physical"],
    "academic": ["student", "education", "career", "performance"],
    "financial": ["career", "work", "stress"],
    "general": ["wellness", "mindfulness", "anxiety", "stress"]
  };
  
  const related = relatedMatches[domain] || [];
  if (related.some(term => specialty.includes(term))) return 0.8;
  
  // General wellness match as fallback
  if (specialty.includes("general") || specialty.includes("wellness")) return 0.6;
  
  return 0.3; // Base compatibility score
}

/**
 * Calculates availability score based on how flexible the schedule is
 */
function calculateAvailabilityScore(availability) {
  if (!availability) return 0.5;
  
  const schedule = availability.toLowerCase();
  let score = 0.5;
  
  // More days available = higher score
  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const availableDays = days.filter(day => schedule.includes(day)).length;
  score += (availableDays / 7) * 0.3;
  
  // Flexible hours = higher score
  if (schedule.includes("flexible") || schedule.includes("24/7")) score += 0.2;
  if (schedule.includes("evening") || schedule.includes("weekend")) score += 0.1;
  
  return Math.min(score, 1.0);
}

/**
 * Generates a personalized reason for why this therapist is a good match
 */
function generateMatchReason(therapist, userDomain, checkinSummary) {
  const reasons = {
    "work": `Specializes in workplace stress and has extensive experience helping professionals manage ${userDomain}-related challenges.`,
    "relationships": `Expert in relationship dynamics with a proven track record in family and social stress management.`,
    "health": `Specializes in health anxiety and chronic illness support, perfect for medical stress concerns.`,
    "academic": `Focuses on academic pressure and performance anxiety with specialized training in student support.`,
    "financial": `Experienced in career transitions and work-related stress that often connects to financial concerns.`,
    "general": `Integrative approach combining evidence-based therapy with mindfulness, ideal for general wellness support.`
  };
  
  let baseReason = reasons[userDomain] || reasons["general"];
  
  // Add language preference if multilingual
  if (therapist.languages.length > 1) {
    baseReason += ` Available in multiple languages for comfortable communication.`;
  }
  
  // Add mode preference
  if (therapist.mode.includes("Online")) {
    baseReason += ` Offers convenient online sessions.`;
  }
  
  return baseReason;
}

/**
 * Gets a quick therapist recommendation based on wellness score
 */
export function getQuickTherapistRecommendation(wellnessScore, mood) {
  if (wellnessScore <= 3 || mood === "very stressed") {
    return {
      urgency: "high",
      message: "Consider speaking with a mental health professional soon. Your current stress levels indicate you could benefit from immediate support.",
      action: "Schedule consultation within 24-48 hours"
    };
  } else if (wellnessScore <= 5 || mood === "stressed") {
    return {
      urgency: "medium",
      message: "A conversation with a therapist could help you develop better coping strategies for your current challenges.",
      action: "Consider scheduling within the next week"
    };
  } else if (wellnessScore <= 7) {
    return {
      urgency: "low",
      message: "You're managing well, but preventive therapy sessions could help maintain your mental wellness.",
      action: "Optional: Schedule for ongoing wellness support"
    };
  }
  
  return {
    urgency: "none",
    message: "You're in a good mental state! Keep up your current wellness practices.",
    action: "Continue current self-care routine"
  };
}

export default { getTherapistSuggestions, getQuickTherapistRecommendation };