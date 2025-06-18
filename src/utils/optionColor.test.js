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