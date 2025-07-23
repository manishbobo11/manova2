// Utility function to safely handle Firestore operations
export const safeFirestoreOperation = async (operation, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`Firestore operation failed (attempt ${attempt + 1}/${maxRetries + 1}):`, error);
      
      // Don't retry for certain error types
      if (error.code === 'permission-denied' || error.code === 'unauthenticated') {
        console.warn('Not retrying due to permission/authentication error');
        throw error;
      }
      
      // Retry with exponential backoff for connection issues
      if (attempt < maxRetries && (error.code === 'unavailable' || error.code === 'deadline-exceeded')) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.warn(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        break;
      }
    }
  }
  
  throw lastError;
};

// Enhanced toFirestoreSafe function with better error handling
export const toFirestoreSafe = (data) => {
  try {
    // Deep clone to avoid mutation
    const cloned = JSON.parse(JSON.stringify(data));
    
    // Convert Date objects to Firestore timestamps
    const convertDates = (obj) => {
      if (obj === null || obj === undefined) return obj;
      
      if (obj instanceof Date) {
        return obj.toISOString();
      }
      
      if (Array.isArray(obj)) {
        return obj.map(convertDates);
      }
      
      if (typeof obj === 'object') {
        const converted = {};
        for (const [key, value] of Object.entries(obj)) {
          converted[key] = convertDates(value);
        }
        return converted;
      }
      
      return obj;
    };
    
    return convertDates(cloned);
  } catch (error) {
    console.error('Error converting data to Firestore-safe format:', error);
    throw new Error('Failed to convert data to Firestore-safe format');
  }
}; 