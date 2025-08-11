export const homeContent = {
  hero: {
    title: "Good afternoon, Manish",
    subtitle: "Ready to prioritize your mental wellness today?",
    cta: { label: "Start Your Check‑in", href: "/survey" },
    datePrefix: "Monday, August 11, 2025" // replace with dynamic date if already available
  },
  moodPrompt: {
    title: "How are you feeling today?",
    subtitle: "Take a moment to check in with yourself.",
    moods: [
      { key: "excellent", label: "Excellent", emoji: "😊" },
      { key: "good", label: "Good", emoji: "😌" },
      { key: "okay", label: "Okay", emoji: "😐" },
      { key: "difficult", label: "Difficult", emoji: "😔" },
      { key: "struggling", label: "Struggling", emoji: "😢" }
    ],
    onSelectRoute: "/survey" // after mood select, route or open check-in
  },
  wellnessTools: [
    {
      key: "checkin",
      title: "Daily Check‑in",
      desc: "Take a moment to reflect on your emotional well‑being with our guided assessment.",
      cta: { label: "Start Check‑in", href: "/survey" },
      icon: "Heart"
    },
    {
      key: "meditation",
      title: "Meditation",
      desc: "Guided meditations designed to reduce stress and anxiety.",
      cta: { label: "Start Session", href: "/tools/meditation" },
      icon: "Brain"
    },
    {
      key: "sleep",
      title: "Sleep Stories",
      desc: "Drift off peacefully with soothing bedtime stories and calming soundscapes.",
      cta: { label: "Listen Tonight", href: "/tools/sleep-stories" },
      icon: "Moon"
    }
  ],
  quickTools: [
    {
      key: "breathing",
      title: "Breathing Exercise",
      desc: "2‑minute guided breathing",
      href: "/tools/breathing",
      icon: "Wind"
    },
    {
      key: "quickMeditation",
      title: "Quick Meditation",
      desc: "5‑minute calming session",
      href: "/tools/meditation?type=quick",
      icon: "Brain"
    },
    {
      key: "gratitude",
      title: "Gratitude Practice",
      desc: "Reflect on positives",
      href: "/tools/gratitude",
      icon: "Heart"
    },
    {
      key: "journal",
      title: "Journal Entry",
      desc: "Express your thoughts",
      href: "/tools/journal",
      icon: "BookOpen"
    },
    {
      key: "nature",
      title: "Nature Sounds",
      desc: "Relaxing ambience",
      href: "/tools/nature-sounds",
      icon: "Leaf"
    }
  ],
  ctaStrip: {
    title: "Take the Next Step in Your Wellness Journey",
    subtitle: "Start with a simple check‑in or explore guided tools crafted to support your day.",
    primary: { label: "Start Wellness Check‑in", href: "/survey" },
    secondary: { label: "View Dashboard", href: "/dashboard" }
  }
};
