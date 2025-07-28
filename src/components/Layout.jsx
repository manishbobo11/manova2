import React from 'react';
import Navbar from './common/Navbar';
import Footer from './Footer';

/**
 * Unified Layout component for all Manova pages
 * Provides consistent navbar, footer, background, font, and spacing
 * Matches the main landing page theme and styling
 */
const Layout = ({ 
  children, 
  showNavbar = true, 
  showFooter = true,
  className = '',
  containerClassName = ''
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-gray-900">
      {/* Global Navbar */}
      {showNavbar && <Navbar />}
      
      {/* Main Content Area */}
      <main className={`flex-grow ${showNavbar ? 'pt-[67px]' : ''} ${className}`}>
        <div className={`w-full ${containerClassName}`}>
          {children}
        </div>
      </main>
      
      {/* Global Footer */}
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;