/**
 * Utility for generating unique message IDs
 * Prevents duplicate keys by using timestamp, counter, and random string
 */

// Use a more robust counter that persists across module reloads
let messageCounter = Date.now();

/**
 * Generate a unique message ID
 * @param {string} type - Message type ('user' or 'ai')
 * @returns {string} Unique message ID
 */
export const generateMessageId = (type = 'msg') => {
  messageCounter++;
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const counter = messageCounter.toString(36);
  const microseconds = performance.now().toString(36).replace('.', '');
  return `${type}_${timestamp}_${counter}_${random}_${microseconds}`;
};

/**
 * Generate a unique session ID
 * @returns {string} Unique session ID
 */
export const generateSessionId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `session_${timestamp}_${random}`;
};

/**
 * Generate a unique ID with additional entropy
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique ID
 */
export const generateUniqueId = (prefix = 'id') => {
  const timestamp = Date.now();
  const random1 = Math.random().toString(36).substr(2, 9);
  const random2 = Math.random().toString(36).substr(2, 9);
  return `${prefix}_${timestamp}_${random1}_${random2}`;
};

export default generateMessageId;