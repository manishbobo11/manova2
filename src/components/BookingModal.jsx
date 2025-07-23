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
  CreditCard
} from 'lucide-react';
import { formatINR } from '../utils/currency';

const BookingModal = ({ 
  isOpen, 
  onClose, 
  therapist,
  onBookingConfirm 
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedMode, setSelectedMode] = useState('Online');
  const [step, setStep] = useState(1); // 1: Date/Time, 2: Confirmation, 3: Payment
  const [currentWeek, setCurrentWeek] = useState(0);

  if (!therapist) return null;

  // Generate next 7 days with default time slots
  const generateCalendarWeeks = () => {
    const weeks = [];
    const today = new Date();
    const defaultTimeSlots = ["10:00", "14:00", "18:00"]; // 10:00 AM, 2:00 PM, 6:00 PM
    
    // Generate only next 7 days (1 week)
    const week = [];
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date(today);
      date.setDate(today.getDate() + dayOffset);
      
      const dateStr = date.toISOString().split('T')[0];
      
      // Use therapist availability if exists, otherwise use default slots
      const availability = therapist.availability?.slots?.find(slot => slot.date === dateStr);
      const times = availability?.times || defaultTimeSlots;
      
      week.push({
        date,
        dateStr,
        available: true, // Make all dates available
        times: times
      });
    }
    weeks.push(week);
    return weeks;
  };

  const calendarWeeks = generateCalendarWeeks();
  const currentWeekData = calendarWeeks[currentWeek] || [];

  const handleDateSelect = (dateData) => {
    if (!dateData.available) return;
    setSelectedDate(dateData);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleNext = () => {
    if (step === 1 && selectedDate && selectedTime) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBookingSubmit = () => {
    const bookingData = {
      therapist: therapist,
      date: selectedDate.dateStr,
      time: selectedTime,
      mode: selectedMode,
      price: selectedMode === 'Online' ? therapist.pricing.online : therapist.pricing.inPerson
    };
    
    onBookingConfirm(bookingData);
    onClose();
    
    // Reset state
    setStep(1);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedMode('Online');
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{therapist.name}</h2>
                    <p className="text-purple-100">{therapist.credentials}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Star className="w-4 h-4 text-yellow-300 fill-current" />
                      <span className="text-sm">{therapist.rating} ({therapist.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center space-x-4 mt-6">
                {[1, 2, 3].map((stepNum) => (
                  <div key={stepNum} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      step >= stepNum ? 'bg-white text-purple-600' : 'bg-white/20 text-white'
                    }`}>
                      {step > stepNum ? <Check className="w-4 h-4" /> : stepNum}
                    </div>
                    {stepNum < 3 && (
                      <div className={`w-12 h-1 mx-2 ${
                        step > stepNum ? 'bg-white' : 'bg-white/20'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {step === 1 && (
                <div className="space-y-6">
                  {/* Mode Selection */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Session Type</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {therapist.mode.map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setSelectedMode(mode)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            selectedMode === mode
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            {mode === 'Online' ? (
                              <Video className="w-6 h-6 text-purple-600" />
                            ) : (
                              <MapPin className="w-6 h-6 text-purple-600" />
                            )}
                            <div className="text-left">
                              <p className="font-semibold text-gray-900">{mode}</p>
                              <p className="text-sm text-gray-600">
                                {formatINR(mode === 'Online' ? therapist.pricing.online : therapist.pricing.inPerson)}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calendar */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Select Date (Next 7 Days)</h3>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                          {day}
                        </div>
                      ))}
                      {currentWeekData.map((dateData, index) => (
                        <button
                          key={index}
                          onClick={() => handleDateSelect(dateData)}
                          disabled={!dateData.available}
                          className={`aspect-square p-2 rounded-xl text-sm font-medium transition-all ${
                            selectedDate?.dateStr === dateData.dateStr
                              ? 'bg-purple-600 text-white'
                              : dateData.available
                              ? 'bg-gray-100 hover:bg-purple-100 text-gray-900'
                              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {dateData.date.getDate()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Slots */}
                  {selectedDate && selectedDate.times.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Available Times - {formatDate(selectedDate.date)}
                      </h3>
                      <div className="grid grid-cols-4 gap-3">
                        {selectedDate.times.map((time) => (
                          <button
                            key={time}
                            onClick={() => handleTimeSelect(time)}
                            className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                              selectedTime === time
                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-gray-200 hover:border-purple-300 text-gray-700'
                            }`}
                          >
                            {formatTime(time)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">Confirm Your Booking</h3>
                  
                  <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Therapist:</span>
                      <span className="font-semibold">{therapist.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-semibold">{formatDate(selectedDate.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-semibold">{formatTime(selectedTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Session Type:</span>
                      <span className="font-semibold">{selectedMode}</span>
                    </div>
                    <div className="flex justify-between border-t pt-4">
                      <span className="text-lg font-bold">Total:</span>
                      <span className="text-lg font-bold text-purple-600">
                        {formatINR(selectedMode === 'Online' ? therapist.pricing.online : therapist.pricing.inPerson)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900">Session Details</h4>
                        <p className="text-sm text-blue-700">
                          You'll receive a confirmation email with session details and preparation tips.
                          {selectedMode === 'Online' && ' A secure video link will be provided.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">Payment</h3>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-green-900">Secure Payment</h4>
                        <p className="text-green-700">Your payment information is encrypted and secure</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number
                        </label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV
                          </label>
                          <input
                            type="text"
                            placeholder="123"
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex justify-between items-center">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Back
                  </button>
                )}
                
                <div className="ml-auto">
                  {step < 3 ? (
                    <motion.button
                      onClick={handleNext}
                      disabled={step === 1 && (!selectedDate || !selectedTime)}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Continue
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={handleBookingSubmit}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Confirm Booking
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;