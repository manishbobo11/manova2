# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Manova - AI-Powered Wellness Platform

A comprehensive wellness assessment platform that uses AI to provide personalized insights and support for mental health and well-being.

## Environment Setup

To run this application, you'll need to set up environment variables. Create a `.env` file in the root directory with the following variables:

```bash
# OpenAI Configuration (Required for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Pinecone Configuration (Optional - for vector storage and context)
PINECONE_ENVIRONMENT=your_pinecone_environment_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=your_pinecone_index_name_here
```

### Getting API Keys

1. **OpenAI API Key**: 
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Add it to your `.env` file

2. **Pinecone (Optional)**:
   - Visit [Pinecone Console](https://app.pinecone.io/)
   - Create a new project and index
   - Get your environment, API key, and index name
   - Add them to your `.env` file

### Running Without API Keys

The application will work without API keys, but AI features will be limited:
- Stress analysis will use fallback responses
- Personalized insights will be generic
- Vector storage for context will be disabled

The application gracefully handles missing environment variables and provides appropriate fallbacks.

## Features

### Check-in Processor Service

The platform now includes a sophisticated check-in processor that applies the enhanced stress detector to each answer during check-in processing, providing comprehensive stress analysis and recommendations.

#### Key Features

1. **Real-time Stress Detection**: Applies `isStressfulResponse()` to each answer during processing
2. **MCP Protocol Integration**: Automatic protocol assignment (Support, Monitor, Escalate) based on stress intensity
3. **Deep Dive Triggering**: Automatically determines when deep dive follow-ups are needed
4. **Trend Analysis**: Processes multiple check-ins to identify stress patterns over time
5. **Personalized Recommendations**: Generates domain-specific and severity-based recommendations
6. **Data Export**: Provides structured data export for external analysis

#### Core Functions

```javascript
import { 
  processCheckin, 
  processCheckinWithDeepDive, 
  processCheckinTrends, 
  exportCheckinData 
} from './src/services/checkinProcessor.js';

// Process a single check-in
const checkinData = {
  responses: [
    {
      questionId: 'work_1',
      questionText: 'How often do you feel emotionally drained by work?',
      answerText: 'Very Often',
      answerValue: 4,
      domain: 'Work & Career'
    },
    {
      questionId: 'work_2',
      questionText: 'How satisfied are you with your manager\'s support?',
      answerText: 'Not at all',
      answerValue: 0,
      domain: 'Work & Career'
    }
  ],
  domain: 'Work & Career',
  timestamp: new Date().toISOString()
};

const results = await processCheckin(checkinData, userId);

// Results include:
// {
//   flaggedQuestions: [...], // Questions that meet stress criteria
//   stressAnalysis: {...}, // Individual stress analysis for each question
//   domainStressLevel: 'moderate', // Overall domain stress level
//   mcpProtocol: 'Monitor', // MCP protocol assignment
//   needsDeepDive: true, // Whether deep dive should be triggered
//   recommendations: [...], // Personalized recommendations
//   processingTime: 1500 // Processing time in milliseconds
// }

// Process check-in with deep dive data
const deepDiveResults = await processCheckinWithDeepDive(checkinData, userId);

// Results include additional deepDiveData for the DeepDiveFollowup component:
// {
//   deepDiveData: {
//     domain: 'Work & Career',
//     flaggedQuestions: [...], // Formatted for deep dive component
//     domainNeedsReview: true,
//     totalAnswers: 5
//   }
// }

// Process multiple check-ins for trend analysis
const trendResults = await processCheckinTrends(checkins, userId);

// Results include trend analysis:
// {
//   overallTrend: 'worsening', // Overall stress trend
//   domains: {
//     'Work & Career': {
//       trend: 'worsening',
//       currentLevel: 'high',
//       currentProtocol: 'Monitor',
//       protocolChanged: true
//     }
//   },
//   recommendations: [...] // Trend-based recommendations
// }

// Export data for external analysis
const exportedData = exportCheckinData(processingResults);
```

#### Stress Detection Integration

The check-in processor applies the enhanced stress detector to each answer:

```javascript
// For each answer in the check-in
answers.forEach(answer => {
  const isStressed = isStressfulResponse(answer.text, answer.question, answer.domain);
  if (isStressed) {
    flaggedQuestions.push(answer);
  }
});
```

#### MCP Protocol Assignment

Automatic protocol assignment based on stress analysis:

- **Support** (Green): Low stress, minimal concerns
- **Monitor** (Yellow): Moderate stress, some concerns
- **Escalate** (Red): High stress, significant concerns requiring attention

#### Deep Dive Triggering

The processor automatically determines when deep dive follow-ups are needed:

```javascript
const shouldTriggerDeepDive = (
  averageSentimentScore > 0.6 ||
  flaggedPercentage > 25 ||
  hasEscalated
);
```

#### Domain-Specific Recommendations

Each domain receives tailored recommendations:

```javascript
const domainRecommendations = {
  'Work & Career': [
    'Consider setting clearer boundaries between work and personal time',
    'Explore stress management techniques like deep breathing or meditation',
    'Consider discussing workload with your manager or HR'
  ],
  'Personal Life': [
    'Prioritize activities that bring you joy and relaxation',
    'Consider reaching out to friends or family for support',
    'Practice self-compassion and acknowledge your feelings'
  ],
  'Financial Stress': [
    'Consider creating a budget to better understand your financial situation',
    'Explore financial counseling or planning resources',
    'Focus on building an emergency fund, even with small amounts'
  ],
  'Health': [
    'Prioritize getting adequate sleep and rest',
    'Consider incorporating regular exercise into your routine',
    'Practice stress-reduction techniques like meditation or yoga'
  ],
  'Self-Worth & Identity': [
    'Practice self-compassion and positive self-talk',
    'Consider exploring your values and what matters most to you',
    'Celebrate your accomplishments, no matter how small'
  ]
};
```

#### Performance Optimization

The processor is optimized for performance:
- Processes 50+ questions in under 5 seconds
- Efficient stress detection without external API calls
- Batch processing for multiple check-ins
- Cached analysis results for repeated patterns

#### Testing

Run the comprehensive check-in processor tests:

```javascript
import { runAllCheckinProcessorTests } from './src/services/checkinProcessor.test.js';

// Run all tests
await runAllCheckinProcessorTests();
```

Individual test functions:
- `testBasicCheckinProcessing()` - Tests basic check-in processing
- `testCheckinWithDeepDive()` - Tests deep dive integration
- `testCheckinTrends()` - Tests trend analysis
- `testDataExport()` - Tests data export functionality
- `testStressDetectionAccuracy()` - Tests stress detection accuracy
- `testPerformance()` - Tests processing performance

### Enhanced Stress Detector Utility

The platform now includes a sophisticated stress detection system that provides consistent logic across all domains using AI semantic scoring, MCP protocol keywords, and response emotion/tone analysis.

#### Key Features

1. **Consistent Cross-Domain Logic**: Unified stress detection that works across Work & Career, Personal Life, Financial Stress, Health, and Self-Worth & Identity domains
2. **AI Semantic Scoring**: Lightweight sentiment analysis that scores responses from 0 (low stress) to 1 (high stress)
3. **MCP Protocol Integration**: Automatic protocol flagging (Support, Monitor, Escalate) based on stress intensity and red flags
4. **Emotion & Intensity Detection**: Automatic detection of emotions and intensity levels from user responses
5. **Domain-Specific Adjustments**: Tailored stress scoring based on domain context and keywords

#### Core Functions

```javascript
import { isStressfulResponse, analyzeStressWithMCP, batchStressAnalysis } from './src/utils/stressDetector.js';

// Basic stress detection
const result = isStressfulResponse(
  "Very Often", 
  "How often do you feel emotionally drained by work?",
  "Work & Career"
);

// Result includes:
// {
//   isStressful: true,
//   sentimentScore: 0.85,
//   emotion: "overwhelmed",
//   intensity: "high",
//   isFlagged: true,
//   redFlags: ["emotionally drained"],
//   confidenceScore: 0.92
// }

// MCP protocol analysis
const mcpResult = analyzeStressWithMCP(
  "I feel completely burned out and can't take it anymore",
  "How are you coping with work stress?",
  "Work & Career"
);

// Result includes MCP protocol data:
// {
//   mcp: {
//     protocol: "Escalate",
//     urgency: "high",
//     recommendedActions: ["Immediate professional support referral", ...],
//     riskFactors: ["burnout", "can't take it"],
//     followUpNeeded: true
//   }
// }

// Batch analysis for multiple responses
const batchResult = batchStressAnalysis([
  { responseText: "Very Often", questionText: "How often do you feel stressed?", domain: "Work" },
  { responseText: "Sometimes", questionText: "How often do you feel supported?", domain: "Personal Life" }
]);
```

#### MCP Protocol Keywords

The system includes comprehensive red flag detection across domains:

```javascript
const MCP_RED_FLAGS = [
  // High urgency indicators
  'burnout', 'anxious', 'overwhelmed', 'alone', 'isolated',
  'worthless', 'hopeless', 'can\'t take it', 'emotionally drained',
  'exhausted', 'nothing helps', 'giving up', 'crying', 'panic', 'pressure',
  
  // Work-specific stress indicators
  'overworked', 'underappreciated', 'micromanaged', 'toxic workplace',
  'job insecurity', 'imposter syndrome', 'work-life imbalance',
  
  // Personal life stress indicators
  'relationship problems', 'family conflict', 'social isolation',
  'loneliness', 'trust issues', 'boundary violations',
  
  // Financial stress indicators
  'financial crisis', 'debt stress', 'money worries', 'financial insecurity',
  'living paycheck to paycheck', 'can\'t afford', 'financial burden',
  
  // Health stress indicators
  'sleep problems', 'chronic pain', 'health anxiety', 'medical stress',
  'physical symptoms', 'stress-related illness',
  
  // Identity/self-worth indicators
  'identity crisis', 'self-doubt', 'imposter syndrome', 'comparison trap',
  'perfectionism', 'self-criticism', 'feeling inadequate'
];
```

#### Domain-Specific Stress Keywords

Each domain has tailored stress detection:

```javascript
const DOMAIN_STRESS_KEYWORDS = {
  'work': ['overwhelmed', 'burnout', 'exhausted', 'drained', 'stressed', 'pressure'],
  'personal': ['lonely', 'isolated', 'conflict', 'drama', 'toxic relationship'],
  'financial': ['money stress', 'financial worry', 'debt', 'bills', 'expenses'],
  'health': ['sleep problems', 'fatigue', 'energy', 'physical symptoms'],
  'identity': ['self-worth', 'confidence', 'purpose', 'direction', 'meaning']
};
```

#### Testing

Run the comprehensive stress detector tests:

```javascript
import { runAllStressDetectorTests, testStressDetectorPerformance } from './src/utils/stressDetector.test.js';

// Run all tests
await runAllStressDetectorTests();

// Performance test
testStressDetectorPerformance();
```

#### Performance

The stress detector is optimized for performance:
- Average analysis time: < 1ms per response
- Supports batch processing for multiple responses
- Lightweight AI scoring without external API calls
- Efficient keyword matching and pattern recognition

### Loading State Optimization

The platform now includes optimized loading states that prevent the "Generating personalized insights..." message from appearing before real content loads.

#### Key Improvements

1. **Complete Data Validation**: Insights are only rendered when all required fields are present and valid
2. **No Partial Content**: Prevents loading states from showing incomplete or empty data
3. **Consistent User Experience**: Users see complete insights instantly when ready
4. **Fallback Handling**: Robust error handling with consistent fallback data structures

#### Implementation

```javascript
// Example validation logic used in components
const isDataReady = questionData && 
  questionData.insight && 
  questionData.insight.trim().length > 0 &&
  questionData.tryThis && 
  Array.isArray(questionData.tryThis) && 
  questionData.tryThis.length > 0 &&
  questionData.tryThis.every(item => item && item.trim().length > 0) &&
  questionData.reflectionQuestion &&
  questionData.reflectionQuestion.trim().length > 0;

// Only render if data is completely ready
if (!isDataReady) {
  return null; // Don't show loading state or partial content
}
```

#### Testing

Run the loading state fix tests:

```javascript
import { testLoadingStateFix, testShouldRenderInsights } from './src/utils/loadingStateFix.test.js';
await testLoadingStateFix();
testShouldRenderInsights();
```

### AI-Powered Stress Analysis

The platform now includes real-time stress level analysis using OpenAI's GPT models. Each survey response is analyzed to provide:

- **Stress Score**: 0-10 scale indicating stress level
- **Emotion Detection**: Single-word emotion labels (e.g., "Anxious", "Calm", "Frustrated")
- **Intensity Level**: "Low", "Moderate", or "High" stress intensity

#### Usage

```javascript
import { analyzeStressLevel } from './src/services/aiSuggestions';

// Analyze a single response
const analysis = await analyzeStressLevel(
  "Very Often", 
  "How often do you feel overwhelmed at work?"
);

// Result:
// {
//   score: 8,
//   emotion: "Overwhelmed",
//   intensity: "High"
// }
```

#### Integration in Survey

The stress analysis is automatically integrated into the wellness survey:

1. **Real-time Analysis**: Each answer is analyzed immediately after selection
2. **Visual Indicators**: Stress analysis results are displayed below each question
3. **Deep Dive Integration**: Analysis data is passed to the deep-dive follow-up process
4. **Fallback Handling**: Keyword-based analysis if AI analysis fails

### Deep Dive Insights Per Domain

The platform now stores and displays AI-generated insights for each domain where users complete deep dive follow-ups:

#### Features

1. **Persistent Storage**: AI insights are saved per domain and persist across sessions
2. **Wellness Score Integration**: Insights are displayed on the final wellness score screen
3. **Modal View**: Users can view detailed insights in an elegant modal interface
4. **Reusable Content**: No regeneration - insights are reused from already computed data

#### Insight Structure

Each domain insight includes:

```javascript
{
  summary: "Personalized summary of the user's situation",
  actionableSteps: ["Step 1", "Step 2", "Step 3", "Step 4"],
  reflectionQuestions: ["Question 1", "Question 2", "Question 3"],
  selfCompassion: "Gentle reminder about self-compassion",
  timestamp: "2024-01-15T10:30:00.000Z",
  domain: "Work & Career",
  reasons: ["overwhelming workload", "lack of recognition"]
}
```

#### Usage

```javascript
// Deep dive insights are automatically saved during the survey
const deepDiveSummaries = {
  "Work & Career": {
    summary: "I can see how challenging your work situation has been...",
    actionableSteps: ["Set clear boundaries", "Schedule breaks", "Talk to manager"],
    reflectionQuestions: ["What would help you feel more supported?"],
    selfCompassion: "Remember, you're doing the best you can..."
  }
};

// Pass to WellnessSummary component
<WellnessSummary 
  domainScores={domainScores}
  overallScore={wellnessScore}
  deepDiveSummaries={deepDiveSummaries}
/>
```

#### User Experience

1. **Survey Flow**: Users complete deep dive follow-ups for high-stress domains
2. **Wellness Score Screen**: Domains with insights show "View AI Insights" button
3. **Modal Display**: Clicking shows comprehensive AI-generated advice
4. **Actionable Content**: Users can revisit and act on AI suggestions

### Enhanced Wellness Score Calculation

The platform now features an improved wellness score calculation that properly handles cases where multiple domains have zero stress:

#### Key Improvements

1. **Stress-Affected Domains Only**: Calculates average stress from domains where `stressScore > 0`
2. **Weighted Scoring**: 
   - Critical domains (Work & Career, Self-Worth & Identity) = 1.5x weight
   - Other domains = 1.0x weight
3. **Minimum Score Protection**: If 3+ domains have zero stress and no critical domains are highly stressed (>70%), minimum score is 5
4. **AI Integration**: Prefers AI stress analysis over survey scores when available

#### Calculation Logic

```javascript
// Example calculation
const wellnessScore = calculateWellnessScore(responses, stressAnalysis);

// Logic:
// 1. Identify domains with stress (score >= 4)
// 2. Calculate weighted average from stress-affected domains only
// 3. Apply formula: wellnessScore = 10 - (weightedStressScore / 10)
// 4. Apply minimum score protection for mostly non-stressed users
// 5. Ensure score is within 1-10 range
```

#### Testing

Run the wellness score calculation tests:

```javascript
import { testWellnessScoreCalculation } from './src/utils/wellnessScore.test.js';
await testWellnessScoreCalculation();
```

Run the deep dive insights tests:

```javascript
import { testDeepDiveInsights } from './src/utils/deepDiveInsights.test.js';
await testDeepDiveInsights();
```

#### Example Response Analysis

```javascript
// Example survey responses and their analysis
const examples = [
  {
    question: "How often do you feel emotionally drained by work?",
    answer: "Never",
    analysis: { score: 2, emotion: "Calm", intensity: "Low" }
  },
  {
    question: "How satisfied are you with your sleep quality?",
    answer: "Poor", 
    analysis: { score: 7, emotion: "Concerned", intensity: "High" }
  },
  {
    question: "How often do financial concerns worry you?",
    answer: "Sometimes",
    analysis: { score: 5, emotion: "Anxious", intensity: "Moderate" }
  }
];
```

### Other Features

- **Personalized Questions**: AI generates contextual questions based on user history
- **Deep Dive Follow-ups**: Targeted follow-up questions for high-stress areas
- **Wellness Scoring**: Comprehensive scoring across multiple life domains
- **Progress Tracking**: Historical analysis and trend identification
- **AI Insights**: Personalized recommendations and coping strategies

### Deep Dive Filtering Optimization

The platform now includes improved filtering logic that prevents random questions from appearing in Deep Dive sections when no stress is detected.

#### Key Improvements

1. **Comprehensive Validation**: Only questions with AI stress scores >= 7 are included
2. **Emotion Filtering**: Neutral emotions are automatically excluded
3. **Answer Validation**: Ensures users provided meaningful responses
4. **Domain Specificity**: Questions must belong to the current domain
5. **Positive Feedback**: Shows encouraging message when no stress is detected

#### Implementation

```javascript
// Improved filtering logic used in WellnessSurvey.jsx
const filteredQuestions = allQuestions.filter((q) => {
  // Check if question belongs to current domain
  if (q.domain !== domains[currentDomain].name) return false;
  
  // Check if AI analysis exists and score is moderate/high stress (>= 7)
  if (!q.aiAnalysis || q.aiAnalysis.score < 7) return false;
  
  // Check if emotion is not neutral (neutral indicates no stress)
  if (q.emotion === "Neutral" || q.emotion === "neutral") return false;
  
  // Check if user actually provided a meaningful answer
  if (!q.answerLabel || q.answerLabel.trim() === "") return false;
  
  // Additional validation: ensure the answer isn't a default/empty response
  const validAnswers = ["Never", "Rarely", "Sometimes", "Often", "Very Often", "Not at all", "A little", "Somewhat", "Mostly", "Completely", "Poor", "Fair", "Good", "Excellent", "Very Poor", "None at all", "A great deal"];
  if (!validAnswers.includes(q.answerLabel)) return false;
  
  return true;
});
```

#### User Experience

1. **No Random Questions**: Personal Life domain (and others) won't show questions when there's no stress
2. **Positive Feedback**: Users see "No emotional concerns detected in this domain 🎉" message
3. **Accurate Deep Dives**: Only genuinely stressed responses trigger deep dive follow-ups
4. **Smooth Flow**: Automatically continues to next domain when no stress is detected

#### Testing

Run the deep dive filtering tests:

```javascript
import { testDeepDiveFiltering, testPersonalLifeDomain } from './src/utils/deepDiveFiltering.test.js';
await testDeepDiveFiltering();
testPersonalLifeDomain();
```

## Installation

```bash
npm install
npm run dev
```

## API Integration

The platform integrates with OpenAI's API for advanced AI analysis. Ensure your environment variables are configured:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## Testing

Run the stress analysis tests:

```javascript
import { testAnalyzeStressLevel } from './src/utils/optionColor.test.js';
await testAnalyzeStressLevel();
```

Run the wellness score calculation tests:

```javascript
import { testWellnessScoreCalculation } from './src/utils/wellnessScore.test.js';
await testWellnessScoreCalculation();
```

Run the deep dive insights tests:

```javascript
import { testDeepDiveInsights } from './src/utils/deepDiveInsights.test.js';
await testDeepDiveInsights();
```

Run the check-in processor tests:

```javascript
import { runAllCheckinProcessorTests } from './src/services/checkinProcessor.test.js';
await runAllCheckinProcessorTests();
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

### Enhanced Therapist Support with React-Select Integration

The platform now features an advanced therapist support system with a modern multi-select interface for stress contributors.

#### Key Features

1. **React-Select Multi-Select Dropdown**: 
   - Replaces static checkboxes with a modern, searchable dropdown
   - Supports up to 3 stress contributor selections
   - Custom styling with blue theme matching the platform design
   - Real-time selection counter and validation

2. **Enhanced Therapist Support**:
   - `buildTherapistSupport()` function generates personalized therapeutic responses
   - Uses GPT-4o with specific prompts for human-like therapist communication
   - Incorporates selected stress tags, free-text input, and emotional context
   - Generates 5-6 line responses with validation, action steps, and warmth

3. **MCP Protocol Integration**:
   - Automatic protocol flag assignment based on selection intensity
   - **Support** (Green): 1 selection, low intensity
   - **Monitor** (Yellow): 2+ selections or intense keywords
   - **Escalate** (Red): 3 selections with intense wording
   - Visual indicators in the Personalized Support card

#### Stress Contributor Options

The system includes 15 comprehensive stress contributor options:

```javascript
const stressContributorOptions = [
  { value: 'feeling_overworked', label: 'Feeling overworked or stretched thin' },
  { value: 'unclear_expectations', label: 'Struggling with unclear expectations' },
  { value: 'not_appreciated', label: 'Not feeling appreciated or recognized' },
  { value: 'trouble_disconnecting', label: 'Trouble disconnecting after work' },
  { value: 'fear_disappointing', label: 'Fear of disappointing others' },
  { value: 'lack_of_support', label: 'Lack of support from colleagues or management' },
  { value: 'work_life_balance', label: 'Difficulty maintaining work-life balance' },
  { value: 'job_security', label: 'Concerns about job security or career growth' },
  { value: 'communication_issues', label: 'Communication challenges with team' },
  { value: 'technology_stress', label: 'Technology or system-related stress' },
  { value: 'meeting_overload', label: 'Too many meetings or interruptions' },
  { value: 'perfectionism', label: 'Perfectionism or high self-expectations' },
  { value: 'time_management', label: 'Time management difficulties' },
  { value: 'role_confusion', label: 'Unclear role or responsibilities' },
  { value: 'workplace_culture', label: 'Challenging workplace culture' }
];
```

#### Usage

```javascript
// Generate enhanced therapist support
const therapistSupport = await buildTherapistSupport(
  selectedTags,        // Array of selected stress contributor values
  customReason,        // User's free-text response
  emotion,            // Detected emotion from stress analysis
  domainName          // Current domain being analyzed
);

// Result includes:
// {
//   supportMessage: "Personalized therapeutic response...",
//   mcpProtocol: "Monitor", // Support, Monitor, or Escalate
//   selectedTags: ["Feeling overworked", "Fear of disappointing others"],
//   emotion: "frustration",
//   timestamp: "2024-01-15T10:30:00.000Z"
// }
```

#### GPT Prompt

The system uses this specific prompt for generating therapist responses:

```
You're a licensed mental wellness therapist helping someone who is feeling stressed. Write a personalized support message based on:
• Their selected stress contributors: [selected tags]
• Their written journal or elaboration: "[custom reason]"
• The emotional tone: [emotion]

Your tone should be warm, empathetic, and solution-oriented. Include emotional validation + 2–3 small but actionable coping ideas.

Write a 5-6 line human-like therapist response that flows naturally from validation to action steps. Be specific to their exact situation and avoid generic advice.
```

#### Testing

Run the enhanced therapist support tests:

```javascript
import { testTherapistSupportWithReactSelect, demonstrateReactSelectIntegration } from './src/utils/enhancedStressAnalysis.test.js';
await testTherapistSupportWithReactSelect();
demonstrateReactSelectIntegration();
```

### Other Features
