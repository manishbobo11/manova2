interface TurnSummary {
  id: string;
  userId: string;
  timestamp: Date;
  userMessage: string;
  sarthiResponse: string;
  intent: string;
  confidence: number;
  language: string;
  toolsUsed?: string[];
  stressLevel?: number;
  wellnessScore?: number;
  keyInsights?: string[];
  emotionalTone?: 'positive' | 'neutral' | 'negative' | 'crisis';
}

interface ContextSummary {
  userId: string;
  lastUpdated: Date;
  recentIntents: Array<{
    intent: string;
    frequency: number;
    lastOccurrence: Date;
  }>;
  stressPatterns: Array<{
    domain: string;
    averageScore: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
  wellnessTrend: {
    currentScore: number;
    averageScore: number;
    trend: 'improving' | 'declining' | 'stable';
    lastCheckin: Date;
  };
  conversationHistory: Array<{
    date: Date;
    topic: string;
    emotionalTone: string;
    toolsUsed: string[];
  }>;
  userPreferences: {
    language: string;
    responseStyle: 'detailed' | 'concise' | 'casual';
    preferredTopics: string[];
    avoidedTopics: string[];
  };
  crisisHistory: Array<{
    date: Date;
    severity: 'low' | 'medium' | 'high';
    resolved: boolean;
    helplineUsed: boolean;
  }>;
}

interface MemoryConfig {
  maxTurnSummaries: number;
  contextRetentionDays: number;
  crisisRetentionDays: number;
  summaryCompressionRatio: number;
}

// Default configuration
const DEFAULT_CONFIG: MemoryConfig = {
  maxTurnSummaries: 100,
  contextRetentionDays: 30,
  crisisRetentionDays: 90,
  summaryCompressionRatio: 0.8
};

/**
 * Memory management class for Sarthi
 */
export class SarthiMemory {
  private config: MemoryConfig;
  private turnSummaries: Map<string, TurnSummary[]> = new Map();
  private contextSummaries: Map<string, ContextSummary> = new Map();

  constructor(config: Partial<MemoryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Write a turn summary for a conversation exchange
   */
  async writeTurnSummary(summary: Omit<TurnSummary, 'id' | 'timestamp'>): Promise<string> {
    const turnSummary: TurnSummary = {
      ...summary,
      id: this.generateId(),
      timestamp: new Date()
    };

    const userId = summary.userId;
    if (!this.turnSummaries.has(userId)) {
      this.turnSummaries.set(userId, []);
    }

    const userSummaries = this.turnSummaries.get(userId)!;
    userSummaries.push(turnSummary);

    // Maintain maximum number of summaries per user
    if (userSummaries.length > this.config.maxTurnSummaries) {
      userSummaries.splice(0, userSummaries.length - this.config.maxTurnSummaries);
    }

    // Update context summary
    await this.updateContextSummary(userId, turnSummary);

    // Clean up old data
    await this.cleanupOldData(userId);

    return turnSummary.id;
  }

  /**
   * Fetch context summary for a user
   */
  async fetchContextSummary(userId: string): Promise<ContextSummary | null> {
    // Check if we have a cached context summary
    if (this.contextSummaries.has(userId)) {
      const summary = this.contextSummaries.get(userId)!;
      
      // Check if summary is recent enough (within last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (summary.lastUpdated > oneHourAgo) {
        return summary;
      }
    }

    // Generate fresh context summary
    const userSummaries = this.turnSummaries.get(userId) || [];
    if (userSummaries.length === 0) {
      return null;
    }

    const contextSummary = await this.generateContextSummary(userId, userSummaries);
    this.contextSummaries.set(userId, contextSummary);
    
    return contextSummary;
  }

  /**
   * Update context summary with new turn data
   */
  private async updateContextSummary(userId: string, turnSummary: TurnSummary): Promise<void> {
    const existingSummary = this.contextSummaries.get(userId);
    const userSummaries = this.turnSummaries.get(userId) || [];

    if (existingSummary) {
      // Update existing summary
      existingSummary.lastUpdated = new Date();
      
      // Update recent intents
      this.updateIntentFrequency(existingSummary.recentIntents, turnSummary.intent);
      
      // Update conversation history
      existingSummary.conversationHistory.push({
        date: turnSummary.timestamp,
        topic: this.extractTopic(turnSummary.userMessage),
        emotionalTone: turnSummary.emotionalTone || 'neutral',
        toolsUsed: turnSummary.toolsUsed || []
      });

      // Keep only recent conversation history
      const recentHistory = existingSummary.conversationHistory
        .slice(-20); // Keep last 20 conversations
      existingSummary.conversationHistory = recentHistory;

      // Update crisis history if applicable
      if (turnSummary.emotionalTone === 'crisis') {
        existingSummary.crisisHistory.push({
          date: turnSummary.timestamp,
          severity: 'medium', // Could be enhanced with severity detection
          resolved: false,
          helplineUsed: turnSummary.sarthiResponse.includes('KIRAN') || 
                       turnSummary.sarthiResponse.includes('1800-599-0019')
        });
      }

    } else {
      // Create new context summary
      const newSummary = await this.generateContextSummary(userId, userSummaries);
      this.contextSummaries.set(userId, newSummary);
    }
  }

