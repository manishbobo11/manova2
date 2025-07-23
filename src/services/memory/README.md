# Memory Services

A comprehensive memory management system for the Manova platform using Pinecone vector database for storing and retrieving user context, conversations, and survey data.

## Overview

The memory services provide persistent, semantic storage and retrieval of user interactions, enabling the AI to maintain context across sessions and provide personalized responses based on historical data.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   VectorStore   │───▶│ PineconeClient  │───▶│   Pinecone DB   │
│   (High-level)  │    │  (Low-level)    │    │   (Vector DB)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Services

### 1. PineconeClient (`pineconeClient.js`)

Low-level interface for Pinecone vector database operations.

**Features:**
- Connection management and initialization
- Index creation and management
- Vector storage and retrieval
- Metadata filtering and querying
- Memory statistics and analytics

**Key Methods:**
- `initialize()` - Initialize Pinecone client and index
- `storeMemory(userId, memoryData)` - Store a single memory
- `retrieveMemories(userId, queryEmbedding, options)` - Retrieve relevant memories
- `updateMemory(memoryId, updates)` - Update existing memory
- `deleteMemory(memoryId)` - Delete specific memory
- `deleteUserMemories(userId)` - Delete all user memories
- `getUserMemoryStats(userId)` - Get memory statistics

### 2. VectorStore (`vectorStore.js`)

High-level interface for memory management with automatic embedding generation.

**Features:**
- Automatic OpenAI embedding generation
- Conversation storage and retrieval
- Survey data management
- Context retrieval for AI responses
- Memory timeline and search
- Domain-specific memory organization

**Key Methods:**
- `initialize()` - Initialize vector store
- `storeUserMemory(userId, memoryData)` - Store user memory with auto-embedding
- `storeConversation(userId, conversationData)` - Store conversation context
- `storeSurveyData(userId, surveyData)` - Store survey responses and insights
- `retrieveContext(userId, query, options)` - Retrieve relevant context for AI
- `getUserTimeline(userId, options)` - Get user memory timeline
- `searchUserMemories(userId, searchQuery, options)` - Search memories by content
- `getUserMemoryStats(userId)` - Get comprehensive memory statistics

## Installation & Setup

### 1. Environment Variables

Add the following to your `.env` file:

```bash
# Pinecone Configuration
PINECONE_ENVIRONMENT=your_pinecone_environment
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=manova-memory

# OpenAI Configuration (for embeddings)
OPENAI_API_KEY=your_openai_api_key
```

### 2. Initialize Services

```javascript
import { vectorStore } from './src/services/memory/index.js';

// Initialize the vector store
const initResult = await vectorStore.initialize();
if (initResult.success) {
  console.log('Memory services ready!');
} else {
  console.warn('Memory services not available:', initResult.message);
}
```

## Usage Examples

### 1. Store User Memory

```javascript
import { vectorStore } from './src/services/memory/index.js';

const memoryData = {
  content: 'I am feeling stressed about work deadlines this week',
  type: 'memory',
  domain: 'Work & Career',
  metadata: {
    emotion: 'stressed',
    intensity: 'high',
    tags: ['work', 'deadlines', 'stress']
  }
};

const result = await vectorStore.storeUserMemory('user-123', memoryData);
console.log('Memory stored:', result.success);
```

### 2. Store Conversation

```javascript
const conversationData = {
  messages: [
    {
      role: 'user',
      content: 'I\'m feeling overwhelmed with my workload',
      timestamp: new Date().toISOString()
    },
    {
      role: 'assistant',
      content: 'I understand that feeling overwhelmed can be really challenging. Can you tell me more about what\'s contributing to this feeling?',
      timestamp: new Date().toISOString()
    }
  ],
  summary: 'User is feeling overwhelmed due to workload',
  domain: 'Work & Career',
  metadata: {
    sessionId: 'session-123',
    duration: '15 minutes'
  }
};

const result = await vectorStore.storeConversation('user-123', conversationData);
```

### 3. Store Survey Data

```javascript
const surveyData = {
  responses: [
    {
      question: 'How often do you feel stressed at work?',
      answer: 'Very Often',
      emotion: 'stressed',
      stressScore: 8,
      timestamp: new Date().toISOString()
    }
  ],
  insights: [
    'High stress levels at work',
    'Need for better work-life balance'
  ],
  domain: 'Work & Career',
  wellnessScore: 3,
  metadata: {
    surveyId: 'survey-123',
    completionTime: '10 minutes'
  }
};

const result = await vectorStore.storeSurveyData('user-123', surveyData);
```

### 4. Retrieve Context for AI

```javascript
const context = await vectorStore.retrieveContext(
  'user-123',
  'I need help with anxiety and work stress',
  {
    topK: 5,
    domain: 'Work & Career',
    minScore: 0.7
  }
);

console.log('Retrieved context:', context.context);
// Output: "[MEMORY] I am feeling stressed about work deadlines this week\n\n[CONVERSATION] user: I'm feeling overwhelmed with my workload..."
```

### 5. Get User Timeline

```javascript
const timeline = await vectorStore.getUserTimeline('user-123', {
  limit: 20,
  domain: 'Work & Career',
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});

console.log('User timeline:', timeline.timeline);
// Output: Grouped memories by date
```

### 6. Search Memories

```javascript
const searchResults = await vectorStore.searchUserMemories(
  'user-123',
  'work stress',
  {
    topK: 10,
    domain: 'Work & Career'
  }
);

console.log('Search results:', searchResults.memories);
```

### 7. Get Memory Statistics

