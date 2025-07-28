/**
 * Mock Therapist Database for Manova Platform
 * This would typically come from your backend API
 */

export const therapistDatabase = [
  {
    id: "therapist-001",
    name: "Dr. Sarah Johnson",
    avatar: "/images/therapists/sarah-johnson.jpg",
    specializations: ["Work Stress", "Anxiety", "Burnout Recovery"],
    languages: ["English", "Hindi"],
    mode: ["Online", "In-Person"],
    matchScore: 95,
    experience: "8 years",
    credentials: "PhD Clinical Psychology",
    bio: "Dr. Sarah specializes in helping professionals manage workplace stress and anxiety. She uses evidence-based techniques like CBT and mindfulness to help clients develop healthy coping strategies.",
    rating: 4.9,
    reviewCount: 127,
    availability: {
      timezone: "Asia/Kolkata",
      slots: [
        { date: "2025-01-28", times: ["10:00", "14:00", "16:00"] },
        { date: "2025-01-29", times: ["11:00", "15:00", "17:00"] },
        { date: "2025-01-30", times: ["09:00", "13:00", "16:00"] }
      ]
    },
    pricing: {
      online: 2500,
      inPerson: 3000
    },
    location: "Mumbai, Maharashtra"
  },
  {
    id: "therapist-002",
    name: "Dr. Raj Patel",
    avatar: "/images/therapists/raj-patel.jpg",
    specializations: ["Relationships", "Family Therapy", "Couples Therapy"],
    languages: ["English", "Hindi", "Gujarati"],
    mode: ["Online", "In-Person"],
    matchScore: 92,
    experience: "12 years",
    credentials: "MD Psychiatry",
    bio: "Dr. Raj is an expert in relationship counseling and family dynamics. He helps couples and families navigate communication challenges and build stronger connections.",
    rating: 4.8,
    reviewCount: 89,
    availability: {
      timezone: "Asia/Kolkata",
      slots: [
        { date: "2025-01-28", times: ["09:00", "13:00", "18:00"] },
        { date: "2025-01-29", times: ["10:00", "14:00", "19:00"] },
        { date: "2025-01-30", times: ["11:00", "15:00", "17:00"] }
      ]
    },
    pricing: {
      online: 3000,
      inPerson: 3500
    },
    location: "Delhi, NCR"
  },
  {
    id: "therapist-003",
    name: "Dr. Priya Sharma",
    avatar: "/images/therapists/priya-sharma.jpg",
    specializations: ["Health Anxiety", "Medical Stress", "Chronic Illness Support"],
    languages: ["English", "Hindi"],
    mode: ["Online"],
    matchScore: 88,
    experience: "6 years",
    credentials: "PsyD Health Psychology",
    bio: "Dr. Priya specializes in health psychology and supports individuals dealing with medical anxiety, chronic conditions, and health-related stress.",
    rating: 4.7,
    reviewCount: 64,
    availability: {
      timezone: "Asia/Kolkata",
      slots: [
        { date: "2025-01-28", times: ["11:00", "15:00", "17:00"] },
        { date: "2025-01-29", times: ["12:00", "16:00", "18:00"] },
        { date: "2025-01-30", times: ["10:00", "14:00", "16:00"] }
      ]
    },
    pricing: {
      online: 2200,
      inPerson: 2800
    },
    location: "Bangalore, Karnataka"
  },
  {
    id: "therapist-004",
    name: "Dr. Michael Chen",
    avatar: "/images/therapists/michael-chen.jpg",
    specializations: ["Academic Stress", "Performance Anxiety", "Student Counseling"],
    languages: ["English"],
    mode: ["Online", "In-Person"],
    matchScore: 85,
    experience: "10 years",
    credentials: "PhD Counseling Psychology",
    bio: "Dr. Michael focuses on academic pressure and performance anxiety. He helps students and professionals overcome perfectionism and develop healthy achievement strategies.",
    rating: 4.9,
    reviewCount: 103,
    availability: {
      timezone: "Asia/Kolkata",
      slots: [
        { date: "2025-01-28", times: ["10:00", "14:00", "16:00"] },
        { date: "2025-01-29", times: ["11:00", "15:00", "17:00"] },
        { date: "2025-01-30", times: ["09:00", "13:00", "18:00"] }
      ]
    },
    pricing: {
      online: 2800,
      inPerson: 3200
    },
    location: "Pune, Maharashtra"
  },
  {
    id: "therapist-005",
    name: "Dr. Anita Gupta",
    avatar: "/images/therapists/anita-gupta.jpg",
    specializations: ["Mindfulness", "General Wellness", "Stress Reduction"],
    languages: ["English", "Hindi"],
    mode: ["Online"],
    matchScore: 90,
    experience: "15 years",
    credentials: "PhD Clinical Psychology",
    bio: "Dr. Anita combines traditional therapy with mindfulness-based approaches. She specializes in general wellness and helps clients develop sustainable stress management practices.",
    rating: 4.8,
    reviewCount: 145,
    availability: {
      timezone: "Asia/Kolkata",
      slots: [
        { date: "2025-01-28", times: ["09:00", "13:00", "17:00"] },
        { date: "2025-01-29", times: ["10:00", "14:00", "18:00"] },
        { date: "2025-01-30", times: ["11:00", "15:00", "16:00"] }
      ]
    },
    pricing: {
      online: 2600,
      inPerson: 3100
    },
    location: "Chennai, Tamil Nadu"
  },
  {
    id: "therapist-006",
    name: "Dr. Kavya Menon",
    avatar: "/images/therapists/kavya-menon.jpg",
    specializations: ["Depression", "Mood Disorders", "Emotional Regulation"],
    languages: ["English", "Malayalam", "Hindi"],
    mode: ["Online", "In-Person"],
    matchScore: 93,
    experience: "9 years",
    credentials: "MD Psychiatry",
    bio: "Dr. Kavya specializes in mood disorders and depression treatment. She uses a compassionate approach combining medication management with psychotherapy when needed.",
    rating: 4.9,
    reviewCount: 78,
    availability: {
      timezone: "Asia/Kolkata",
      slots: [
        { date: "2025-01-28", times: ["11:00", "15:00", "18:00"] },
        { date: "2025-01-29", times: ["12:00", "16:00", "19:00"] },
        { date: "2025-01-30", times: ["10:00", "14:00", "17:00"] }
      ]
    },
    pricing: {
      online: 3200,
      inPerson: 3800
    },
    location: "Kochi, Kerala"
  },
  {
    id: "therapist-007",
    name: "Dr. Arjun Singh",
    avatar: "/images/therapists/arjun-singh.jpg",
    specializations: ["Trauma Recovery", "PTSD", "Crisis Intervention"],
    languages: ["English", "Hindi", "Punjabi"],
    mode: ["Online", "In-Person"],
    matchScore: 87,
    experience: "11 years",
    credentials: "PhD Clinical Psychology",
    bio: "Dr. Arjun specializes in trauma recovery and PTSD treatment. He provides a safe space for individuals to process difficult experiences and develop healing strategies.",
    rating: 4.7,
    reviewCount: 56,
    availability: {
      timezone: "Asia/Kolkata",
      slots: [
        { date: "2025-01-28", times: ["10:00", "14:00", "17:00"] },
        { date: "2025-01-29", times: ["11:00", "15:00", "18:00"] },
        { date: "2025-01-30", times: ["09:00", "13:00", "16:00"] }
      ]
    },
    pricing: {
      online: 3500,
      inPerson: 4000
    },
    location: "Chandigarh, Punjab"
  },
  {
    id: "therapist-008",
    name: "Dr. Meera Reddy",
    avatar: "/images/therapists/meera-reddy.jpg",
    specializations: ["Anxiety", "Social Anxiety", "Panic Disorders"],
    languages: ["English", "Telugu", "Hindi"],
    mode: ["Online"],
    matchScore: 91,
    experience: "7 years",
    credentials: "MSc Counseling Psychology",
    bio: "Dr. Meera focuses on anxiety disorders and panic management. She helps clients understand their anxiety triggers and develop effective coping mechanisms.",
    rating: 4.8,
    reviewCount: 92,
    availability: {
      timezone: "Asia/Kolkata",
      slots: [
        { date: "2025-01-28", times: ["09:00", "13:00", "16:00"] },
        { date: "2025-01-29", times: ["10:00", "14:00", "17:00"] },
        { date: "2025-01-30", times: ["11:00", "15:00", "18:00"] }
      ]
    },
    pricing: {
      online: 2400,
      inPerson: 2900
    },
    location: "Hyderabad, Telangana"
  },
  {
    id: "therapist-009",
    name: "Dr. Rohit Kumar",
    avatar: "/images/therapists/rohit-kumar.jpg",
    specializations: ["Work Stress", "Career Counseling", "Life Transitions"],
    languages: ["English", "Hindi"],
    mode: ["Online", "In-Person"],
    matchScore: 86,
    experience: "13 years",
    credentials: "PhD Psychology",
    bio: "Dr. Rohit helps professionals navigate career challenges and life transitions. He specializes in work-life balance and career development counseling.",
    rating: 4.6,
    reviewCount: 71,
    availability: {
      timezone: "Asia/Kolkata",
      slots: [
        { date: "2025-01-28", times: ["11:00", "15:00", "18:00"] },
        { date: "2025-01-29", times: ["12:00", "16:00", "19:00"] },
        { date: "2025-01-30", times: ["10:00", "14:00", "17:00"] }
      ]
    },
    pricing: {
      online: 2700,
      inPerson: 3300
    },
    location: "Gurgaon, Haryana"
  },
  {
    id: "therapist-010",
    name: "Dr. Neha Joshi",
    avatar: "/images/therapists/neha-joshi.jpg",
    specializations: ["Family Therapy", "Parenting Support", "Child Psychology"],
    languages: ["English", "Hindi", "Marathi"],
    mode: ["Online", "In-Person"],
    matchScore: 89,
    experience: "8 years",
    credentials: "MSc Clinical Psychology",
    bio: "Dr. Neha works with families and parents to improve communication and resolve conflicts. She specializes in family dynamics and child behavioral issues.",
    rating: 4.7,
    reviewCount: 84,
    availability: {
      timezone: "Asia/Kolkata",
      slots: [
        { date: "2025-01-28", times: ["10:00", "14:00", "17:00"] },
        { date: "2025-01-29", times: ["11:00", "15:00", "18:00"] },
        { date: "2025-01-30", times: ["09:00", "13:00", "16:00"] }
      ]
    },
    pricing: {
      online: 2500,
      inPerson: 3000
    },
    location: "Nashik, Maharashtra"
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
    "Telugu",
    "Malayalam",
    "Marathi",
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