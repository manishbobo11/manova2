/**
 * Test script to verify currency formatting
 */

import { formatINR } from './currency';

// Test the currency formatting
export function testCurrencyFormatting() {
  console.log('🧪 Testing Currency Formatting');
  console.log('=' .repeat(40));
  
  // Test with the actual therapist prices
  const testPrices = [
    207500, // Dr. Sarah Johnson - Online
    290500, // Dr. Sarah Johnson - In-Person
    182600, // Dr. Raj Patel - Online
    265600, // Dr. Raj Patel - In-Person
    166000, // Dr. Priya Sharma - Online
    190900, // Dr. Michael Chen - Online
    273900, // Dr. Michael Chen - In-Person
    215800, // Dr. Anita Gupta - Online
    298800, // Dr. Anita Gupta - In-Person
    224100, // Dr. Emily Rodriguez - Online
    307100, // Dr. Emily Rodriguez - In-Person
    232400, // Dr. James Wilson - Online
    315400, // Dr. James Wilson - In-Person
    228250, // Dr. Lisa Thompson - Online
    311250  // Dr. Lisa Thompson - In-Person
  ];
  
  testPrices.forEach((price, index) => {
    const formatted = formatINR(price);
    console.log(`   Price ${index + 1}: ${price} → ${formatted}`);
  });
  
  console.log('\n✅ Currency formatting test completed!');
  console.log('   All prices should now display in INR (₹) format');
}

// Run the test
testCurrencyFormatting(); 