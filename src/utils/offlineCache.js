// Offline Cache Utility for Manova
// Handles storing and retrieving data when network is unavailable

class OfflineCache {
  constructor() {
    this.cacheKey = 'manova_offline_cache';
    this.maxCacheSize = 50; // Maximum number of cached operations
  }

  // Store operation for later sync
  async cacheOperation(operation) {
    try {
      const cache = this.getCache();
      
      // Add timestamp and unique ID
      const cachedOp = {
        id: this.generateId(),
        timestamp: Date.now(),
        operation: operation,
        retryCount: 0
      };
      
      cache.push(cachedOp);
      
      // Limit cache size
      if (cache.length > this.maxCacheSize) {
        cache.shift(); // Remove oldest operation
      }
      
      this.setCache(cache);
      console.log('📦 Operation cached for offline sync:', cachedOp.id);
      
      return cachedOp.id;
    } catch (error) {
      console.error('Error caching operation:', error);
      throw error;
    }
  }

  // Get all cached operations
  getCachedOperations() {
    return this.getCache();
  }

  // Remove operation from cache
  removeCachedOperation(operationId) {
    try {
      const cache = this.getCache();
      const filteredCache = cache.filter(op => op.id !== operationId);
      this.setCache(filteredCache);
      console.log('🗑️ Removed cached operation:', operationId);
    } catch (error) {
      console.error('Error removing cached operation:', error);
    }
  }

  // Clear all cached operations
  clearCache() {
    try {
      localStorage.removeItem(this.cacheKey);
      console.log('🧹 Offline cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Get cache from localStorage
  getCache() {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Error reading cache:', error);
      return [];
    }
  }

  // Set cache to localStorage
  setCache(cache) {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(cache));
    } catch (error) {
      console.error('Error writing cache:', error);
      // If localStorage is full, try to clear some old entries
      this.clearOldCacheEntries();
    }
  }

  // Clear old cache entries when storage is full
  clearOldCacheEntries() {
    try {
      const cache = this.getCache();
      const sortedCache = cache.sort((a, b) => a.timestamp - b.timestamp);
      const halfSize = Math.floor(this.maxCacheSize / 2);
      const newCache = sortedCache.slice(-halfSize);
      this.setCache(newCache);
      console.log('🧹 Cleared old cache entries due to storage limit');
    } catch (error) {
      console.error('Error clearing old cache entries:', error);
    }
  }

  // Generate unique ID for cached operations
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get cache statistics
  getCacheStats() {
    const cache = this.getCache();
    return {
      totalOperations: cache.length,
      oldestOperation: cache.length > 0 ? new Date(Math.min(...cache.map(op => op.timestamp))) : null,
      newestOperation: cache.length > 0 ? new Date(Math.max(...cache.map(op => op.timestamp))) : null,
      totalSize: JSON.stringify(cache).length
    };
  }

  // Check if cache has pending operations
  hasPendingOperations() {
    return this.getCache().length > 0;
  }
}

// Create singleton instance
const offlineCache = new OfflineCache();

// Enhanced Firestore operations with offline support
export const offlineFirestoreOperations = {
  async getDoc(docRef, options = {}) {
    try {
      // Try online operation first
      const { getDoc } = await import('firebase/firestore');
      return await getDoc(docRef);
    } catch (error) {
      if (error.code === 'unavailable' || error.message.includes('network')) {
        console.warn('📡 Network unavailable, operation will be retried when online');
        // Cache the operation for later retry
        await offlineCache.cacheOperation({
          type: 'getDoc',
          docRef: docRef.path,
          options
        });
        throw new Error('Operation cached for offline retry');
      }
      throw error;
    }
  },

  async setDoc(docRef, data, options = {}) {
    try {
      // Try online operation first
      const { setDoc } = await import('firebase/firestore');
      return await setDoc(docRef, data, options);
    } catch (error) {
      if (error.code === 'unavailable' || error.message.includes('network')) {
        console.warn('📡 Network unavailable, operation cached for offline sync');
        // Cache the operation for later sync
        await offlineCache.cacheOperation({
          type: 'setDoc',
          docRef: docRef.path,
          data: data,
          options
        });
        return { success: true, cached: true };
      }
      throw error;
    }
  },

  async updateDoc(docRef, data) {
    try {
      // Try online operation first
      const { updateDoc } = await import('firebase/firestore');
      return await updateDoc(docRef, data);
    } catch (error) {
      if (error.code === 'unavailable' || error.message.includes('network')) {
        console.warn('📡 Network unavailable, operation cached for offline sync');
        // Cache the operation for later sync
        await offlineCache.cacheOperation({
          type: 'updateDoc',
          docRef: docRef.path,
          data: data
        });
        return { success: true, cached: true };
      }
      throw error;
    }
  },

  async addDoc(collectionRef, data) {
    try {
      // Try online operation first
      const { addDoc } = await import('firebase/firestore');
      return await addDoc(collectionRef, data);
    } catch (error) {
      if (error.code === 'unavailable' || error.message.includes('network')) {
        console.warn('📡 Network unavailable, operation cached for offline sync');
        // Cache the operation for later sync
        await offlineCache.cacheOperation({
          type: 'addDoc',
          collectionRef: collectionRef.path,
          data: data
        });
        return { success: true, cached: true };
      }
      throw error;
    }
  }
};

// Sync cached operations when back online
export const syncOfflineOperations = async (db) => {
  const cachedOps = offlineCache.getCachedOperations();
  
  if (cachedOps.length === 0) {
    console.log('✅ No offline operations to sync');
    return;
  }

  console.log(`🔄 Syncing ${cachedOps.length} offline operations...`);

  for (const cachedOp of cachedOps) {
    try {
      const { doc, collection, setDoc, updateDoc, addDoc } = await import('firebase/firestore');
      
      switch (cachedOp.operation.type) {
        case 'setDoc':
          await setDoc(doc(db, cachedOp.operation.docRef), cachedOp.operation.data, cachedOp.operation.options);
          break;
        case 'updateDoc':
          await updateDoc(doc(db, cachedOp.operation.docRef), cachedOp.operation.data);
          break;
        case 'addDoc':
          await addDoc(collection(db, cachedOp.operation.collectionRef), cachedOp.operation.data);
          break;
        default:
          console.warn('Unknown operation type:', cachedOp.operation.type);
      }
      
      // Remove from cache after successful sync
      offlineCache.removeCachedOperation(cachedOp.id);
      console.log(`✅ Synced operation: ${cachedOp.id}`);
      
    } catch (error) {
      console.error(`❌ Failed to sync operation ${cachedOp.id}:`, error);
      cachedOp.retryCount++;
      
      // Remove from cache if too many retries
      if (cachedOp.retryCount >= 3) {
        offlineCache.removeCachedOperation(cachedOp.id);
        console.warn(`🗑️ Removed operation ${cachedOp.id} after 3 failed attempts`);
      }
    }
  }
  
  console.log('🔄 Offline sync completed');
};

export default offlineCache; 