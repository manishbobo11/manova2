import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/common/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import SignupPage from './pages/SignupPage';
import Footer from './components/Footer';
import MeditationPage from './pages/MeditationPage';
import ExercisePage from './pages/ExercisePage';
import ArticlesPage from './pages/ArticlesPage';
import CommunityPage from './pages/CommunityPage';
import WellnessSurvey from './components/WellnessSurvey';
import MoodTrackingDashboard from './components/MoodTrackingDashboard';
import SmartWellnessRecommendations from './components/SmartWellnessRecommendations';
import AIChat from './components/AIChat';
import SarthiChatbotDemo from './components/SarthiChatbotDemo';
import TherapistBookingPage from './pages/TherapistBookingPage';

const App = () => {
  // In a real app, this would come from your authentication system
  const userId = 'demo-user-123';

  return (
    <Router>
      <AuthProvider>
        <UserProvider userId={userId}>
          <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 font-sans">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<><Navbar /><LandingPage /></>} />
                <Route path="/login" element={<><Navbar /><LoginPage /></>} />
                <Route path="/signup" element={<><Navbar /><SignupPage /></>} />
                <Route
                  path="/home"
                  element={
                    <ProtectedRoute>
                      <><Navbar /><HomePage /></>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <><Navbar /><DashboardPage /></>
                    </ProtectedRoute>
                  }
                />
                  <Route
                    path="/meditation"
                    element={
                      <ProtectedRoute>
                        <MeditationPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/exercise"
                    element={
                      <ProtectedRoute>
                        <ExercisePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/articles"
                    element={
                      <ProtectedRoute>
                        <ArticlesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/community"
                    element={
                      <ProtectedRoute>
                        <CommunityPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/survey"
                    element={
                      <ProtectedRoute>
                        <WellnessSurvey userId={userId} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mood-dashboard"
                    element={
                      <ProtectedRoute>
                        <MoodTrackingDashboard userId={userId} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/smart-recommendations"
                    element={
                      <ProtectedRoute>
                        <SmartWellnessRecommendations userId={userId} moodData={null} stressPatterns={null} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/ai-chat"
                    element={
                      <ProtectedRoute>
                        <AIChat userId={userId} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/sarthi-chatbot"
                    element={
                      <ProtectedRoute>
                        <SarthiChatbotDemo />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/therapist-booking"
                    element={
                      <ProtectedRoute>
                        <TherapistBookingPage />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </AnimatePresence>
              
              {/* Footer outside container - spans full width */}
              <Footer />
            </div>
          </UserProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
