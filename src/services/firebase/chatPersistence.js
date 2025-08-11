/**
 * Chat Persistence Service for Manova
 * Handles saving and loading chat sessions to/from Firestore
 */

import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  setDoc,
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase';
import { generateSessionId, generateMessageId } from '../../utils/messageId';

export class ChatPersistenceService {
  constructor() {
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Generate a new session ID
   */
  generateSessionId() {
    return generateSessionId();
  }

  /**
   * Create a new chat session
   */
  async createChatSession(userId, language = 'English', initialMessage = null) {
    try {
      const sessionId = this.generateSessionId();
      const sessionData = {
        sessionId,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        languagePref: language,
        summary: '',
        messageCount: initialMessage ? 1 : 0,
        isActive: true
      };

      // Create session document
      await setDoc(doc(db, 'users', userId, 'chats', sessionId), sessionData);

      // Add initial message if provided
      if (initialMessage) {
        await this.saveMessage(userId, sessionId, initialMessage);
      }

      console.log(`✅ Created new chat session: ${sessionId}`);
      return { success: true, sessionId, sessionData };

    } catch (error) {
      console.error('❌ Error creating chat session:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save a message to Firestore with retry logic
   */
  async saveMessage(userId, sessionId, message, attempt = 1) {
    try {
      const messageData = {
        role: message.type === 'user' ? 'user' : 'ai',
        text: message.content || message.text || '',
        timestamp: serverTimestamp(),
        messageId: message.id || generateMessageId(message.type || 'msg'),
        emotion: message.emotion || null,
        suggestions: message.suggestions || [],
        journalPrompt: message.journalPrompt || '',
        moodContext: message.moodContext || '',
        crisisResponse: message.crisisResponse || false
      };

      // Save message to subcollection
      const messagesRef = collection(db, 'users', userId, 'chats', sessionId, 'messages');
      await addDoc(messagesRef, messageData);

      // Update session metadata
      await this.updateSessionMetadata(userId, sessionId);

      console.log(`💾 Message saved for session ${sessionId}`);
      return { success: true };

    } catch (error) {
      console.error(`❌ Error saving message (attempt ${attempt}):`, error);

      // Retry logic
      if (attempt < this.retryAttempts) {
        console.log(`🔄 Retrying message save in ${this.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.saveMessage(userId, sessionId, message, attempt + 1);
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Update session metadata (last updated, message count)
   */
  async updateSessionMetadata(userId, sessionId, additionalData = {}) {
    try {
      const sessionRef = doc(db, 'users', userId, 'chats', sessionId);
      const updateData = {
        lastUpdated: serverTimestamp(),
        ...additionalData
      };

      // Increment message count if not provided
      if (!additionalData.messageCount) {
        const messagesRef = collection(db, 'users', userId, 'chats', sessionId, 'messages');
        const messagesSnapshot = await getDocs(messagesRef);
        updateData.messageCount = messagesSnapshot.size;
      }

      await updateDoc(sessionRef, updateData);
      return { success: true };

    } catch (error) {
      console.error('❌ Error updating session metadata:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Load messages for a specific session
   */
  async loadSessionMessages(userId, sessionId) {
    try {
      const messagesRef = collection(db, 'users', userId, 'chats', sessionId, 'messages');
      const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
      const messagesSnapshot = await getDocs(messagesQuery);

      const messages = messagesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.messageId || doc.id,
          type: data.role === 'user' ? 'user' : 'ai',
          content: data.text,
          timestamp: data.timestamp?.toDate() || new Date(),
          emotion: data.emotion,
          suggestions: data.suggestions || [],
          journalPrompt: data.journalPrompt || '',
          moodContext: data.moodContext || '',
          crisisResponse: data.crisisResponse || false
        };
      });

      console.log(`📚 Loaded ${messages.length} messages for session ${sessionId}`);
      return { success: true, messages };

    } catch (error) {
      console.error('❌ Error loading session messages:', error);
      return { success: false, error: error.message, messages: [] };
    }
  }

  /**
   * Get the latest active session for a user
   */
  async getLatestSession(userId) {
    try {
      const chatsRef = collection(db, 'users', userId, 'chats');
      const latestQuery = query(
        chatsRef, 
        orderBy('lastUpdated', 'desc'), 
        limit(1)
      );
      const snapshot = await getDocs(latestQuery);

      if (snapshot.empty) {
        console.log('📝 No existing sessions found');
        return { success: true, session: null };
      }

      const sessionDoc = snapshot.docs[0];
      const sessionData = {
        sessionId: sessionDoc.id,
        ...sessionDoc.data()
      };

      console.log(`🔍 Found latest session: ${sessionData.sessionId}`);
      return { success: true, session: sessionData };

    } catch (error) {
      console.error('❌ Error getting latest session:', error);
      return { success: false, error: error.message, session: null };
    }
  }

  /**
   * Get chat history for dashboard view
   */
  async getChatHistory(userId, limitCount = 5) {
    try {
      const chatsRef = collection(db, 'users', userId, 'chats');
      const historyQuery = query(
        chatsRef,
        orderBy('lastUpdated', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(historyQuery);

      const chatHistory = await Promise.all(
        snapshot.docs.map(async (sessionDoc) => {
          const sessionData = sessionDoc.data();
          
          // Get first message as preview
          const messagesRef = collection(db, 'users', userId, 'chats', sessionDoc.id, 'messages');
          const firstMessageQuery = query(messagesRef, orderBy('timestamp', 'asc'), limit(1));
          const firstMessageSnapshot = await getDocs(firstMessageQuery);
          
          let firstMessage = '';
          if (!firstMessageSnapshot.empty) {
            const firstMessageData = firstMessageSnapshot.docs[0].data();
            firstMessage = firstMessageData.text.substring(0, 100) + (firstMessageData.text.length > 100 ? '...' : '');
          }

          return {
            sessionId: sessionDoc.id,
            createdAt: sessionData.createdAt?.toDate(),
            lastUpdated: sessionData.lastUpdated?.toDate(),
            summary: sessionData.summary || firstMessage,
            messageCount: sessionData.messageCount || 0,
            languagePref: sessionData.languagePref || 'English',
            preview: firstMessage
          };
        })
      );

      console.log(`📋 Retrieved ${chatHistory.length} chat sessions`);
      return { success: true, chatHistory };

    } catch (error) {
      console.error('❌ Error getting chat history:', error);
      return { success: false, error: error.message, chatHistory: [] };
    }
  }

  /**
   * Generate and save session summary using AI
   */
  async generateSessionSummary(userId, sessionId, chatEngine) {
    try {
      // Load all messages for the session
      const { success, messages } = await this.loadSessionMessages(userId, sessionId);
      
      if (!success || messages.length < 3) {
        console.log('🤷 Not enough messages for summary generation');
        return { success: false, error: 'Insufficient messages for summary' };
      }

      // Create conversation text for summarization
      const conversationText = messages
        .map(msg => `${msg.type === 'user' ? 'User' : 'Sarthi'}: ${msg.content}`)
        .join('\n');

      // Generate summary prompt
      const summaryPrompt = `Analyze this emotional wellness conversation and create a 1-sentence summary focusing on the main emotional theme and outcome.

Conversation:
${conversationText}

Instructions:
- Focus on the user's primary emotional state and any progress made
- Keep it under 100 characters
- Use empathetic, caring language
- Example: "Helped user process work stress and find clarity through breathing exercises"

Summary:`;

      // Generate summary using ChatEngine
      const summaryResponse = await chatEngine.callAzureGPT(summaryPrompt);
      const summary = summaryResponse.trim().substring(0, 150);

      // Save summary to session
      await this.updateSessionMetadata(userId, sessionId, { 
        summary,
        summaryGeneratedAt: serverTimestamp()
      });

      console.log(`📝 Generated session summary: ${summary}`);
      return { success: true, summary };

    } catch (error) {
      console.error('❌ Error generating session summary:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Listen for real-time updates to a session
   */
  subscribeToSession(userId, sessionId, onUpdate) {
    const messagesRef = collection(db, 'users', userId, 'chats', sessionId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));

    return onSnapshot(messagesQuery, (snapshot) => {
      const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.messageId || doc.id,
          type: data.role === 'user' ? 'user' : 'ai',
          content: data.text,
          timestamp: data.timestamp?.toDate() || new Date(),
          emotion: data.emotion,
          suggestions: data.suggestions || [],
          journalPrompt: data.journalPrompt || '',
          moodContext: data.moodContext || '',
          crisisResponse: data.crisisResponse || false
        };
      });

      onUpdate(messages);
    }, (error) => {
      console.error('❌ Error in session subscription:', error);
    });
  }

  /**
   * Mark session as inactive/closed
   */
  async closeSession(userId, sessionId, chatEngine = null) {
    try {
      // Generate summary if ChatEngine is provided and session has enough messages
      if (chatEngine) {
        await this.generateSessionSummary(userId, sessionId, chatEngine);
      }

      // Mark session as inactive
      await this.updateSessionMetadata(userId, sessionId, { 
        isActive: false,
        closedAt: serverTimestamp()
      });

      console.log(`🔒 Closed session: ${sessionId}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Error closing session:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const chatPersistence = new ChatPersistenceService();
export default chatPersistence;