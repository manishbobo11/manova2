import React from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  MapPin, 
  Clock, 
  Video, 
  User, 
  Globe, 
  Calendar,
  Award,
  MessageCircle,
  Heart,
  Brain,
  Shield,
  Sparkles
} from 'lucide-react';
import { formatINR } from '../utils/currency';

const TherapistCard = ({ 
  therapist, 
  onBookingClick, 
  className = "",
  index = 0,
  isModern = false
}) => {
  const {
    id,
    name,
    avatar,
    specializations = [],
    languages = [],
    mode = [],
    matchScore,
    experience,
    credentials,
    bio,
    rating,
    reviewCount,
    pricing,
    location
  } = therapist;

  const handleBookingClick = () => {
    onBookingClick(therapist);
  };

  const getSpecializationColor = (spec) => {
    const colorMap = {
      'Work Stress': 'bg-blue-50 text-blue-700 border-blue-200',
      'Anxiety': 'bg-amber-50 text-amber-700 border-amber-200',
      'Relationships': 'bg-rose-50 text-rose-700 border-rose-200',
      'Health Anxiety': 'bg-red-50 text-red-700 border-red-200',
      'Academic Stress': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Depression': 'bg-purple-50 text-purple-700 border-purple-200',
      'Trauma Recovery': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Family Therapy': 'bg-pink-50 text-pink-700 border-pink-200',
      'Mindfulness': 'bg-teal-50 text-teal-700 border-teal-200',
      'Couples Therapy': 'bg-violet-50 text-violet-700 border-violet-200'
    };
    return colorMap[spec] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getSpecializationIcon = (spec) => {
    const iconMap = {
      'Work Stress': '💼',
      'Anxiety': '🧠',
      'Relationships': '💕',
      'Health Anxiety': '🏥',
      'Academic Stress': '📚',
      'Depression': '🌱',
      'Trauma Recovery': '🛡️',
      'Family Therapy': '👨‍👩‍👧‍👦',
      'Mindfulness': '🧘‍♀️',
      'Couples Therapy': '💑'
    };
    return iconMap[spec] || '💬';
  };

  if (isModern) {
    return (
      <div className={`bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 group ${className}`}>
        {/* Match Badge */}
        {matchScore && (
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
              <Sparkles className="inline w-3 h-3 mr-1" />
              {matchScore}% Match
            </div>
          </div>
        )}

        {/* Header with Avatar */}
        <div className="relative p-6 pb-4">
          <div className="flex items-start space-x-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                <img 
                  src={avatar || '/images/default-avatar.svg'} 
                  alt={name}
                  className="w-20 h-20 rounded-2xl object-cover"
                />
              </div>
              {/* Online Status */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-3 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            
            {/* Basic Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-slate-800 mb-1 truncate">{name}</h3>
              <p className="text-sm text-slate-600 mb-2">{credentials}</p>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-3">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-semibold text-slate-700">{rating}</span>
                </div>
                <span className="text-xs text-slate-500">({reviewCount} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specializations */}
        <div className="px-6 mb-4">
          <div className="flex flex-wrap gap-2">
            {specializations.slice(0, 2).map((spec, index) => (
              <span
                key={index}
                className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium border ${getSpecializationColor(spec)}`}
              >
                <span>{getSpecializationIcon(spec)}</span>
                <span>{spec}</span>
              </span>
            ))}
            {specializations.length > 2 && (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                +{specializations.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="px-6 mb-4">
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
            {bio}
          </p>
        </div>

        {/* Details Grid */}
        <div className="px-6 mb-6">
          <div className="grid grid-cols-2 gap-4 text-xs">
            {/* Experience */}
            <div className="flex items-center space-x-2 text-slate-600">
              <Award className="w-4 h-4 text-blue-500" />
              <span>{experience} experience</span>
            </div>
            
            {/* Languages */}
            <div className="flex items-center space-x-2 text-slate-600">
              <Globe className="w-4 h-4 text-emerald-500" />
              <span>{languages.slice(0, 2).join(', ')}</span>
            </div>
            
            {/* Location */}
            <div className="flex items-center space-x-2 text-slate-600">
              <MapPin className="w-4 h-4 text-red-500" />
              <span className="truncate">{location}</span>
            </div>
            
            {/* Mode */}
            <div className="flex items-center space-x-2 text-slate-600">
              {mode.includes('Online') ? (
                <Video className="w-4 h-4 text-purple-500" />
              ) : (
                <MessageCircle className="w-4 h-4 text-purple-500" />
              )}
              <span>{mode.join(' & ')}</span>
            </div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="px-6 pb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm font-medium text-slate-600">Starting from</p>
              <p className="text-2xl font-bold text-slate-800">
                {formatINR(Math.min(pricing.online || 999999, pricing.inPerson || 999999))}
                <span className="text-sm font-normal text-slate-500">/session</span>
              </p>
            </div>
            
            {/* Next Available */}
            <div className="text-right">
              <p className="text-xs text-slate-500">Next available</p>
              <div className="flex items-center space-x-1 text-sm font-medium text-emerald-600">
                <Clock className="w-4 h-4" />
                <span>Today 2pm</span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <motion.button
            onClick={handleBookingClick}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group-hover:scale-105"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.3)"
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Heart className="w-5 h-5" />
            <span>Start Your Journey</span>
          </motion.button>
        </div>
      </div>
    );
  }

  // Fallback to original design if not modern
  return (
    <motion.div
      className={`bg-white rounded-2xl overflow-hidden transition-all duration-300 ${className}`}
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ 
        y: -4,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        transition: { duration: 0.2 }
      }}
    >
      {/* Header with Avatar and Match Score */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-md overflow-hidden">
                <img 
                  src={avatar || '/images/default-avatar.svg'} 
                  alt={name}
                  className="w-16 h-16 rounded-2xl object-cover"
                />
              </div>
              
              {/* Online Status Indicator */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            
            {/* Basic Info */}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{name}</h3>
              <p className="text-sm text-gray-600 mb-2">{credentials}</p>
              
              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-semibold text-gray-700">{rating}</span>
                </div>
                <span className="text-xs text-gray-500">({reviewCount} reviews)</span>
              </div>
            </div>
          </div>
          
          {/* Match Score */}
          {matchScore && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full">
              <span className="text-sm font-bold">{matchScore}% match</span>
            </div>
          )}
        </div>

        {/* Specializations */}
        <div className="flex flex-wrap gap-2 mb-4">
          {specializations.slice(0, 3).map((spec, index) => (
            <span
              key={index}
              className={`px-3 py-1 rounded-full text-xs font-medium ${getSpecializationColor(spec)}`}
            >
              {spec}
            </span>
          ))}
          {specializations.length > 3 && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              +{specializations.length - 3} more
            </span>
          )}
        </div>

        {/* Bio */}
        <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
          {bio}
        </p>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mb-6">
          {/* Experience */}
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-blue-500" />
            <span>{experience} experience</span>
          </div>
          
          {/* Location */}
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-red-500" />
            <span>{location}</span>
          </div>
          
          {/* Languages */}
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-green-500" />
            <span>{languages.slice(0, 2).join(', ')}</span>
          </div>
          
          {/* Mode */}
          <div className="flex items-center space-x-2">
            {mode.includes('Online') ? (
              <Video className="w-4 h-4 text-purple-500" />
            ) : (
              <MessageCircle className="w-4 h-4 text-purple-500" />
            )}
            <span>{mode.join(' & ')}</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm font-semibold text-gray-700">Starting from</p>
            <p className="text-lg font-bold text-gray-900">
              {formatINR(Math.min(pricing.online || 999999, pricing.inPerson || 999999))}
              <span className="text-sm font-normal text-gray-500">/session</span>
            </p>
          </div>
          
          {/* Next Available */}
          <div className="text-right">
            <p className="text-xs text-gray-500">Next available</p>
            <div className="flex items-center space-x-1 text-sm font-medium text-gray-700">
              <Clock className="w-4 h-4" />
              <span>Today 2pm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Button */}
      <div className="px-6 pb-6">
        <motion.button
          onClick={handleBookingClick}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.4)"
          }}
          whileTap={{ scale: 0.98 }}
        >
          <Calendar className="w-5 h-5" />
          <span>Book Session</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default TherapistCard;