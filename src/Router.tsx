import React, { useState } from 'react';
import Navigation from './components/Navbar';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import MeditationPage from './pages/MeditationPage.jsx';
import ExercisePage from './pages/ExercisePage.jsx';
import ArticlesPage from './pages/ArticlesPage.jsx';
import CommunityPage from './pages/CommunityPage.jsx';
import WellnessSurvey from './components/WellnessSurvey.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

export default function Router() {
  const [currentPage, setCurrentPage] = useState('landing');

  let PageComponent;
  switch (currentPage) {
    case 'landing':
      PageComponent = HomePage;
      break;
    case 'login':
      PageComponent = LoginPage;
      break;
    case 'signup':
      PageComponent = SignupPage;
      break;
    case 'meditation':
      PageComponent = MeditationPage;
      break;
    case 'exercise':
      PageComponent = ExercisePage;
      break;
    case 'articles':
      PageComponent = ArticlesPage;
      break;
    case 'community':
      PageComponent = CommunityPage;
      break;
    case 'wellness-survey':
      PageComponent = WellnessSurvey;
      break;
    case 'dashboard':
      PageComponent = DashboardPage;
      break;
    default:
      PageComponent = HomePage;
  }

  return (
    <>
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main>
        <PageComponent setCurrentPage={setCurrentPage} />
      </main>
    </>
  );
} 