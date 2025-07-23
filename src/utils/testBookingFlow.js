/**
 * Test script to verify the booking flow works correctly
 */

import { bookTherapistSession } from '../services/bookTherapistSession';

// Mock booking data for testing
const mockBookingData = {
  userId: 'test-user-123',
  therapistId: '1',
  therapistName: 'Dr. Emily Rodriguez',
  sessionType: 'Online',
  date: '2024-01-15',
  time: '14:00',
  userName: 'Test User',
  userEmail: 'test@example.com',
  userPhone: '+91 98765 43210',
  notes: 'Test booking for verification'
};

/**
 * Test the booking flow
 */
export async function testBookingFlow() {
  console.log('🧪 Testing Booking Flow');
  console.log('=' .repeat(40));
  
  try {
    console.log('📤 Attempting to book session...');
    console.log('📋 Booking data:', mockBookingData);
    
    const result = await bookTherapistSession(mockBookingData);
    
    if (result.success) {
      console.log('✅ Booking successful!');
      console.log(`   Booking ID: ${result.bookingId}`);
      console.log(`   Message: ${result.message}`);
    } else {
      console.log('❌ Booking failed');
      console.log(`   Error: ${result.error}`);
      console.log(`   Message: ${result.message}`);
    }
    
  } catch (error) {
    console.log('❌ Booking error:', error);
    console.log(`   Error message: ${error.message}`);
  }
  
  console.log('\n✅ Booking flow test completed!');
}

// Run the test
testBookingFlow(); 