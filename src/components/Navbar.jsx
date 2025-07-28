import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Navigation links
  const navigationLinks = [
    { name: 'About', href: '/about' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Support', href: '/support' },
    { name: 'Community', href: '/community' },
    { name: 'Articles', href: '/articles' },
  ];

  return (
    <header className="w-full fixed top-0 z-50 bg-white shadow-sm border-0 border-b-0 border-none">
      <div className="max-w-screen-xl mx-auto px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Manova Text Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-4xl italic font-script text-[#1e3a8a]">
                Manova
              </span>
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <div className="hidden md:flex items-center gap-x-8">
            {navigationLinks.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-base text-[#111827] hover:text-[#1e3a8a] transition-colors relative group"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1e3a8a] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></span>
              </Link>
            ))}
          </div>

          {/* Right: User Info and Logout */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <>
                <span className="text-sm text-[#111827] font-medium truncate max-w-xs" title={currentUser.email}>
                  {currentUser.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-[#111827] hover:text-[#1e3a8a] font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-sm text-[#111827] hover:text-[#1e3a8a] font-medium transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  to="/signup" 
                  className="text-sm bg-[#1e3a8a] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#1e40af] transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-[#111827] hover:text-[#1e3a8a] hover:bg-white/50 focus:outline-none transition-colors"
            >
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} bg-white/95 backdrop-blur-md rounded-b-xl shadow-lg border border-gray-100 mt-2 px-4 py-4`}>
          <div className="flex flex-col space-y-3">
            {navigationLinks.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-base text-[#111827] hover:text-[#1e3a8a] transition-colors px-2 py-2 rounded-lg hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {currentUser ? (
              <>
                <div className="pt-2 border-t border-gray-200">
                  <span className="block text-sm text-[#111827] font-medium px-2 py-2">
                    {currentUser.email}
                  </span>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setTimeout(() => handleLogout(), 150);
                    }}
                    className="text-left text-sm text-[#111827] hover:text-[#1e3a8a] transition-colors px-2 py-2 rounded-lg hover:bg-gray-50 w-full"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 border-t border-gray-200">
                <Link 
                  to="/login" 
                  className="block text-sm text-[#111827] hover:text-[#1e3a8a] transition-colors px-2 py-2 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Log In
                </Link>
                <Link 
                  to="/signup" 
                  className="block text-sm bg-[#1e3a8a] text-white px-2 py-2 rounded-lg font-medium hover:bg-[#1e40af] transition-colors mt-2"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar; 