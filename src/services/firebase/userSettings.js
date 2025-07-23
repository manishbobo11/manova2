import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

// User settings collection name
const USER_SETTINGS_COLLECTION = 'userSettings';

/**
 * Get user settings from Firebase
 * @param {string} userId - User ID
 * @returns {Object} User settings object
 */
export const getUserSettings = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const userSettingsRef = doc(db, USER_SETTINGS_COLLECTION, userId);
    const userSettingsDoc = await getDoc(userSettingsRef);

    if (userSettingsDoc.exists()) {
      return userSettingsDoc.data();
    } else {
      // Return default settings if user settings don't exist
      const defaultSettings = getDefaultSettings();
      await setDoc(userSettingsRef, {
        ...defaultSettings,
        userId,
        createdAt: new Date().toISOString()
      });
      return defaultSettings;
    }
  } catch (error) {
    console.error('Error getting user settings:', error);
    throw error;
  }
};

/**
 * Update user settings in Firebase
 * @param {string} userId - User ID
 * @param {Object} settings - Settings to update
 * @returns {Promise} Promise that resolves when update is complete
 */
export const updateUserSettings = async (userId, settings) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const userSettingsRef = doc(db, USER_SETTINGS_COLLECTION, userId);
    const userSettingsDoc = await getDoc(userSettingsRef);

    const updateData = {
      ...settings,
      updatedAt: new Date().toISOString()
    };

    if (userSettingsDoc.exists()) {
      await updateDoc(userSettingsRef, updateData);
    } else {
      await setDoc(userSettingsRef, {
        ...getDefaultSettings(),
        ...updateData,
        userId,
        createdAt: new Date().toISOString()
      });
    }

    return updateData;
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
};

/**
 * Get default user settings
 * @returns {Object} Default settings object
 */
export const getDefaultSettings = () => ({
  preferredLanguage: 'English',
  chatSettings: {
    enableTypingIndicator: true,
    enableSoundNotifications: false,
    enablePushNotifications: true,
    messageHistoryLimit: 100,
    autoSave: true
  },
  privacySettings: {
    shareDataForImprovements: true,
    anonymizeData: true,
    retentionPeriod: 90 // days
  },
  wellnessSettings: {
    enableCrisisDetection: true,
    enableEmotionalTracking: true,
    enableStressPatternAnalysis: true,
    reminderFrequency: 'daily',
    enableMoodTracking: true
  },
  accessibilitySettings: {
    fontSize: 'medium',
    highContrast: false,
    screenReader: false,
    reducedMotion: false
  },
  theme: 'light'
});

/**
 * Update language preference specifically
 * @param {string} userId - User ID
 * @param {string} language - Language preference
 * @returns {Promise} Promise that resolves when update is complete
 */
export const updateLanguagePreference = async (userId, language) => {
  try {
    const validLanguages = ['English', 'Hindi', 'Hinglish'];
    if (!validLanguages.includes(language)) {
      throw new Error(`Invalid language: ${language}. Valid options are: ${validLanguages.join(', ')}`);
    }

    return await updateUserSettings(userId, { preferredLanguage: language });
  } catch (error) {
    console.error('Error updating language preference:', error);
    throw error;
  }
};

/**
 * Get chat history settings
 * @param {string} userId - User ID
 * @returns {Object} Chat history settings
 */
export const getChatHistorySettings = async (userId) => {
  try {
    const settings = await getUserSettings(userId);
    return settings.chatSettings || getDefaultSettings().chatSettings;
  } catch (error) {
    console.error('Error getting chat history settings:', error);
    throw error;
  }
};

/**
 * Update chat history settings
 * @param {string} userId - User ID
 * @param {Object} chatSettings - Chat settings to update
 * @returns {Promise} Promise that resolves when update is complete
 */
export const updateChatHistorySettings = async (userId, chatSettings) => {
  try {
    const currentSettings = await getUserSettings(userId);
    const updatedChatSettings = {
      ...currentSettings.chatSettings,
      ...chatSettings
    };

    return await updateUserSettings(userId, { chatSettings: updatedChatSettings });
  } catch (error) {
    console.error('Error updating chat history settings:', error);
    throw error;
  }
};

/**
 * Get wellness settings
 * @param {string} userId - User ID
 * @returns {Object} Wellness settings
 */
export const getWellnessSettings = async (userId) => {
  try {
    const settings = await getUserSettings(userId);
    return settings.wellnessSettings || getDefaultSettings().wellnessSettings;
  } catch (error) {
    console.error('Error getting wellness settings:', error);
    throw error;
  }
};

/**
 * Update wellness settings
 * @param {string} userId - User ID
 * @param {Object} wellnessSettings - Wellness settings to update
 * @returns {Promise} Promise that resolves when update is complete
 */
export const updateWellnessSettings = async (userId, wellnessSettings) => {
  try {
    const currentSettings = await getUserSettings(userId);
    const updatedWellnessSettings = {
      ...currentSettings.wellnessSettings,
      ...wellnessSettings
    };

    return await updateUserSettings(userId, { wellnessSettings: updatedWellnessSettings });
  } catch (error) {
    console.error('Error updating wellness settings:', error);
    throw error;
  }
};

/**
 * Reset user settings to default
 * @param {string} userId - User ID
 * @returns {Promise} Promise that resolves when reset is complete
 */
export const resetUserSettings = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const userSettingsRef = doc(db, USER_SETTINGS_COLLECTION, userId);
    const defaultSettings = getDefaultSettings();
    
    await setDoc(userSettingsRef, {
      ...defaultSettings,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return defaultSettings;
  } catch (error) {
    console.error('Error resetting user settings:', error);
    throw error;
  }
};

/**
 * Export user settings for backup
 * @param {string} userId - User ID
 * @returns {Object} User settings with metadata
 */
export const exportUserSettings = async (userId) => {
  try {
    const settings = await getUserSettings(userId);
    return {
      ...settings,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  } catch (error) {
    console.error('Error exporting user settings:', error);
    throw error;
  }
};

/**
 * Import user settings from backup
 * @param {string} userId - User ID
 * @param {Object} settingsData - Settings data to import
 * @returns {Promise} Promise that resolves when import is complete
 */
export const importUserSettings = async (userId, settingsData) => {
  try {
    if (!userId || !settingsData) {
      throw new Error('User ID and settings data are required');
    }

    // Remove metadata fields before importing
    const { exportedAt, version, ...cleanSettings } = settingsData;
    
    return await updateUserSettings(userId, {
      ...cleanSettings,
      importedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error importing user settings:', error);
    throw error;
  }
};

/**
 * Get user settings with language-specific defaults
 * @param {string} userId - User ID
 * @param {string} language - Language preference
 * @returns {Object} User settings with language defaults
 */
export const getUserSettingsWithLanguage = async (userId, language = 'English') => {
  try {
    const settings = await getUserSettings(userId);
    
    // Update language if different
    if (settings.preferredLanguage !== language) {
      await updateLanguagePreference(userId, language);
      settings.preferredLanguage = language;
    }

    return settings;
  } catch (error) {
    console.error('Error getting user settings with language:', error);
    throw error;
  }
};