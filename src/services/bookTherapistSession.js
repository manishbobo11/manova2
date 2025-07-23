/**
 * Firestore Integration for Therapist Booking System
 * Handles saving booking data to therapistBookings collection
 */

import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from './firebase.js';

/**
 * Books a therapy session and saves to Firestore
 * @param {Object} bookingData - The booking information
 * @returns {Promise<Object>} - Result with success status and booking ID
 */
export async function bookTherapistSession(bookingData) {
  try {
    
    const {
      userId,
      therapistId,
      therapistName,
      sessionType,
      date,
      time,
      userName,
      userEmail,
      userPhone,
      notes
    } = bookingData;

    // Enhanced validation with detailed error messages
    const validationErrors = [];
    
    if (!userId) validationErrors.push('userId is required');
    if (!therapistId) validationErrors.push('therapistId is required');
    if (!therapistName) validationErrors.push('therapistName is required');
    if (!sessionType) validationErrors.push('sessionType is required');
    if (!date) validationErrors.push('date is required');
    if (!time) validationErrors.push('time is required');
    if (!userName) validationErrors.push('userName is required');
    if (!userEmail) validationErrors.push('userEmail is required');
    if (!userPhone) validationErrors.push('userPhone is required');
    
    if (validationErrors.length > 0) {
      throw new Error(`Missing required booking information: ${validationErrors.join(', ')}`);
    }

    // Validate data types and format
    if (typeof userId !== 'string') throw new Error('userId must be a string');
    if (typeof therapistId !== 'string' && typeof therapistId !== 'number') throw new Error('therapistId must be a string or number');
    if (typeof therapistName !== 'string') throw new Error('therapistName must be a string');
    if (!['Online', 'In-Person'].includes(sessionType)) throw new Error('sessionType must be "Online" or "In-Person"');
    if (typeof date !== 'string') throw new Error('date must be a string');
    if (typeof time !== 'string') throw new Error('time must be a string');
    if (typeof userName !== 'string') throw new Error('userName must be a string');
    if (typeof userEmail !== 'string') throw new Error('userEmail must be a string');
    if (typeof userPhone !== 'string') throw new Error('userPhone must be a string');

    // Create booking document with proper data types
    const bookingDoc = {
      userId: String(userId),
      therapistId: String(therapistId),
      therapistName: String(therapistName),
      sessionType: String(sessionType),
      date: String(date),
      time: String(time),
      userName: String(userName),
      userEmail: String(userEmail),
      userPhone: String(userPhone),
      notes: notes ? String(notes) : '',
      status: 'confirmed',
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp()
    };

    // Check if Firestore is properly initialized
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    // Save to Firestore with better error handling
    const docRef = await addDoc(collection(db, 'therapistBookings'), bookingDoc);
    
    return {
      success: true,
      bookingId: docRef.id,
      message: 'Booking confirmed successfully!'
    };

  } catch (error) {
    console.error('Error booking therapy session:', error);
    
    return {
      success: false,
      error: error.message,
      message: `Failed to book session: ${error.message}`
    };
  }
}

/**
 * Gets user's therapy bookings
 * @param {string} userId - User's ID
 * @returns {Promise<Array>} - Array of user's bookings
 */
export async function getUserTherapistBookings(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const q = query(
      collection(db, 'therapistBookings'),
      where('userId', '==', userId),
      orderBy('bookingTimestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const bookings = [];

    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return bookings;

  } catch (error) {
    console.error('❌ Error fetching user bookings:', error);
    return [];
  }
}

/**
 * Gets therapist's bookings for a specific date
 * @param {string} therapistId - Therapist's ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Array>} - Array of booked time slots
 */
export async function getTherapistBookingsForDate(therapistId, date) {
  try {
    if (!therapistId || !date) {
      throw new Error('Therapist ID and date are required');
    }

    const q = query(
      collection(db, 'therapistBookings'),
      where('therapistId', '==', therapistId),
      where('date', '==', date),
      where('status', '==', 'confirmed')
    );

    const querySnapshot = await getDocs(q);
    const bookedSlots = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bookedSlots.push(data.time);
    });

    return bookedSlots;

  } catch (error) {
    console.error('❌ Error fetching therapist bookings:', error);
    return [];
  }
}

/**
 * Checks if a specific time slot is available
 * @param {string} therapistId - Therapist's ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:MM format
 * @returns {Promise<boolean>} - True if slot is available
 */
export async function isTimeSlotAvailable(therapistId, date, time) {
  try {
    const bookedSlots = await getTherapistBookingsForDate(therapistId, date);
    return !bookedSlots.includes(time);
  } catch (error) {
    console.error('❌ Error checking time slot availability:', error);
    return false;
  }
}

/**
 * Cancels a therapy booking
 * @param {string} bookingId - Booking ID to cancel
 * @returns {Promise<Object>} - Result with success status
 */
export async function cancelTherapistBooking(bookingId) {
  try {
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }

    // In a real app, you'd update the status instead of deleting
    await updateDoc(doc(db, 'therapistBookings', bookingId), {
      status: 'cancelled',
      cancelledAt: serverTimestamp()
    });

    
    return {
      success: true,
      message: 'Booking cancelled successfully'
    };

  } catch (error) {
    console.error('❌ Error cancelling booking:', error);
    
    return {
      success: false,
      error: error.message,
      message: 'Failed to cancel booking. Please try again.'
    };
  }
}

export default {
  bookTherapistSession,
  getUserTherapistBookings,
  getTherapistBookingsForDate,
  isTimeSlotAvailable,
  cancelTherapistBooking
};