import { describe, it, expect } from 'vitest';

// Replicate getOptionColor logic from WellnessSurvey.jsx
const getOptionColor = (option, isPositive) => {
  if (option.color === 'green') return 'bg-green-100 text-green-800';
  if (option.color === 'red') return 'bg-red-100 text-red-800';
  // fallback to isPositive
  if (isPositive) {
    // Higher value = more positive
    return option.value >= 3 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  } else {
    // Higher value = more stress
    return option.value >= 3 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';
  }
};

describe('getOptionColor', () => {
  it('returns green for option.color green', () => {
    expect(getOptionColor({ value: 0, color: 'green' }, false)).toBe('bg-green-100 text-green-800');
  });
  it('returns red for option.color red', () => {
    expect(getOptionColor({ value: 4, color: 'red' }, false)).toBe('bg-red-100 text-red-800');
  });
  it('returns green for high value on positive question', () => {
    expect(getOptionColor({ value: 4 }, true)).toBe('bg-green-100 text-green-800');
  });
  it('returns gray for low value on positive question', () => {
    expect(getOptionColor({ value: 1 }, true)).toBe('bg-gray-100 text-gray-800');
  });
  it('returns red for high value on negative question', () => {
    expect(getOptionColor({ value: 4 }, false)).toBe('bg-red-100 text-red-800');
  });
  it('returns gray for low value on negative question', () => {
    expect(getOptionColor({ value: 1 }, false)).toBe('bg-gray-100 text-gray-800');
  });
});

// Test for analyzeStressLevel function
export async function testAnalyzeStressLevel() {
  const { analyzeStressLevel } = await import('../services/aiSuggestions');
  
  const testCases = [
    {
      question: "How often do you feel overwhelmed at work?",
      answer: "Very Often",
      expectedIntensity: "High"
    },
    {
      question: "How satisfied are you with your sleep quality?",
      answer: "Excellent",
      expectedIntensity: "Low"
    },
    {
      question: "How often do financial concerns worry you?",
      answer: "Sometimes",
      expectedIntensity: "Moderate"
    }
  ];

  console.log('Testing analyzeStressLevel function...');
  
  for (const testCase of testCases) {
    try {
      const result = await analyzeStressLevel(testCase.answer, testCase.question);
      console.log(`\nQuestion: "${testCase.question}"`);
      console.log(`Answer: "${testCase.answer}"`);
      console.log(`Result:`, result);
      console.log(`Expected intensity: ${testCase.expectedIntensity}, Got: ${result.intensity}`);
    } catch (error) {
      console.error(`Error testing "${testCase.answer}":`, error);
    }
  }
} 