/**
 * Mock Therapist Database for Manova Platform
 * This would typically come from your backend API
 */

export const therapistDatabase = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    avatar: "/images/default-avatar.svg",
    specializations: ["Work Stress", "Anxiety", "Burnout Prevention"],
    languages: ["English"],
    mode: ["Online", "In-Person"],
    matchScore: 95,
    experience: "8 years",
    credentials: "PhD Clinical Psychology",
    bio: "Specializes in workplace stress management and anxiety disorders. Helped over 500+ professionals overcome burnout.",
    rating: 4.9,
    reviewCount: 127,
    availability: {
      timezone: "PST",
      slots: [
        { date: "2024-01-15", times: ["09:00", "11:00", "14:00", "16:00"] },
        { date: "2024-01-16", times: ["10:00", "13:00", "15:00"] },
        { date: "2024-01-17", times: ["09:00", "11:00", "14:00", "16:00", "17:00"] }
      ]
    },
    pricing: {
      online: 2500, // ₹2500 per session
      inPerson: 3500 // ₹3500 per session
    },
    location: "San Francisco, CA"
  },
  {
    id: 2,
    name: "Dr. Raj Patel",
    avatar: "/images/default-avatar.svg",
    specializations: ["Relationships", "Family Therapy", "Cultural Issues"],
    languages: ["English", "Hindi", "Gujarati"],
    mode: ["Online", "In-Person"],
    matchScore: 92,
    experience: "12 years",
    credentials: "MD Psychiatry, Family Therapy Certified",
    bio: "Expert in relationship counseling and family dynamics with deep understanding of cultural contexts.",
    rating: 4.8,
    reviewCount: 203,
    availability: {
      timezone: "EST",
      slots: [
        { date: "2024-01-15", times: ["10:00", "12:00", "15:00"] },
        { date: "2024-01-16", times: ["09:00", "11:00", "14:00", "16:00"] },
        { date: "2024-01-18", times: ["10:00", "13:00", "15:00", "17:00"] }
      ]
    },
    pricing: {
      online: 2200, // ₹2200 per session
      inPerson: 3200 // ₹3200 per session
    },
    location: "New York, NY"
  },
  {
    id: 3,
    name: "Dr. Priya Sharma",
    avatar: "/images/default-avatar.svg",
    specializations: ["Health Anxiety", "Chronic Illness", "Medical Trauma"],
    languages: ["English", "Hindi"],
    mode: ["Online"],
    matchScore: 88,
    experience: "6 years",
    credentials: "PsyD Clinical Health Psychology",
    bio: "Compassionate specialist in health-related anxiety and chronic illness support with holistic approach.",
    rating: 4.9,
    reviewCount: 89,
    availability: {
      timezone: "PST",
      slots: [
        { date: "2024-01-15", times: ["11:00", "13:00", "16:00"] },
        { date: "2024-01-17", times: ["09:00", "12:00", "14:00", "17:00"] },
        { date: "2024-01-19", times: ["10:00", "13:00", "15:00"] }
      ]
    },
    pricing: {
      online: 2000 // ₹2000 per session
    },
    location: "Los Angeles, CA"
  },
  {
    id: 4,
    name: "Dr. Michael Chen",
    avatar: "/images/default-avatar.svg",
    specializations: ["Academic Stress", "Career Transition", "Performance Anxiety"],
    languages: ["English", "Mandarin"],
    mode: ["Online", "In-Person"],
    matchScore: 85,
    experience: "10 years",
    credentials: "PhD Counseling Psychology",
    bio: "Dedicated to helping students and professionals navigate academic and career challenges with confidence.",
    rating: 4.7,
    reviewCount: 156,
    availability: {
      timezone: "PST",
      slots: [
        { date: "2024-01-16", times: ["09:00", "11:00", "15:00", "17:00"] },
        { date: "2024-01-17", times: ["10:00", "13:00", "16:00"] },
        { date: "2024-01-18", times: ["09:00", "12:00", "14:00", "16:00"] }
      ]
    },
    pricing: {
      online: 2300, // ₹2300 per session
      inPerson: 3300 // ₹3300 per session
    },
    location: "Seattle, WA"
  },
  {
    id: 5,
    name: "Dr. Anita Gupta",
    avatar: "/images/default-avatar.svg",
    specializations: ["Mindfulness", "General Wellness", "Stress Management"],
    languages: ["English", "Hindi", "Punjabi"],
    mode: ["Online", "In-Person"],
    matchScore: 90,
    experience: "15 years",
    credentials: "PhD Clinical Psychology, Mindfulness Certified",
    bio: "Integrative therapist combining evidence-based therapy with mindfulness practices for holistic healing.",
    rating: 4.9,
    reviewCount: 234,
    availability: {
      timezone: "EST",
      slots: [
        { date: "2024-01-15", times: ["08:00", "10:00", "13:00", "15:00"] },
        { date: "2024-01-16", times: ["09:00", "11:00", "14:00"] },
        { date: "2024-01-17", times: ["08:00", "12:00", "16:00", "17:00"] }
      ]
    },
    pricing: {
      online: 2600, // ₹2600 per session
      inPerson: 3600 // ₹3600 per session
    },
    location: "Boston, MA"
  },
  {
    id: 6,
    name: "Dr. Emily Rodriguez",
    avatar: "/images/default-avatar.svg",
    specializations: ["Trauma Recovery", "PTSD", "Emotional Regulation"],
    languages: ["English", "Spanish"],
    mode: ["Online", "In-Person"],
    matchScore: 93,
    experience: "9 years",
    credentials: "PhD Clinical Psychology, EMDR Certified",
    bio: "Trauma-informed therapist specializing in PTSD recovery using EMDR and cognitive-behavioral approaches.",
    rating: 4.8,
    reviewCount: 178,
    availability: {
      timezone: "CST",
      slots: [
        { date: "2024-01-15", times: ["09:00", "12:00", "14:00", "16:00"] },
        { date: "2024-01-17", times: ["10:00", "13:00", "15:00"] },
        { date: "2024-01-18", times: ["09:00", "11:00", "14:00", "17:00"] }
      ]
    },
    pricing: {
      online: 2700, // ₹2700 per session
      inPerson: 3700 // ₹3700 per session
    },
    location: "Austin, TX"
  },
  {
    id: 7,
    name: "Dr. James Wilson",
    avatar: "/images/default-avatar.svg",
    specializations: ["Depression", "Mood Disorders", "Life Transitions"],
    languages: ["English"],
    mode: ["Online", "In-Person"],
    matchScore: 87,
    experience: "11 years",
    credentials: "MD Psychiatry, CBT Certified",
    bio: "Compassionate psychiatrist with expertise in mood disorders and life transition support.",
    rating: 4.6,
    reviewCount: 142,
    availability: {
      timezone: "EST",
      slots: [
        { date: "2024-01-16", times: ["10:00", "12:00", "15:00", "17:00"] },
        { date: "2024-01-17", times: ["09:00", "13:00", "16:00"] },
        { date: "2024-01-19", times: ["10:00", "14:00", "16:00"] }
      ]
    },
    pricing: {
      online: 2800, // ₹2800 per session
      inPerson: 3800 // ₹3800 per session
    },
    location: "Miami, FL"
  },
  {
    id: 8,
    name: "Dr. Lisa Thompson",
    avatar: "/images/default-avatar.svg",
    specializations: ["Couples Therapy", "Communication", "Relationship Issues"],
    languages: ["English", "French"],
    mode: ["Online", "In-Person"],
    matchScore: 91,
    experience: "13 years",
    credentials: "PhD Marriage & Family Therapy",
    bio: "Relationship expert helping couples build stronger connections through improved communication.",
    rating: 4.9,
    reviewCount: 267,
    availability: {
      timezone: "PST",
      slots: [
        { date: "2024-01-15", times: ["11:00", "14:00", "16:00"] },
        { date: "2024-01-16", times: ["09:00", "12:00", "15:00", "17:00"] },
        { date: "2024-01-18", times: ["10:00", "13:00", "16:00"] }
      ]
    },
    pricing: {
      online: 2750, // ₹2750 per session
      inPerson: 3750 // ₹3750 per session
    },
    location: "Portland, OR"
  }
];

