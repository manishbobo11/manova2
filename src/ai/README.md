# Sarthi - AI Friend & Therapist

A comprehensive AI chatbot system designed to provide empathetic, solution-oriented mental health support with crisis detection and multilingual capabilities.

## 🎯 Overview

Sarthi combines the warmth of a close friend with the wisdom of a mental health therapist, providing:
- **Empathetic responses** in English, Hindi, and Hinglish
- **Crisis detection and intervention** with KIRAN helpline integration
- **Personalized memory** and context awareness
- **Real-time streaming** responses
- **Tool integration** for practical wellness support
- **Safety guardrails** and response validation

## 🏗️ Architecture

### Core Components

1. **`sarthi.ts`** - Main orchestrator class
2. **`client.ts`** - AI model interactions with streaming
3. **`intentRouter.ts`** - Intent classification and routing
4. **`orchestrator.ts`** - Response flow management
5. **`composer.ts`** - Structured response generation
6. **`critic.ts`** - Response validation and safety checks
7. **`guardrails.ts`** - Crisis detection and emergency response
8. **`memory.ts`** - User context and conversation history
9. **`tools/index.ts`** - Wellness tools and resources
10. **`prompts/sarthi-full.ts`** - System prompts and templates

## 🚀 Quick Start

### 1. Installation

```bash
# Install dependencies
npm install

# Set environment variables
export OPENAI_API_KEY="your-openai-api-key"
```

### 2. Basic Usage

```typescript
import { createSarthi } from './src/ai/sarthi';

// Initialize Sarthi
const sarthi = createSarthi({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-3.5-turbo',
  enableStreaming: true,
  enableCrisisDetection: true,
  enableMemory: true,
  enableTools: true
});

// Process a message
const response = await sarthi.processMessage(
  "I'm feeling really stressed about work",
  {
    userId: 'user123',
    userLanguage: 'en',
    currentStressLevel: 6
  }
);

console.log(response.content);
```

### 3. React Integration

```jsx
import SarthiChat from './src/components/SarthiChat';

function App() {
  return (
    <div>
      <h1>Chat with Sarthi</h1>
      <SarthiChat 
        userId="user123" 
        language="en" 
      />
    </div>
  );
}
```

## 📡 API Endpoints

### POST `/api/sarthi/chat`
Regular chat endpoint with full response.

**Request:**
```json
{
  "message": "I'm feeling stressed",
  "userId": "user123",
  "language": "en",
  "chatHistory": []
}
```

**Response:**
```json
{
  "content": "I hear you, and it's completely normal to feel this way...",
  "intent": {
    "intent": "therapy_support",
    "confidence": 0.85,
    "language": "en"
  },
  "isCrisis": false,
  "confidence": 0.85,
  "language": "en",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### POST `/api/sarthi/stream`
Streaming chat endpoint for real-time responses.

### GET `/api/sarthi/context/:userId`
Get user context and conversation history.

### DELETE `/api/sarthi/user/:userId`
Clear user data (GDPR compliance).

## 🔧 Configuration

### SarthiConfig Options

```typescript
interface SarthiConfig {
  apiKey: string;                    // OpenAI API key
  baseUrl?: string;                  // API base URL
  model?: string;                    // AI model (default: gpt-3.5-turbo)
  enableStreaming?: boolean;         // Enable streaming (default: true)
  enableCrisisDetection?: boolean;   // Enable crisis detection (default: true)
  enableMemory?: boolean;            // Enable memory (default: true)
  enableTools?: boolean;             // Enable tools (default: true)
}
```

### Model Configurations

- **Router**: `temp: 0.2, max_tokens: 200` - Precise intent classification
- **Planner**: `temp: 0.4, max_tokens: 300` - Balanced planning
- **Composer**: `temp: 0.7, max_tokens: 350` - Creative responses
- **Critic**: `temp: 0.3, max_tokens: 200` - Consistent validation

## 🌍 Language Support

### Supported Languages
- **English (en)** - Full support with comprehensive prompts
- **Hindi (hi)** - Complete translations and cultural adaptation
- **Hinglish** - Mixed Hindi-English for natural conversation
- **Spanish (es)** - Basic support (expandable)

### Language Detection
- Automatic language detection from user input
- Language override support via dropdown
- Context-aware language switching

## 🛡️ Safety Features

### Crisis Detection
- **Keyword-based detection** in multiple languages
- **LLM-powered analysis** for complex cases
- **Severity levels**: low, medium, high, critical
- **Crisis types**: self-harm, suicidal, violence, panic, acute distress

### Emergency Response
- **KIRAN Helpline**: 1800-599-0019 (24/7 crisis support)
- **Immediate safety guidance**
- **Breathing exercises** and grounding techniques
- **Deferred advice** during crisis

### Response Validation
- **Empathy check** - Ensures empathetic language
- **Concrete steps** - Validates actionable advice
- **Language consistency** - Matches user's language
- **Medical claims** - Avoids inappropriate medical advice

## 🧠 Memory System

### User Context
- **Conversation history** with emotional tone tracking
- **Intent frequency** analysis
- **Wellness trends** and stress patterns
- **User preferences** and response style
- **Crisis history** for safety monitoring

### Data Retention
- **Turn summaries**: 30 days
- **Crisis history**: 90 days
- **Context cache**: 1 hour
- **Maximum summaries**: 100 per user

## 🛠️ Tools Integration

### Available Tools
1. **`fetch_checkins`** - User wellness history
2. **`suggest_micro_habits`** - Domain-specific habits
3. **`create_action_plan`** - Goal planning
4. **`lookup_resources`** - Wellness resources

### Tool Usage
```typescript
// Tools are automatically called based on intent
const response = await sarthi.processMessage(
  "I need help with sleep",
  context
);
// Automatically calls suggest_micro_habits with domain: 'sleep'
```

## 📊 Performance Features

### Fast-Path Optimization
- **Single API call** for `quick_tip` intent with high confidence
- **Bypasses full orchestration** when tools aren't needed
- **Automatic fallback** to full flow if fast-path fails

### Caching
- **Prompt templates**: 24-hour cache
- **Responses**: 5-minute cache
- **Intent classification**: 2-minute cache
- **Hash-based keys** for efficient lookups

### Streaming
- **Real-time response** generation
- **Chunked processing** with error handling
- **Graceful degradation** to non-streaming fallback

## 🔍 Monitoring & Analytics

### System Statistics
```typescript
const stats = sarthi.getStats();
// Returns:
// {
//   config: { streaming, crisisDetection, memory, tools },
//   memory: { totalUsers, totalTurnSummaries, averageSummariesPerUser }
// }
```

### Crisis Monitoring
- **Automatic logging** of crisis detections
- **Severity tracking** for intervention decisions
- **Keyword analysis** for pattern recognition
- **Timestamp recording** for incident tracking

## 🧪 Testing

### Example Test Cases
```typescript
// Test crisis detection
const crisisResponse = await sarthi.processMessage(
  "I want to kill myself",
  context
);
console.log(crisisResponse.isCrisis); // true

