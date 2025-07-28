import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  SlidersHorizontal,
  MapPin,
  Video,
  Globe,
  Star,
  Users,
  Award,
  Clock,
  Heart,
  Shield,
  MessageCircle,
  Brain,
  Sparkles
} from 'lucide-react';

import TherapistCard from '../components/TherapistCard';
import TherapistBookingModal from '../components/TherapistBookingModal';
import { therapistDatabase, filterOptions, filterTherapists } from '../data/therapists';
import { bookTherapistSession } from '../services/bookTherapistSession';
import { useAuth } from '../contexts/AuthContext';

const TherapistBookingPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [filters, setFilters] = useState({
    stressType: 'All Specializations',
    language: 'All Languages',
    mode: 'All Modes'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('matchScore'); // matchScore, rating, price

  // Filter and search therapists
  const filteredTherapists = useMemo(() => {
    let results = filterTherapists(filters);
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(therapist => 
        therapist.name.toLowerCase().includes(query) ||
        therapist.specializations.some(spec => spec.toLowerCase().includes(query)) ||
        therapist.bio.toLowerCase().includes(query) ||
        therapist.languages.some(lang => lang.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    results.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          const aPrice = Math.min(a.pricing.online || 999, a.pricing.inPerson || 999);
          const bPrice = Math.min(b.pricing.online || 999, b.pricing.inPerson || 999);
          return aPrice - bPrice;
        case 'matchScore':
        default:
          return b.matchScore - a.matchScore;
      }
    });
    
    return results;
  }, [filters, searchQuery, sortBy]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleBookingClick = (therapist) => {
    setSelectedTherapist(therapist);
    setIsBookingModalOpen(true);
  };

  const handleBookingConfirm = async (bookingData) => {
    // The TherapistBookingModal handles its own booking confirmation
    // This function is kept for compatibility but may not be needed
  };

  const clearFilters = () => {
    setFilters({
      stressType: 'All Specializations',
      language: 'All Languages',
      mode: 'All Modes'
    });
    setSearchQuery('');
  };

  const activeFilterCount = Object.values(filters).filter(value => 
    !value.startsWith('All')
  ).length + (searchQuery.trim() ? 1 : 0);

  return (
    <div className="min-h-screen bg-white pt-4">
      {/* Modern Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50" />
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6 leading-tight">
              Your Personalized 
              <span className="text-[#007CFF]">
                Therapist Matches
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-black mb-8 leading-relaxed">
              Connect with licensed therapists who understand your unique journey. 
              <br className="hidden sm:block" />
              Find the perfect match for your mental wellness goals.
            </p>

            {/* Trust Stats */}
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 mb-12">
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="p-2 bg-blue-100 rounded-full">
                  <Users className="w-5 h-5 text-[#007CFF]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-black">500+</div>
                  <div className="text-sm text-[#777]">Licensed Therapists</div>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="p-2 bg-blue-100 rounded-full">
                  <Star className="w-5 h-5 text-[#007CFF]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-black">4.9</div>
                  <div className="text-sm text-[#777]">Average Rating</div>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="p-2 bg-blue-100 rounded-full">
                  <Clock className="w-5 h-5 text-[#007CFF]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-black">24/7</div>
                  <div className="text-sm text-[#777]">Support Available</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Modern Search & Filter Section */}
        <div className="bg-white rounded-3xl border border-[#D8D8D8] shadow-lg p-6 mb-12">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#777]" />
            <input
              type="text"
              placeholder="Search therapists by name, specialty, or language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-[#C5C5C5] rounded-2xl shadow-sm focus:ring-2 focus:ring-[#007CFF]/20 focus:border-[#007CFF] transition-all text-black placeholder-[#777] text-lg"
            />
          </div>

          {/* Pill-style Filters */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-black">Filter by preferences</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-[#007CFF] hover:text-[#0066CC] font-medium transition-colors"
                >
                  Clear all ({activeFilterCount})
                </button>
              )}
            </div>
            
            {/* Specialization Pills */}
            <div>
              <label className="block text-sm font-medium text-[#777] mb-2">
                <Brain className="inline w-4 h-4 mr-1" />
                Specialization
              </label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.stressTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => handleFilterChange('stressType', type)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      filters.stressType === type
                        ? 'bg-[#007CFF] text-white shadow-lg'
                        : 'bg-white text-[#777] hover:bg-blue-50 hover:text-[#007CFF] border border-[#C5C5C5]'
                    }`}
                  >
                    {type === 'All Specializations' ? 'All' : type}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Language Pills */}
            <div>
              <label className="block text-sm font-medium text-[#777] mb-2">
                <Globe className="inline w-4 h-4 mr-1" />
                Language
              </label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.languages.map(lang => (
                  <button
                    key={lang}
                    onClick={() => handleFilterChange('language', lang)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      filters.language === lang
                        ? 'bg-[#007CFF] text-white shadow-lg'
                        : 'bg-white text-[#777] hover:bg-blue-50 hover:text-[#007CFF] border border-[#C5C5C5]'
                    }`}
                  >
                    {lang === 'All Languages' ? 'All Languages' : `${lang === 'Hindi' ? '🇮🇳' : lang === 'English' ? '🇺🇸' : '🌐'} ${lang}`}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Session Mode Pills */}
            <div>
              <label className="block text-sm font-medium text-[#777] mb-2">
                <MessageCircle className="inline w-4 h-4 mr-1" />
                Session Type
              </label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.modes.map(mode => (
                  <button
                    key={mode}
                    onClick={() => handleFilterChange('mode', mode)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      filters.mode === mode
                        ? 'bg-[#007CFF] text-white shadow-lg'
                        : 'bg-white text-[#777] hover:bg-blue-50 hover:text-[#007CFF] border border-[#C5C5C5]'
                    }`}
                  >
                    {mode === 'Online' && <Video className="w-4 h-4" />}
                    {mode === 'In-Person' && <MapPin className="w-4 h-4" />}
                    <span>{mode === 'All Modes' ? 'All Types' : mode}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        </div>

        {/* Section Divider */}
        <div className="relative mb-12">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#D8D8D8]" />
          </div>
          <div className="relative flex justify-center">
            <div className="bg-white px-6 py-2 rounded-full border border-[#D8D8D8]">
              <Sparkles className="w-5 h-5 text-[#007CFF]" />
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              {filteredTherapists.length > 0 ? (
                <>Perfect matches for <span className="text-[#007CFF]">you</span></>
              ) : (
                'No matches found'
              )}
            </h2>
            <p className="text-lg text-[#777] max-w-2xl mx-auto">
              {filteredTherapists.length > 0 ? (
                `We found ${filteredTherapists.length} licensed therapist${filteredTherapists.length === 1 ? '' : 's'} who match your preferences and wellness goals.`
              ) : (
                'Try adjusting your filters to find therapists that match your needs.'
              )}
            </p>
            
            {/* Sort Options */}
            {filteredTherapists.length > 0 && (
              <div className="flex justify-center mt-6">
                <div className="bg-white rounded-2xl p-1 shadow-lg border border-[#D8D8D8]">
                  {[{value: 'matchScore', label: '✨ Best Match'}, {value: 'rating', label: '⭐ Highest Rated'}, {value: 'price', label: '💰 Most Affordable'}].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        sortBy === option.value
                          ? 'bg-[#007CFF] text-white shadow-md'
                          : 'text-[#777] hover:text-[#007CFF]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Therapist Grid */}
        {filteredTherapists.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AnimatePresence>
              {filteredTherapists.map((therapist, index) => (
                <motion.div
                  key={therapist.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.03,
                    transition: { duration: 0.2 }
                  }}
                  className="group"
                >
                  <TherapistCard
                    therapist={therapist}
                    onBookingClick={handleBookingClick}
                    index={index}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Search className="w-16 h-16 text-[#777]" />
            </div>
            <h3 className="text-3xl font-bold text-black mb-4">No matches found</h3>
            <p className="text-lg text-[#777] mb-8 max-w-md mx-auto leading-relaxed">
              We couldn't find any therapists matching your current criteria. Try broadening your search.
            </p>
            <motion.button
              onClick={clearFilters}
              className="bg-[#007CFF] text-white px-8 py-4 rounded-2xl font-semibold hover:bg-[#0066CC] transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear All Filters
            </motion.button>
          </motion.div>
        )}

        {/* Booking Modal */}
        <TherapistBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          therapist={selectedTherapist}
          onBookingConfirm={handleBookingConfirm}
        />
      </div>
  );
};

export default TherapistBookingPage;