  /**
   * Generate a comprehensive context summary from turn summaries
   */
  private async generateContextSummary(userId: string, turnSummaries: TurnSummary[]): Promise<ContextSummary> {
    const recentSummaries = turnSummaries
      .filter(summary => {
        const cutoffDate = new Date(Date.now() - this.config.contextRetentionDays * 24 * 60 * 60 * 1000);
        return summary.timestamp > cutoffDate;
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Analyze intents
    const intentFrequency = new Map<string, { count: number; lastOccurrence: Date }>();
    recentSummaries.forEach(summary => {
      const existing = intentFrequency.get(summary.intent);
      if (existing) {
        existing.count++;
        if (summary.timestamp > existing.lastOccurrence) {
          existing.lastOccurrence = summary.timestamp;
        }
      } else {
        intentFrequency.set(summary.intent, {
          count: 1,
          lastOccurrence: summary.timestamp
        });
      }
    });

    const recentIntents = Array.from(intentFrequency.entries())
      .map(([intent, data]) => ({
        intent,
        frequency: data.count,
        lastOccurrence: data.lastOccurrence
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5); // Top 5 intents

    // Analyze stress patterns (if available)
    const stressPatterns: Array<{ domain: string; averageScore: number; trend: 'increasing' | 'decreasing' | 'stable' }> = [];
    // This would be populated from stress domain data if available

    // Calculate wellness trend
    const wellnessScores = recentSummaries
      .filter(s => s.wellnessScore !== undefined)
      .map(s => s.wellnessScore!);
    
    const wellnessTrend = {
      currentScore: wellnessScores[0] || 0,
      averageScore: wellnessScores.length > 0 ? 
        wellnessScores.reduce((a, b) => a + b, 0) / wellnessScores.length : 0,
      trend: this.calculateTrend(wellnessScores),
      lastCheckin: recentSummaries.find(s => s.wellnessScore !== undefined)?.timestamp || new Date()
    };

    // Build conversation history
    const conversationHistory = recentSummaries.slice(0, 20).map(summary => ({
      date: summary.timestamp,
      topic: this.extractTopic(summary.userMessage),
      emotionalTone: summary.emotionalTone || 'neutral',
      toolsUsed: summary.toolsUsed || []
    }));

    // Analyze crisis history
    const crisisHistory = recentSummaries
      .filter(s => s.emotionalTone === 'crisis')
      .map(s => ({
        date: s.timestamp,
        severity: 'medium' as const, // Could be enhanced
        resolved: false,
        helplineUsed: s.sarthiResponse.includes('KIRAN') || 
                     s.sarthiResponse.includes('1800-599-0019')
      }));

    // Infer user preferences
    const userPreferences = this.inferUserPreferences(recentSummaries);

    return {
      userId,
      lastUpdated: new Date(),
      recentIntents,
      stressPatterns,
      wellnessTrend,
      conversationHistory,
      userPreferences,
      crisisHistory
    };
  }

  /**
   * Update intent frequency tracking
   */
  private updateIntentFrequency(
    recentIntents: Array<{ intent: string; frequency: number; lastOccurrence: Date }>,
    newIntent: string
  ): void {
    const existing = recentIntents.find(i => i.intent === newIntent);
    if (existing) {
      existing.frequency++;
      existing.lastOccurrence = new Date();
    } else {
      recentIntents.push({
        intent: newIntent,
        frequency: 1,
        lastOccurrence: new Date()
      });
    }

    // Sort by frequency and keep top 5
    recentIntents.sort((a, b) => b.frequency - a.frequency);
    if (recentIntents.length > 5) {
      recentIntents.splice(5);
    }
  }

  /**
   * Extract topic from user message
   */
  private extractTopic(message: string): string {
    const topics = [
      'stress', 'anxiety', 'sleep', 'exercise', 'relationships', 'work',
      'family', 'health', 'mood', 'goals', 'habits', 'meditation',
      'social', 'loneliness', 'depression', 'anger', 'fear', 'joy'
    ];

    const lowerMessage = message.toLowerCase();
    const foundTopic = topics.find(topic => lowerMessage.includes(topic));
    return foundTopic || 'general';
  }

  /**
   * Calculate trend from a series of numbers
   */
  private calculateTrend(values: number[]): 'improving' | 'declining' | 'stable' {
    if (values.length < 3) return 'stable';
    
    const recent = values.slice(0, Math.ceil(values.length / 2));
    const older = values.slice(Math.ceil(values.length / 2));
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    const difference = recentAvg - olderAvg;
    const threshold = 0.5; // Minimum change to consider trend significant
    
    if (difference > threshold) return 'improving';
    if (difference < -threshold) return 'declining';
    return 'stable';
  }

  /**
   * Infer user preferences from conversation history
   */
  private inferUserPreferences(summaries: TurnSummary[]): {
    language: string;
    responseStyle: 'detailed' | 'concise' | 'casual';
    preferredTopics: string[];
    avoidedTopics: string[];
  } {
    // Analyze language preference
    const languages = summaries.map(s => s.language);
    const language = languages.length > 0 ? 
      languages.reduce((a, b) => languages.filter(v => v === a).length >= languages.filter(v => v === b).length ? a : b) : 
      'en';

    // Analyze response style preference (based on message length and complexity)
    const avgResponseLength = summaries.reduce((sum, s) => sum + s.sarthiResponse.length, 0) / summaries.length;
    let responseStyle: 'detailed' | 'concise' | 'casual' = 'concise';
    if (avgResponseLength > 200) responseStyle = 'detailed';
    else if (avgResponseLength < 100) responseStyle = 'casual';

    // Analyze topic preferences
    const topics = summaries.map(s => this.extractTopic(s.userMessage));
    const topicFrequency = new Map<string, number>();
    topics.forEach(topic => {
      topicFrequency.set(topic, (topicFrequency.get(topic) || 0) + 1);
    });

    const preferredTopics = Array.from(topicFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic);

    const avoidedTopics: string[] = []; // Could be enhanced with negative sentiment analysis

    return {
      language,
      responseStyle,
      preferredTopics,
      avoidedTopics
    };
  }

  /**
   * Clean up old data to prevent memory bloat
   */
  private async cleanupOldData(userId: string): Promise<void> {
    const cutoffDate = new Date(Date.now() - this.config.contextRetentionDays * 24 * 60 * 60 * 1000);
    const crisisCutoffDate = new Date(Date.now() - this.config.crisisRetentionDays * 24 * 60 * 60 * 1000);

    // Clean up turn summaries
    const userSummaries = this.turnSummaries.get(userId);
    if (userSummaries) {
      const filtered = userSummaries.filter(summary => summary.timestamp > cutoffDate);
      this.turnSummaries.set(userId, filtered);
    }

    // Clean up context summary crisis history
    const contextSummary = this.contextSummaries.get(userId);
    if (contextSummary) {
      contextSummary.crisisHistory = contextSummary.crisisHistory.filter(
        crisis => crisis.date > crisisCutoffDate
      );
    }
  }

  /**
   * Generate unique ID for turn summaries
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get recent turn summaries for a user
   */
  async getRecentTurnSummaries(userId: string, limit: number = 10): Promise<TurnSummary[]> {
    const userSummaries = this.turnSummaries.get(userId) || [];
    return userSummaries
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Clear all data for a user (for privacy/GDPR compliance)
   */
  async clearUserData(userId: string): Promise<void> {
    this.turnSummaries.delete(userId);
    this.contextSummaries.delete(userId);
  }

  /**
   * Get memory statistics
   */
  getMemoryStats(): {
    totalUsers: number;
    totalTurnSummaries: number;
    averageSummariesPerUser: number;
  } {
    const totalUsers = this.turnSummaries.size;
    const totalTurnSummaries = Array.from(this.turnSummaries.values())
      .reduce((sum, summaries) => sum + summaries.length, 0);
    
    return {
      totalUsers,
      totalTurnSummaries,
      averageSummariesPerUser: totalUsers > 0 ? totalTurnSummaries / totalUsers : 0
    };
  }
}

/**
 * Factory function to create memory instance
 */
export function createSarthiMemory(config?: Partial<MemoryConfig>): SarthiMemory {
  return new SarthiMemory(config);
}
