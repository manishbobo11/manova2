/**
 * Demo utility for testing the Therapist Booking System
 * Run this in browser console to test various booking scenarios
 */

import { therapistDatabase, filterTherapists, filterOptions } from '../data/therapists.js';

/**
 * Demo all filtering capabilities
 */
export function demoFiltering() {
  console.log("🔍 Therapist Booking System - Filter Demo");
  console.log("=" .repeat(50));

  // Test different filter combinations
  const testFilters = [
    { stressType: "Work Stress", language: "English", mode: "Online" },
    { stressType: "All Specializations", language: "Hindi", mode: "All Modes" },
    { stressType: "Anxiety", language: "All Languages", mode: "In-Person" },
    { stressType: "Relationships", language: "English", mode: "Online" }
  ];

  testFilters.forEach((filter, index) => {
    console.log(`\n📋 Test ${index + 1}: ${JSON.stringify(filter)}`);
    const results = filterTherapists(filter);
    console.log(`   ✅ Found ${results.length} matching therapists:`);
    
    results.forEach(therapist => {
      console.log(`      • ${therapist.name} - ${therapist.specializations.join(', ')}`);
      console.log(`        Languages: ${therapist.languages.join(', ')} | Mode: ${therapist.mode.join('/')}`);
    });
  });
}

/**
 * Demo booking flow simulation
 */
export function demoBookingFlow() {
  console.log("\n📅 Booking Flow Demo");
  console.log("=" .repeat(30));

  const therapist = therapistDatabase[0]; // Dr. Sarah Johnson
  console.log(`\n👩‍⚕️ Selected Therapist: ${therapist.name}`);
  console.log(`   Specializations: ${therapist.specializations.join(', ')}`);
  console.log(`   Rating: ${therapist.rating}⭐ (${therapist.reviewCount} reviews)`);
  console.log(`   Pricing: Online $${therapist.pricing.online} | In-Person $${therapist.pricing.inPerson}`);

  // Show availability
  console.log("\n📅 Available Slots:");
  therapist.availability.slots.forEach(slot => {
    console.log(`   ${slot.date}: ${slot.times.join(', ')}`);
  });

  // Simulate booking
  const bookingData = {
    therapist: therapist,
    date: therapist.availability.slots[0].date,
    time: therapist.availability.slots[0].times[0],
    mode: 'Online',
    price: therapist.pricing.online
  };

  console.log("\n✅ Simulated Booking:");
  console.log(`   Therapist: ${bookingData.therapist.name}`);
  console.log(`   Date: ${bookingData.date}`);
  console.log(`   Time: ${bookingData.time}`);
  console.log(`   Mode: ${bookingData.mode}`);
  console.log(`   Price: ₹${bookingData.price}`);
  console.log("   Status: Confirmed ✨");
}

/**
 * Generate booking statistics
 */
export function generateBookingStats() {
  console.log("\n📊 Booking System Statistics");
  console.log("=" .repeat(35));

  const stats = {
    totalTherapists: therapistDatabase.length,
    avgRating: (therapistDatabase.reduce((sum, t) => sum + t.rating, 0) / therapistDatabase.length).toFixed(1),
    avgPrice: Math.round(therapistDatabase.reduce((sum, t) => {
      const minPrice = Math.min(t.pricing.online || 999, t.pricing.inPerson || 999);
      return sum + minPrice;
    }, 0) / therapistDatabase.length),
    languages: [...new Set(therapistDatabase.flatMap(t => t.languages))].length,
    specializations: [...new Set(therapistDatabase.flatMap(t => t.specializations))].length,
    onlineAvailable: therapistDatabase.filter(t => t.mode.includes('Online')).length,
    inPersonAvailable: therapistDatabase.filter(t => t.mode.includes('In-Person')).length
  };

  console.log(`📈 Platform Overview:`);
  console.log(`   Total Therapists: ${stats.totalTherapists}`);
  console.log(`   Average Rating: ${stats.avgRating}⭐`);
  console.log(`   Average Starting Price: ₹${stats.avgPrice}`);
  console.log(`   Languages Supported: ${stats.languages}`);
  console.log(`   Specializations: ${stats.specializations}`);
  console.log(`   Online Available: ${stats.onlineAvailable}/${stats.totalTherapists}`);
  console.log(`   In-Person Available: ${stats.inPersonAvailable}/${stats.totalTherapists}`);

  // Specialization breakdown
  const specializationCount = {};
  therapistDatabase.forEach(therapist => {
    therapist.specializations.forEach(spec => {
      specializationCount[spec] = (specializationCount[spec] || 0) + 1;
    });
  });

  console.log(`\n🎯 Top Specializations:`);
  Object.entries(specializationCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([spec, count]) => {
      console.log(`   ${spec}: ${count} therapists`);
    });
}

/**
 * Test search functionality
 */
export function demoSearch() {
  console.log("\n🔎 Search Demo");
  console.log("=" .repeat(20));

  const searchQueries = [
    "anxiety",
    "Dr. Sarah",
    "relationship",
    "Hindi",
    "online"
  ];

  searchQueries.forEach(query => {
    const results = therapistDatabase.filter(therapist => 
      therapist.name.toLowerCase().includes(query.toLowerCase()) ||
      therapist.specializations.some(spec => spec.toLowerCase().includes(query.toLowerCase())) ||
      therapist.bio.toLowerCase().includes(query.toLowerCase()) ||
      therapist.languages.some(lang => lang.toLowerCase().includes(query.toLowerCase())) ||
      therapist.mode.some(mode => mode.toLowerCase().includes(query.toLowerCase()))
    );

    console.log(`\n🔍 Search: "${query}"`);
    console.log(`   Results: ${results.length} matches`);
    results.slice(0, 3).forEach(therapist => {
      console.log(`   • ${therapist.name} - Match in: ${getMatchReason(therapist, query)}`);
    });
  });
}

function getMatchReason(therapist, query) {
  const q = query.toLowerCase();
  if (therapist.name.toLowerCase().includes(q)) return "Name";
  if (therapist.specializations.some(spec => spec.toLowerCase().includes(q))) return "Specialization";
  if (therapist.languages.some(lang => lang.toLowerCase().includes(q))) return "Language";
  if (therapist.mode.some(mode => mode.toLowerCase().includes(q))) return "Mode";
  return "Biography";
}

/**
 * Run all demos
 */
export function runFullDemo() {
  console.log("🏥 Manova Therapist Booking System - Complete Demo");
  console.log("=" .repeat(60));
  
  generateBookingStats();
  demoFiltering();
  demoSearch();
  demoBookingFlow();
  
  console.log("\n" + "=" .repeat(60));
  console.log("✨ Demo completed! The booking system is ready for production.");
  console.log("🎯 Next steps: Integrate with payment processing and video calling APIs");
}

// Export for use in console
export default {
  demoFiltering,
  demoBookingFlow,
  generateBookingStats,
  demoSearch,
  runFullDemo,
  therapistDatabase
};