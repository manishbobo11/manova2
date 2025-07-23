/**
 * Currency formatting utilities for Indian Rupee (INR)
 */

/**
 * Formats price in Indian Rupees
 * @param {number} price - Price to format
 * @returns {string} - Formatted price string
 */
export function formatINR(price) {
  if (typeof price !== 'number' || isNaN(price)) {
    return '₹0';
  }
  
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

/**
 * Formats price without currency symbol
 * @param {number} price - Price to format
 * @returns {string} - Formatted price string without symbol
 */
export function formatINRValue(price) {
  if (typeof price !== 'number' || isNaN(price)) {
    return '0';
  }
  
  return new Intl.NumberFormat('en-IN').format(price);
}

export default { formatINR, formatINRValue };