// Filter options for the booking page
export const filterOptions = {
  stressTypes: [
    "All Specializations",
    "Work Stress",
    "Anxiety", 
    "Relationships",
    "Health Anxiety",
    "Academic Stress",
    "Depression",
    "Trauma Recovery",
    "Family Therapy",
    "Mindfulness"
  ],
  languages: [
    "All Languages",
    "English",
    "Hindi", 
    "Spanish",
    "Mandarin",
    "French",
    "Gujarati",
    "Punjabi"
  ],
  modes: [
    "All Modes",
    "Online",
    "In-Person"
  ]
};

// Helper functions
export const getTherapistById = (id) => {
  return therapistDatabase.find(therapist => therapist.id === id);
};

export const filterTherapists = (filters) => {
  const { stressType, language, mode } = filters;
  
  return therapistDatabase.filter(therapist => {
    const matchesStressType = !stressType || stressType === "All Specializations" || 
      therapist.specializations.some(spec => spec.includes(stressType.replace(' Stress', '')));
    
    const matchesLanguage = !language || language === "All Languages" || 
      therapist.languages.includes(language);
    
    const matchesMode = !mode || mode === "All Modes" || 
      therapist.mode.includes(mode);
    
    return matchesStressType && matchesLanguage && matchesMode;
  });
};

export default therapistDatabase;