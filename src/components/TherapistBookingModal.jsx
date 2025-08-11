import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Star,
  User,
  ChevronLeft,
  ChevronRight,
  Check,
  Phone,
  Mail,
  CheckCircle,
  ArrowLeft,
  FileText
} from 'lucide-react';
import { formatINR } from '../utils/currency';
import { bookTherapistSession } from '../services/bookTherapistSession';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const TherapistBookingModal = ({ 
  isOpen, 
  onClose, 
  therapist,
  onBookingConfirm 
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedMode, setSelectedMode] = useState('Online');
  const [step, setStep] = useState(1); // 1: Session Type, 2: Date/Time, 3: User Details, 4: Confirmation
  const [currentWeek, setCurrentWeek] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  
  // User details form
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  if (!therapist) return null;

  // Generate next 7 days with proper date formatting
  const generateNext7Days = () => {
    const dates = [];
    const today = new Date();
    const defaultTimeSlots = ["10:00", "14:00", "18:00"]; // 10:00 AM, 2:00 PM, 6:00 PM
    
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date(today);
      date.setDate(today.getDate() + dayOffset);
      
      const dateStr = date.toISOString().split('T')[0];
      
      // Use therapist availability if exists, otherwise use default slots
      const availability = therapist.availability?.slots?.find(slot => slot.date === dateStr);
      const times = availability?.times || defaultTimeSlots;
      
      // Format date using Intl API
      const formattedDate = new Intl.DateTimeFormat('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      }).format(date);
      
      dates.push({
        date,
        dateStr,
        formattedDate,
        available: true,
        times: times,
        dayOfWeek: date.getDay(), // 0 = Sunday, 1 = Monday, etc.
        isToday: dayOffset === 0
      });
    }
    
    return dates;
  };

  const availableDates = generateNext7Days();

  const handleDateSelect = (dateData) => {
    if (!dateData.available) return;
    setSelectedDate(dateData);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2 && selectedDate && selectedTime) {
      setStep(3);
    } else if (step === 3 && userDetails.name && userDetails.email && userDetails.phone) {
      handleBookingSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleBookingSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const bookingData = {
        userId: currentUser?.uid || 'demo-user',
        therapistId: therapist.id,
        therapistName: therapist.name,
        sessionType: selectedMode,
        date: selectedDate.dateStr,
        time: selectedTime,
        userName: userDetails.name,
        userEmail: userDetails.email,
        userPhone: userDetails.phone,
                 notes: userDetails.notes
      };
      
      const result = await bookTherapistSession(bookingData);
      
      if (result.success) {
        setBookingResult({
          success: true,
          bookingId: result.bookingId,
          ...bookingData
        });
        setStep(4);
        
        if (onBookingConfirm) {
          onBookingConfirm(bookingData);
        }
      } else {
        alert('Booking failed: ' + result.message);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('An error occurred while booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    // Reset all state when closing
    setStep(1);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedMode('Online');
    setUserDetails({ name: '', email: '', phone: '', notes: '' });
    setBookingResult(null);
    onClose();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Choose Session Type';
      case 2: return 'Select Date & Time';
      case 3: return 'Your Details';
      case 4: return 'Booking Confirmed!';
      default: return 'Book Session';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleModalClose}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-blue-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{therapist.name}</h2>
                    <p className="text-blue-100">{therapist.credentials}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Star className="w-4 h-4 text-yellow-300 fill-current" />
                      <span className="text-sm">{therapist.rating} ({therapist.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleModalClose}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center space-x-4 mt-6">
                {[1, 2, 3, 4].map((stepNum) => (
                  <div key={stepNum} className={`flex items-center`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      step >= stepNum ? 'bg-white text-blue-600' : 'bg-white/20 text-white'
                    }`}>
                      {step > stepNum ? <Check className="w-4 h-4" /> : stepNum}
                    </div>
                    {stepNum < 4 && (
                      <div className={`w-8 h-1 mx-2 transition-all ${
                        step > stepNum ? 'bg-white' : 'bg-white/20'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              
              <h3 className="text-xl font-semibold mt-4">{getStepTitle()}</h3>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[50vh] overflow-y-auto">
              {/* Step 1: Session Type */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {therapist.mode.map((mode) => (
                      <motion.button
                        key={mode}
                        onClick={() => setSelectedMode(mode)}
                        className={`p-6 rounded-2xl border-2 transition-all ${
                          selectedMode === mode
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex flex-col items-center space-y-3">
                          {mode === 'Online' ? (
                            <Video className="w-12 h-12 text-blue-600" />
                          ) : (
                            <MapPin className="w-12 h-12 text-blue-600" />
                          )}
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{mode}</p>
                            <p className="text-2xl font-bold text-blue-600 mt-2">
                              {formatINR(mode === 'Online' ? therapist.pricing.online : therapist.pricing.inPerson)}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {mode === 'Online' ? '50-minute video session' : '50-minute in-person session'}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Date & Time */}
              {step === 2 && (
                <div className="space-y-6">
                  {/* Calendar */}
                  <div>
                    <div className="mb-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Select Date</h4>
                      <p className="text-sm text-gray-600">Choose from the next 7 available days</p>
                    </div>

                    {/* Responsive Calendar Layout */}
                    <div className="mb-6">
                      {/* Mobile: Horizontal Scroll */}
                      <div className="md:hidden">
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                          {availableDates.map((dateData, index) => (
                            <button
                              key={index}
                              onClick={() => handleDateSelect(dateData)}
                              disabled={!dateData.available}
                              className={`flex-shrink-0 min-w-[100px] p-4 rounded-2xl border-2 text-center transition-all duration-200 ${
                                selectedDate?.dateStr === dateData.dateStr
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg transform scale-105'
                                  : dateData.available
                                  ? 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50 shadow-sm'
                                  : 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
                              }`}
                            >
                              <div className="text-xs font-medium mb-1">
                                {dateData.formattedDate.split(', ')[0]}
                              </div>
                              <div className={`text-sm font-bold ${
                                dateData.isToday ? 'text-blue-600' : ''
                              }`}>
                                {dateData.formattedDate.split(', ')[1]}
                              </div>
                              {dateData.isToday && (
                                <div className="text-xs text-blue-600 mt-1">Today</div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Desktop: Grid Layout */}
                      <div className="hidden md:grid md:grid-cols-7 gap-3">
                        {availableDates.map((dateData, index) => (
                          <button
                            key={index}
                            onClick={() => handleDateSelect(dateData)}
                            disabled={!dateData.available}
                            className={`p-4 rounded-2xl border-2 text-center transition-all duration-200 ${
                              selectedDate?.dateStr === dateData.dateStr
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg transform scale-105'
                                : dateData.available
                                ? 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50 shadow-sm'
                                : 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
                            }`}
                          >
                            <div className="text-xs font-medium mb-1">
                              {dateData.formattedDate.split(', ')[0]}
                            </div>
                            <div className={`text-sm font-bold ${
                              dateData.isToday ? 'text-blue-600' : ''
                            }`}>
                              {dateData.formattedDate.split(', ')[1]}
                            </div>
                            {dateData.isToday && (
                              <div className="text-xs text-blue-600 mt-1">Today</div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Time Slots */}
                  {selectedDate ? (
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">
                        Available Times
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        {selectedDate.formattedDate} • {selectedDate.times.length} slots available
                      </p>
                      
                      {selectedDate.times.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {selectedDate.times.map((time) => (
                            <button
                              key={time}
                              onClick={() => handleTimeSelect(time)}
                              className={`p-4 rounded-xl border-2 text-center font-medium transition-all duration-200 ${
                                selectedTime === time
                                  ? 'border-blue-600 bg-blue-600 text-white shadow-md transform scale-105'
                                  : 'border-gray-200 hover:border-blue-300 text-gray-700 hover:bg-blue-50 shadow-sm'
                              }`}
                            >
                              <div className="text-sm font-bold">{formatTime(time)}</div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No time slots available for this date</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">Select a date above to see available time slots</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: User Details */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
                    <h4 className="font-semibold text-blue-900 mb-2">Booking Summary</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p><span className="font-medium">Therapist:</span> {therapist.name}</p>
                      <p><span className="font-medium">Date:</span> {formatDate(selectedDate.date)}</p>
                      <p><span className="font-medium">Time:</span> {formatTime(selectedTime)}</p>
                      <p><span className="font-medium">Session:</span> {selectedMode}</p>
                      <p><span className="font-medium">Amount:</span> {formatINR(selectedMode === 'Online' ? therapist.pricing.online : therapist.pricing.inPerson)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <User className="inline w-4 h-4 mr-1" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={userDetails.name}
                        onChange={(e) => setUserDetails(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                        className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Mail className="inline w-4 h-4 mr-1" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={userDetails.email}
                        onChange={(e) => setUserDetails(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email address"
                        className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Phone className="inline w-4 h-4 mr-1" />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={userDetails.phone}
                        onChange={(e) => setUserDetails(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+91 98765 43210"
                        className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                    <div>
                                             <label className="block text-sm font-semibold text-gray-700 mb-2">
                         <FileText className="inline w-4 h-4 mr-1" />
                         Notes (Optional)
                       </label>
                      <textarea
                        value={userDetails.notes}
                        onChange={(e) => setUserDetails(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Add any specific notes for the therapist (e.g., medical conditions, preferred language)"
                        className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {step === 4 && bookingResult && (
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Your session has been booked successfully!</h3>
                    <p className="text-gray-600">Your therapy session has been confirmed. You'll receive a confirmation email shortly.</p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6 text-left">
                    <h4 className="font-semibold text-gray-900 mb-4">Session Details:</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Therapist:</span>
                        <span className="font-medium">{bookingResult.therapistName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Session Type:</span>
                        <span className="font-medium">{bookingResult.sessionType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">{formatDate(new Date(bookingResult.date))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">{formatTime(bookingResult.time)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-3">
                        <span className="text-gray-600">Booking ID:</span>
                        <span className="font-medium text-blue-600">#{bookingResult.bookingId?.slice(-8)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                    <p className="text-sm text-blue-800">
                      📧 Confirmation details have been sent to <strong>{bookingResult.userEmail}</strong>
                      {bookingResult.sessionType === 'Online' && (
                        <>
                          <br />🔗 Video session link will be shared 1 hour before the appointment
                        </>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {step < 4 && (
              <div className="border-t border-gray-200 p-6">
                <div className="flex justify-between items-center">
                  {step > 1 ? (
                    <motion.button
                      onClick={handleBack}
                      className="flex items-center space-x-2 px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                      whileHover={{ x: -5 }}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </motion.button>
                  ) : (
                    <div></div>
                  )}
                  
                  <div className="ml-auto">
                    <motion.button
                      onClick={handleNext}
                      disabled={
                        (step === 2 && (!selectedDate || !selectedTime)) ||
                        (step === 3 && (!userDetails.name || !userDetails.email || !userDetails.phone)) ||
                        isSubmitting
                      }
                      className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Booking...</span>
                        </>
                      ) : (
                        <>
                          <span>{step === 3 ? 'Submit Booking' : 'Continue'}</span>
                          {step < 3 && <ChevronRight className="w-4 h-4" />}
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation Footer */}
            {step === 4 && (
              <div className="border-t border-gray-200 p-6">
                <motion.button
                  onClick={() => {
                    handleModalClose();
                    navigate('/dashboard');
                  }}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Dashboard</span>
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TherapistBookingModal;