// Test intent classification
const response = await sarthi.processMessage(
  "How can I improve my sleep?",
  context
);
console.log(response.intent.intent); // "quick_tip"

// Test language support
const hindiResponse = await sarthi.processMessage(
  "मैं तनाव में हूं",
  { ...context, userLanguage: 'hi' }
);
console.log(hindiResponse.language); // "hi"
```

## 🔒 Privacy & Compliance

### GDPR Compliance
- **Data deletion** via `clearUserData()`
- **Configurable retention** periods
- **Secure data handling**
- **User consent** tracking

### Data Security
- **In-memory storage** (configurable for production)
- **No persistent logging** of sensitive data
- **Encrypted API communications**
- **Access control** for user data

## 🚀 Production Deployment

### Environment Setup
```bash
# Required environment variables
OPENAI_API_KEY=your-openai-api-key
NODE_ENV=production

# Optional configurations
SARTHI_MODEL=gpt-4
SARTHI_ENABLE_STREAMING=true
SARTHI_ENABLE_CRISIS_DETECTION=true
```

### Scaling Considerations
- **Memory management** with automatic cleanup
- **Rate limiting** for API calls
- **Error handling** with graceful fallbacks
- **Monitoring** and alerting for crisis events

### Integration Examples
```typescript
// Express.js integration
app.post('/api/sarthi/chat', async (req, res) => {
  const response = await sarthi.processMessage(
    req.body.message,
    req.body.context
  );
  res.json(response);
});

// Next.js API route
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const response = await sarthi.processMessage(
      req.body.message,
      req.body.context
    );
    res.status(200).json(response);
  }
}
```

## 🤝 Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run tests: `npm test`
5. Start development server: `npm run dev`

### Code Structure
```
src/ai/
├── sarthi.ts              # Main orchestrator
├── client.ts              # AI model interactions
├── intentRouter.ts        # Intent classification
├── orchestrator.ts        # Response flow
├── composer.ts            # Response generation
├── critic.ts              # Response validation
├── guardrails.ts          # Crisis detection
├── memory.ts              # User context
├── tools/
│   └── index.ts           # Tool definitions
└── prompts/
    ├── system.sarthi.ts   # System prompt
    └── sarthi-full.ts     # Full prompts
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For technical support or questions about Sarthi:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common issues

For mental health support:
- **KIRAN Helpline**: 1800-599-0019 (24/7)
- **National Crisis Hotline**: Available in your region
- **Professional Help**: Consult with licensed mental health professionals
