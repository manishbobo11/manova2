import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Filter, 
  Search, 
  SlidersHorizontal,
  MapPin,
  Video,
  Globe,
  Star,
  Users,
  Award,
  Clock
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
    <div className="min-h-screen" style={{ backgroundColor: '#F8FBFF' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-white/60 rounded-xl transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </motion.button>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Find Your Therapist</h1>
                <p className="text-gray-600 mt-1">
                  {filteredTherapists.length} therapists available • Personalized matches for you
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-center">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="text-lg font-bold text-purple-600">500+</span>
                </div>
                <p className="text-xs text-gray-500">Licensed Therapists</p>
              </div>
              <div className="text-center">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-lg font-bold text-yellow-600">4.9</span>
                </div>
                <p className="text-xs text-gray-500">Average Rating</p>
              </div>
              <div className="text-center">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="text-lg font-bold text-green-600">24/7</span>
                </div>
                <p className="text-xs text-gray-500">Available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, specialization, or language..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Filter Toggle */}
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-semibold transition-all shadow-sm ${
                showFilters || activeFilterCount > 0
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </motion.button>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {/* Stress Type Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Specialization
                    </label>
                    <select
                      value={filters.stressType}
                      onChange={(e) => handleFilterChange('stressType', e.target.value)}
                      className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {filterOptions.stressTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Language Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <Globe className="inline w-4 h-4 mr-1" />
                      Language
                    </label>
                    <select
                      value={filters.language}
                      onChange={(e) => handleFilterChange('language', e.target.value)}
                      className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {filterOptions.languages.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>

                  {/* Mode Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Session Type
                    </label>
                    <select
                      value={filters.mode}
                      onChange={(e) => handleFilterChange('mode', e.target.value)}
                      className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {filterOptions.modes.map(mode => (
                        <option key={mode} value={mode}>
                          {mode === 'Online' ? '💻 Online' : 
                           mode === 'In-Person' ? '🏢 In-Person' : mode}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="matchScore">Best Match</option>
                      <option value="rating">Highest Rated</option>
                      <option value="price">Lowest Price</option>
                    </select>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={clearFilters}
                    className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Clear all filters
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {filteredTherapists.length} therapists found
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Showing personalized matches based on your preferences
            </p>
          </div>

          {/* Quick Mode Toggles */}
          <div className="hidden md:flex items-center space-x-2 bg-white rounded-2xl p-2 shadow-sm">
            <button
              onClick={() => handleFilterChange('mode', 'Online')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filters.mode === 'Online'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Online</span>
            </button>
            <button
              onClick={() => handleFilterChange('mode', 'In-Person')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filters.mode === 'In-Person'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>In-Person</span>
            </button>
          </div>
        </div>

        {/* Therapist Grid */}
        {filteredTherapists.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            layout
          >
            <AnimatePresence>
              {filteredTherapists.map((therapist, index) => (
                <TherapistCard
                  key={therapist.id}
                  therapist={therapist}
                  onBookingClick={handleBookingClick}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No therapists found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Try adjusting your filters or search criteria to find more therapists that match your needs.
            </p>
            <button
              onClick={clearFilters}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>

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