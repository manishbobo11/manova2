import React, { useState, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';

const LanguageToggle = ({ 
  currentLanguage = 'Hinglish', 
  onLanguageChange, 
  userId,
  className = ""
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const languages = [
    { code: 'Hinglish', name: 'Hinglish', native: 'Hindi + English', emoji: '🇮🇳' },
    { code: 'Hindi', name: 'Hindi', native: 'हिंदी', emoji: '🇮🇳' },
    { code: 'English', name: 'English', native: 'English', emoji: '🇬🇧' }
  ];

  useEffect(() => {
    setSelectedLanguage(currentLanguage);
  }, [currentLanguage]);

  const handleLanguageSelect = async (language) => {
    try {
      setSelectedLanguage(language.code);
      setIsDropdownOpen(false);
      
      // Update user's language preference
      if (onLanguageChange) {
        await onLanguageChange(language.code);
      }

      // Store preference locally
      if (userId) {
        localStorage.setItem(`manova_language_${userId}`, language.code);
      }
      
      console.log(`🌐 Language switched to: ${language.code}`);
    } catch (error) {
      console.error('Error updating language preference:', error);
    }
  };

  const currentLang = languages.find(lang => lang.code === selectedLanguage) || languages[0];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        aria-label="Select language"
      >
        <Globe className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {currentLang.emoji} {currentLang.name}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsDropdownOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 animate-in slide-in-from-top-2 duration-200">
            <div className="py-1">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                Choose Language
              </div>
              
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language)}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between ${
                    selectedLanguage === language.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{language.emoji}</span>
                    <div>
                      <div className="text-sm font-medium">{language.name}</div>
                      <div className="text-xs text-gray-500">{language.native}</div>
                    </div>
                  </div>
                  
                  {selectedLanguage === language.code && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">
                🤖 Sarthi will respond in your preferred language
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageToggle;