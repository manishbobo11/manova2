import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import NetworkStatus from './components/NetworkStatus';
import { networkMonitor } from './services/firebase';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import SignupPage from './pages/SignupPage';
import AboutPage from './pages/AboutPage';
import HowItWorksPage from './pages/HowItWorksPage';
import SupportPage from './pages/SupportPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import AccessibilityPage from './pages/AccessibilityPage';
import CookiesPage from './pages/CookiesPage';
import CommunityLandingPage from './pages/CommunityLandingPage';
import MeditationPage from './pages/MeditationPage';
import ExercisePage from './pages/ExercisePage';
import ArticlesPage from './pages/ArticlesPage';
import CommunityPage from './pages/CommunityPage';
import WellnessSurvey from './components/WellnessSurvey';
import WellnessScore from './components/WellnessScore';
import MoodTrackingDashboard from './components/MoodTrackingDashboard';
import SmartWellnessRecommendations from './components/SmartWellnessRecommendations';
import AIChat from './components/AIChat';
import SarthiChatbotDemo from './components/SarthiChatbotDemo';
import TherapistBookingPage from './pages/TherapistBookingPage';
import SleepPage from './pages/SleepPage';
import BreathingPage from './pages/BreathingPage';
import AssessmentHistory from './components/AssessmentHistory';

const App = () => {
  // In a real app, this would come from your authentication system
  const userId = 'demo-user-123';

  return (
    <Router>
      <AuthProvider>
        <UserProvider userId={userId}>
          <ToastProvider>
          <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 font-sans">
            <NetworkStatus networkMonitor={networkMonitor} />
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<AppLayout showFooter={false}><LandingPage /></AppLayout>} />
                <Route path="/about" element={<AppLayout><AboutPage /></AppLayout>} />
                <Route path="/how-it-works" element={<AppLayout><HowItWorksPage /></AppLayout>} />
                <Route path="/support" element={<AppLayout><SupportPage /></AppLayout>} />
                <Route path="/privacy" element={<AppLayout><PrivacyPage /></AppLayout>} />
                <Route path="/terms" element={<AppLayout><TermsPage /></AppLayout>} />
                <Route path="/accessibility" element={<AppLayout><AccessibilityPage /></AppLayout>} />
                <Route path="/cookies" element={<AppLayout><CookiesPage /></AppLayout>} />
                <Route path="/community-landing" element={<AppLayout><CommunityLandingPage /></AppLayout>} />
                <Route path="/login" element={<AppLayout><LoginPage /></AppLayout>} />
                <Route path="/signup" element={<SignupPage />} />
                <Route
                  path="/home"
                  element={
                    <ProtectedRoute>
                      <AppLayout><HomePage /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <AppLayout><DashboardPage /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/meditation"
                  element={
                    <ProtectedRoute>
                      <AppLayout><MeditationPage /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sleep"
                  element={
                    <ProtectedRoute>
                      <AppLayout><SleepPage /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/breathing"
                  element={
                    <ProtectedRoute>
                      <AppLayout><BreathingPage /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/exercise"
                  element={
                    <ProtectedRoute>
                      <AppLayout><ExercisePage /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/articles"
                  element={
                    <ProtectedRoute>
                      <AppLayout><ArticlesPage /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/community"
                  element={
                    <ProtectedRoute>
                      <AppLayout><CommunityPage /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/survey"
                  element={
                    <ProtectedRoute>
                      <AppLayout><WellnessSurvey userId={userId} /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wellness-score"
                  element={
                    <ProtectedRoute>
                      <AppLayout><WellnessScore currentCheckinData={null} /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mood-dashboard"
                  element={
                    <ProtectedRoute>
                      <AppLayout><MoodTrackingDashboard userId={userId} /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/smart-recommendations"
                  element={
                    <ProtectedRoute>
                      <AppLayout><SmartWellnessRecommendations userId={userId} moodData={null} stressPatterns={null} /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ai-chat"
                  element={
                    <ProtectedRoute>
                      <AppLayout><AIChat userId={userId} /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sarthi-chatbot"
                  element={
                    <ProtectedRoute>
                      <AppLayout><SarthiChatbotDemo /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/therapist-booking"
                  element={
                    <ProtectedRoute>
                      <AppLayout><TherapistBookingPage /></AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/assessments"
                  element={
                    <ProtectedRoute>
                      <AppLayout><AssessmentHistory /></AppLayout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </AnimatePresence>
          </div>
          </ToastProvider>
        </UserProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
