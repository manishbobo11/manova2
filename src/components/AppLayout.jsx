import React from 'react';
import Navbar from './common/Navbar';
import Footer from './Footer';

const AppLayout = ({ children, showNavbar = true, showFooter = true }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-50 via-white to-blue-100 text-gray-900 no-horizontal-scroll">
      {showNavbar && <Navbar />}
      <main className={`flex-grow ${showNavbar ? 'pt-0' : ''}`}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default AppLayout; 