```javascript
const stats = await vectorStore.getUserMemoryStats('user-123');

console.log('Memory statistics:', stats.stats);
// Output: { totalMemories: 45, domains: { 'Work & Career': 20, 'Personal Life': 15, ... } }
```

## Memory Types

The system supports various memory types for different use cases:

- **`memory`** - General user memories and thoughts
- **`conversation`** - Chat messages and interactions
- **`survey_response`** - Survey question responses
- **`insight`** - AI-generated insights and analysis
- **`wellness_score`** - Wellness assessment scores
- **`summary`** - Conversation or session summaries

## Domains

Memories are organized by wellness domains:

- **`Work & Career`** - Work-related stress and concerns
- **`Personal Life`** - Personal relationships and life events
- **`Financial Stress`** - Financial concerns and worries
- **`Health`** - Physical and mental health
- **`Self-Worth & Identity`** - Self-esteem and identity issues
- **`general`** - General memories not specific to a domain

## Configuration Options

### Vector Store Options

```javascript
// Context retrieval options
const contextOptions = {
  topK: 5,              // Number of memories to retrieve
  domain: 'Work & Career', // Filter by domain
  type: 'memory',       // Filter by memory type
  minScore: 0.7         // Minimum similarity score
};

// Timeline options
const timelineOptions = {
  limit: 50,            // Maximum number of memories
  domain: 'Work & Career', // Filter by domain
  type: 'memory',       // Filter by memory type
  startDate: '2024-01-01', // Start date filter
  endDate: '2024-01-31'    // End date filter
};
```

### Pinecone Configuration

```javascript
// Index configuration
const indexConfig = {
  dimension: 1536,      // OpenAI embedding dimension
  metric: 'cosine',     // Similarity metric
  spec: {
    serverless: {
      cloud: 'aws',
      region: 'us-east-1'
    }
  }
};
```

## Error Handling

All methods return consistent result objects:

```javascript
// Success response
{
  success: true,
  memoryId: 'user-123_1703123456789_abc123',
  timestamp: '2024-01-15T10:30:00.000Z'
}

// Error response
{
  success: false,
  error: 'Pinecone not initialized'
}
```

## Testing

Run the comprehensive test suite:

```javascript
import { runAllMemoryTests, demonstrateMemoryWorkflow } from './src/services/memory/memoryServices.test.js';

// Run all tests
const testResults = await runAllMemoryTests();

// Demonstrate complete workflow
const demoResult = await demonstrateMemoryWorkflow();
```

## Performance Considerations

1. **Embedding Cache**: The vector store includes an in-memory cache for embeddings to reduce API calls
2. **Batch Operations**: Use `storeBatchMemories()` for storing multiple memories efficiently
3. **Filtering**: Use domain and type filters to reduce query scope
4. **Score Thresholds**: Set appropriate `minScore` values to ensure relevance

## Security & Privacy

1. **User Isolation**: All memories are filtered by `userId` to ensure data isolation
2. **Metadata Filtering**: Sensitive data should be stored in metadata with appropriate access controls
3. **Data Retention**: Implement data retention policies using the deletion methods
4. **Encryption**: Pinecone provides encryption at rest and in transit

## Integration with Manova

The memory services integrate seamlessly with existing Manova components:

### Wellness Survey Integration

```javascript
// In WellnessSurvey.jsx
import { vectorStore } from '../services/memory/index.js';

// Store survey responses
await vectorStore.storeSurveyData(userId, {
  responses: surveyResponses,
  insights: aiInsights,
  domain: currentDomain,
  wellnessScore: calculatedScore
});
```

### AI Context Retrieval

```javascript
// In AI services
import { vectorStore } from '../services/memory/index.js';

// Get relevant context for AI responses
const context = await vectorStore.retrieveContext(
  userId,
  userMessage,
  { topK: 5, domain: currentDomain }
);

// Use context in AI prompt
const aiResponse = await generateAIResponse(userMessage, context.context);
```

### Dashboard Integration

```javascript
// In DashboardPage.jsx
import { vectorStore } from '../services/memory/index.js';

// Get user timeline for dashboard
const timeline = await vectorStore.getUserTimeline(userId, { limit: 20 });

// Get memory statistics
const stats = await vectorStore.getUserMemoryStats(userId);
```

## Troubleshooting

### Common Issues

1. **"Pinecone not initialized"**
   - Check environment variables are set correctly
   - Ensure Pinecone API key and environment are valid
   - Verify index name exists in Pinecone console

2. **"OpenAI API error"**
   - Check OpenAI API key is valid
   - Verify API quota and rate limits
   - Ensure network connectivity

3. **"Memory not stored"**
   - Check vector store initialization
   - Verify user ID is provided
   - Check content is not empty

### Debug Mode

Enable debug logging:

```javascript
// Check configuration status
const configStatus = vectorStore.getConfigStatus();
console.log('Vector store status:', configStatus);

const pineconeStatus = pineconeClient.getConfigStatus();
console.log('Pinecone status:', pineconeStatus);
```

## Future Enhancements

1. **Advanced Caching**: Redis-based embedding cache
2. **Memory Compression**: Automatic memory summarization
3. **Temporal Analysis**: Time-based memory patterns
4. **Cross-User Insights**: Anonymous pattern analysis
5. **Memory Export**: GDPR-compliant data export
6. **Real-time Sync**: WebSocket-based real-time updates

## Contributing

When contributing to the memory services:

1. Follow the existing code structure and patterns
2. Add comprehensive error handling
3. Include tests for new functionality
4. Update documentation for new features
5. Ensure backward compatibility
6. Follow security best practices

---

**Built with ❤️ for mental wellness and user privacy** 