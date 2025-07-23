import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Brain, Heart, DollarSign, Activity, User, CheckCircle, RotateCcw, MessageCircle, TrendingUp, Calendar, Phone, AlertCircle, Clock, Info, Lightbulb, Target } from 'lucide-react';
// Navbar is now handled globally in App.jsx
import DeepDiveFollowup from './DeepDiveFollowup';
import WellnessScore from './WellnessScore';
import WellnessSummary from './WellnessSummary';
import mcpService from '../services/mcp';
import { saveDeepDiveInsight } from '../services/firebase';
import { getCheckinHistory, saveCheckinData } from '../services/userSurveyHistory';
import { auth } from '../services/firebase';
import { contextualMemoryBuilder, buildFullContext, generatePersonalizedQuestion } from '../services/userContextBuilder';
import { generateWellnessInsights, analyzeStressLevel } from '../services/aiSuggestions';
import { getPersonalizedSuggestionPrompt, domainInsightBuilder } from '../services/gptSuggestor';
import { callOpenAI } from '../services/openai';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeStressResponse, filterDeepDiveQuestions, comprehensiveStressAnalysis, enhancedAnalysisIntegration } from '../services/stressAnalysisLogic.js';
import { upsertUserVector } from '../utils/vectorStore';
import { getResponseEmbedding } from '../utils/embeddingService';
import { analyzeEmotionalPatterns, performVectorCleanup, generateDeepDiveTrigger } from '../services/emotionalPatternAnalysis';
import { processQuestionResponse } from '../services/surveySubmissionHandler';

// Import UI components from local ui directory
import { 
  Badge, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Progress, 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger, 
  Button 
} from './ui';

// Enhanced Wellness Survey with properly aligned questions
const WellnessSurvey = ({ userId = "demo-user-123" }) => {
  const [currentDomain, setCurrentDomain] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [aiMessage, setAiMessage] = useState('');

  const [wellnessScore, setWellnessScore] = useState(0);
  const [sentiment, setSentiment] = useState({});
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [followUps, setFollowUps] = useState({});
  const [isLoadingFollowUp, setIsLoadingFollowUp] = useState(false);
  const [aiIntroText, setAiIntroText] = useState('');
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [deepDiveDomain, setDeepDiveDomain] = useState('');
  const [deepDiveData, setDeepDiveData] = useState({});
  const [deepDiveFollowup, setDeepDiveFollowup] = useState(null);
  const [isLoadingDeepDive, setIsLoadingDeepDive] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [userContext, setUserContext] = useState(null);
  const [wellnessInsights, setWellnessInsights] = useState(null);
  const [domainInsights, setDomainInsights] = useState({});
  const [showDomainInsight, setShowDomainInsight] = useState(false);
  const [currentDomainInsight, setCurrentDomainInsight] = useState(null);
  const [stressAnalysis, setStressAnalysis] = useState({}); // Track stress analysis for each question
  const [isAnalyzingStress, setIsAnalyzingStress] = useState(false); // Loading state for stress analysis
  const [deepDiveSummaries, setDeepDiveSummaries] = useState({});
  const [noStressedQuestions, setNoStressedQuestions] = useState(false);
  const [hoveredOption, setHoveredOption] = useState(null);
  const [showQuestionTransition, setShowQuestionTransition] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  // Layer 1 AI Pattern Analysis State
  const [patternAnalysisResult, setPatternAnalysisResult] = useState(null);
  const [deepDiveTriggerResult, setDeepDiveTriggerResult] = useState(null);
  const [showTherapistRecommendation, setShowTherapistRecommendation] = useState(false);

  const feedback = {
    0: {
      msg: "It looks like you haven't had any time to recharge. That's okay—life gets busy. But let's work on creating space for your well-being.",
      tip: "Even 10 minutes a day doing what calms you—walk, music, journaling—can reset your mind."
    },
    1: {
      msg: "You've rarely had time to restore yourself. That might be silently draining your energy.",
      tip: "What's one activity you enjoyed in the past but stopped? Let's reintroduce that this week."
    },
    2: {
      msg: "You're sometimes taking time for yourself. Let's turn this into a routine, not an exception.",
      tip: "Can you protect 30 minutes a week just for you? Call it your 'non-negotiable time.'"
    },
    3: {
      msg: "You're often recharging — that's great! Let's find ways to deepen that routine.",
      tip: "Think about adding small rituals like a mid-week walk, screen detox, or weekend reflection."
    },
    4: {
      msg: "Amazing! You're prioritizing your well-being. That's the kind of balance others strive for.",
      tip: "Want to mentor someone else struggling with stress? Giving back multiplies your peace."
    }
  };

  // Updated questions to include options array and intent/isPositive
  const domains = [
    {
      name: 'Work & Career',
      icon: Brain,
      color: 'blue',
      questions: [
        {
          id: 'work_1',
          text: 'Over the past two weeks, how often have you felt emotionally drained by your work?',
          options: [
            { label: 'Never', value: 0, color: 'green' },
            { label: 'Rarely', value: 1 },
            { label: 'Sometimes', value: 2 },
            { label: 'Often', value: 3 },
            { label: 'Very Often', value: 4, color: 'red' }
          ],
          intent: 'emotional_exhaustion',
          isPositive: false,
          aiIntro: 'Work can be rewarding, but it can also be draining. Let\'s check in on how your work has been affecting your energy lately.'
        },
        {
          id: 'work_2',
          text: 'To what extent do you feel your manager or supervisor genuinely understands and supports your professional challenges?',
          options: [
            { label: 'Not at all', value: 0, color: 'red' },
            { label: 'A little', value: 1 },
            { label: 'Somewhat', value: 2 },
            { label: 'Mostly', value: 3 },
            { label: 'Completely', value: 4, color: 'green' }
          ],
          intent: 'manager_support',
          isPositive: true,
          aiIntro: "Support at work can make all the difference. Let's reflect on how understood and supported you feel by your manager or supervisor."
        },
        {
          id: 'work_3',
          text: 'How frequently do you find yourself working beyond your intended hours or taking on responsibilities that feel beyond your capacity?',
          options: [
            { label: 'Never', value: 0, color: 'green' },
            { label: 'Rarely', value: 1 },
            { label: 'Sometimes', value: 2 },
            { label: 'Often', value: 3 },
            { label: 'Very Often', value: 4, color: 'red' }
          ],
          intent: 'overwork',
          isPositive: false,
          aiIntro: "It's easy to take on too much, especially when you care about your work. Let's see how often your workload spills over."
        },
        {
          id: 'work_4',
          text: 'When you complete meaningful work, how often do you receive acknowledgment or recognition that feels authentic and valued?',
          options: [
            { label: 'Never', value: 0, color: 'red' },
            { label: 'Rarely', value: 1 },
            { label: 'Sometimes', value: 2 },
            { label: 'Often', value: 3 },
            { label: 'Very Often', value: 4, color: 'green' }
          ],
          intent: 'recognition',
          isPositive: true,
          aiIntro: "Recognition can fuel our motivation and sense of belonging. Let's check in on how often you feel truly seen at work."
        },
        {
          id: 'work_5',
          text: 'How connected do you currently feel to the broader purpose or meaning behind the work you do daily?',
          options: [
            { label: 'Not at all', value: 0, color: 'red' },
            { label: 'A little', value: 1 },
            { label: 'Somewhat', value: 2 },
            { label: 'Mostly', value: 3 },
            { label: 'Completely', value: 4, color: 'green' }
          ],
          intent: 'purpose',
          isPositive: true,
          aiIntro: "Purpose gives our work meaning. Let's reflect on how connected you feel to the bigger picture in your daily work."
        }
      ]
    },
    {
      name: 'Personal Life',
      icon: Heart,
      color: 'rose',
      questions: [
        {
          id: 'personal_1',
          text: 'How satisfied are you with the quality of emotional intimacy and connection in your closest relationships?',
          options: [
            { label: 'Not at all', value: 0, color: 'red' },
            { label: 'A little', value: 1 },
            { label: 'Somewhat', value: 2 },
            { label: 'Mostly', value: 3 },
            { label: 'Completely', value: 4, color: 'green' }
          ],
          aiIntro: "Now let's shift to your personal relationships. These connections are the foundation of our wellbeing.",
          positive: true
        },
        {
          id: 'personal_2',
          text: 'In the past month, how often have you been able to engage in activities that genuinely restore and energize you?',
          options: [
            { label: 'Never', value: 0, color: 'red' },
            { label: 'Rarely', value: 1 },
            { label: 'Sometimes', value: 2 },
            { label: 'Often', value: 3 },
            { label: 'Very Often', value: 4, color: 'green' }
          ],
          aiIntro: "Self-care isn't selfish—it's essential. Let's see how you're nurturing yourself."
        },
        {
          id: 'personal_3',
          text: "When you're experiencing difficult emotions, how readily available do you feel your support network is to you?",
          options: [
            { label: 'Not at all', value: 0, color: 'red' },
            { label: 'A little', value: 1 },
            { label: 'Somewhat', value: 2 },
            { label: 'Mostly', value: 3 },
            { label: 'Completely', value: 4, color: 'green' }
          ],
          aiIntro: "Having people to lean on during tough times makes all the difference. How's your support system?"
        },
        {
          id: 'personal_4',
          text: 'How often do you feel you can be your authentic self without judgment in your personal relationships?',
          options: [
            { label: 'Never', value: 0, color: 'red' },
            { label: 'Rarely', value: 1 },
            { label: 'Sometimes', value: 2 },
            { label: 'Often', value: 3 },
            { label: 'Very Often', value: 4, color: 'green' }
          ],
          aiIntro: "Authenticity in relationships is so important. Being accepted for who you truly are is healing.",
          positive: true
        },
        {
          id: 'personal_5',
          text: 'To what degree do you feel your personal boundaries and needs are respected by those closest to you?',
          options: [
            { label: 'Not at all', value: 0, color: 'red' },
            { label: 'A little', value: 1 },
            { label: 'Somewhat', value: 2 },
            { label: 'Mostly', value: 3 },
            { label: 'Completely', value: 4, color: 'green' }
          ],
          aiIntro: "Healthy boundaries create space for healthy relationships. Let's explore this together.",
          positive: true
        }
      ]
    },
    {
      name: 'Financial Stress',
      icon: DollarSign,
      color: 'emerald',
      questions: [
        {
          id: 'financial_1',
          text: 'How often do financial concerns keep you awake at night or intrude on your daily thoughts?',
          options: [
            { label: 'Never', value: 0, color: 'green' },
            { label: 'Rarely', value: 1 },
            { label: 'Sometimes', value: 2 },
            { label: 'Often', value: 3 },
            { label: 'Very Often', value: 4, color: 'red' }
          ],
          aiIntro: "Money stress can be overwhelming. Let's honestly assess how finances are affecting your peace of mind."
        },
        {
          id: 'financial_2',
          text: 'In the past three months, how frequently have you delayed important decisions due to financial uncertainty?',
          options: [
            { label: 'Never', value: 0, color: 'green' },
            { label: 'Rarely', value: 1 },
            { label: 'Sometimes', value: 2 },
            { label: 'Often', value: 3 },
            { label: 'Very Often', value: 4, color: 'red' }
          ],
          aiIntro: "Financial stress can freeze us in place. I want to understand how this might be impacting your life choices."
        },
        {
          id: 'financial_3',
          text: 'How confident do you feel in your ability to handle unexpected financial expenses without significant stress?',
          options: [
            { label: 'Not at all', value: 0, color: 'red' },
            { label: 'A little', value: 1 },
            { label: 'Somewhat', value: 2 },
            { label: 'Mostly', value: 3 },
            { label: 'Completely', value: 4, color: 'green' }
          ],
          aiIntro: "Financial confidence is about more than money—it's about peace of mind. How secure do you feel?",
          positive: true
        },
        {
          id: 'financial_4',
          text: 'When making purchases, how often do you experience anxiety or guilt, even for necessary items?',
          options: [
            { label: 'Never', value: 0, color: 'green' },
            { label: 'Rarely', value: 1 },
            { label: 'Sometimes', value: 2 },
            { label: 'Often', value: 3 },
            { label: 'Very Often', value: 4, color: 'red' }
          ],
          aiIntro: "Sometimes money stress shows up in our daily spending habits. Let's explore your relationship with purchases."
        },
        {
          id: 'financial_5',
          text: 'How much do concerns about your financial future affect your ability to enjoy present moments?',
          options: [
            { label: 'Not at all', value: 0, color: 'green' },
            { label: 'A little', value: 1 },
            { label: 'Somewhat', value: 2 },
            { label: 'Mostly', value: 3 },
            { label: 'Completely', value: 4, color: 'red' }
          ],
          aiIntro: "Financial worry can steal our joy in the present. I'm curious about how this affects your daily happiness."
        }
      ]
    },
    {
      name: 'Health',
      icon: Activity,
      color: 'amber',
      questions: [
        {
          id: 'health_1',
          text: 'Over the past two weeks, how would you rate the overall quality and restfulness of your sleep?',
          options: [
            { label: 'Very Poor', value: 0, color: 'red' },
            { label: 'Poor', value: 1 },
            { label: 'Fair', value: 2 },
            { label: 'Good', value: 3 },
            { label: 'Excellent', value: 4, color: 'green' }
          ],
          aiIntro: "Sleep is the foundation of everything. Let's see how you've been resting lately.",
          positive: true
        },
        {
          id: 'health_2',
          text: 'How often do you feel you have sufficient physical and mental energy to engage fully in your daily activities?',
          options: [
            { label: 'Never', value: 0, color: 'red' },
            { label: 'Rarely', value: 1 },
            { label: 'Sometimes', value: 2 },
            { label: 'Often', value: 3 },
            { label: 'Always', value: 4, color: 'green' }
          ],
          aiIntro: "Energy levels tell us so much about our overall wellbeing. How are yours holding up?",
          positive: true
        },
        {
          id: 'health_3',
          text: 'In recent weeks, how frequently have you noticed physical symptoms of stress in your body (tension, headaches, digestive issues)?',
          options: [
            { label: 'Never', value: 0, color: 'green' },
            { label: 'Rarely', value: 1 },
            { label: 'Sometimes', value: 2 },
            { label: 'Often', value: 3 },
            { label: 'Very Often', value: 4, color: 'red' }
          ],
          aiIntro: "Our bodies often signal stress before our minds do. Let's check in with what your body is telling you."
        },
        {
          id: 'health_4',
          text: 'How satisfied are you with your current ability to maintain healthy habits that support your well-being?',
          options: [
            { label: 'Not at all', value: 0, color: 'red' },
            { label: 'A little', value: 1 },
            { label: 'Somewhat', value: 2 },
            { label: 'Mostly', value: 3 },
            { label: 'Completely', value: 4, color: 'green' }
          ],
          aiIntro: "Healthy habits are acts of self-love. How are you doing with caring for yourself physically?",
          positive: true
        },
        {
          id: 'health_5',
          text: 'When you think about your overall health, how much anxiety or worry do you experience about potential health problems?',
          options: [
            { label: 'None at all', value: 0, color: 'green' },
            { label: 'A little', value: 1 },
            { label: 'Some', value: 2 },
            { label: 'Quite a bit', value: 3 },
            { label: 'A great deal', value: 4, color: 'red' }
          ],
          aiIntro: "Health anxiety is more common than people think. Let's explore your relationship with health concerns."
        }
      ]
    },
    {
      name: 'Self-Worth & Identity',
      icon: User,
      color: 'violet',
      questions: [
        {
          id: 'identity_1',
          text: "How often do you feel like you're simply going through the motions without a clear sense of personal direction?",
          options: [
            { label: 'Never', value: 0, color: 'green' },
            { label: 'Rarely', value: 1 },
            { label: 'Sometimes', value: 2 },
            { label: 'Often', value: 3 },
            { label: 'Very Often', value: 4, color: 'red' }
          ],
          aiIntro: "Let's explore your sense of direction in life. Feeling lost is more common than you might think."
        },
        {
          id: 'identity_2',
          text: 'When you compare yourself to others, how frequently does this leave you feeling inadequate or behind in life?',
          options: [
            { label: 'Never', value: 0, color: 'green' },
            { label: 'Rarely', value: 1 },
            { label: 'Sometimes', value: 2 },
            { label: 'Often', value: 3 },
            { label: 'Very Often', value: 4, color: 'red' }
          ],
          aiIntro: "Comparison can be the thief of joy. I want to understand how social comparison affects your self-worth."
        },
        {
          id: 'identity_3',
          text: "How often do you experience the feeling that you don't deserve your accomplishments or that you're 'fooling' others?",
          options: [
            { label: 'Never', value: 0, color: 'green' },
            { label: 'Rarely', value: 1 },
            { label: 'Sometimes', value: 2 },
            { label: 'Often', value: 3 },
            { label: 'Very Often', value: 4, color: 'red' }
          ],
          aiIntro: "Impostor syndrome is incredibly common among successful people. Let's see if this resonates with you."
        },
        {
          id: 'identity_4',
          text: 'In moments of personal challenge or failure, how kindly and compassionately do you treat yourself?',
          options: [
            { label: 'Not at all', value: 0, color: 'red' },
            { label: 'A little', value: 1 },
            { label: 'Somewhat', value: 2 },
            { label: 'Mostly', value: 3 },
            { label: 'Completely', value: 4, color: 'green' }
          ],
          aiIntro: "Self-compassion is a skill we can develop. How gentle are you with yourself during difficult times?",
          positive: true
        },
        {
          id: 'identity_5',
          text: 'How connected do you feel to your core values and authentic identity in your daily choices and actions?',
          options: [
            { label: 'Not at all', value: 0, color: 'red' },
            { label: 'A little', value: 1 },
            { label: 'Somewhat', value: 2 },
            { label: 'Mostly', value: 3 },
            { label: 'Completely', value: 4, color: 'green' }
          ],
          aiIntro: "Living authentically aligned with your values is key to fulfillment. Let's explore this connection.",
          positive: true
        }
      ]
    }
  ];

  // Calculate progress after domains is defined
  const totalQuestions = domains.reduce((sum, domain) => sum + domain.questions.length, 0);
  const currentQuestionNumber = domains.slice(0, currentDomain).reduce((sum, domain) => sum + domain.questions.length, 0) + currentQuestion + 1;
  const progress = (currentQuestionNumber / totalQuestions) * 100;

  const responseOptions = [
    { value: 0, label: 'Never', color: 'bg-green-100 text-green-800' },
    { value: 1, label: 'Rarely', color: 'bg-yellow-100 text-yellow-800' },
    { value: 2, label: 'Sometimes', color: 'bg-orange-100 text-orange-800' },
    { value: 3, label: 'Often', color: 'bg-red-100 text-red-800' },
    { value: 4, label: 'Very Often', color: 'bg-red-200 text-red-900' }
  ];

  const getOptionColor = (option, isPositive) => {
    if (option.color === 'green') return 'bg-green-100 text-green-800';
    if (option.color === 'red') return 'bg-red-100 text-red-800';
    // fallback to isPositive
    if (isPositive) {
      // Higher value = more positive
      return option.value >= 3 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    } else {
      // Higher value = more stress
      return option.value >= 3 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';
    }
  };

  const getColorClasses = (color, variant = 'default') => {
    const colorMap = {
      blue: variant === 'light' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-500 text-white',
      rose: variant === 'light' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-500 text-white',
      emerald: variant === 'light' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500 text-white',
      amber: variant === 'light' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-500 text-white',
      violet: variant === 'light' ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-violet-500 text-white'
    };
    return colorMap[color] || colorMap.blue;
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentDomain > 0) {
      setCurrentDomain(currentDomain - 1);
      setCurrentQuestion(domains[currentDomain - 1].questions.length - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < domains[currentDomain].questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentDomain < domains.length - 1) {
      setCurrentDomain(currentDomain + 1);
      setCurrentQuestion(0);
    }
  };

  // When the question changes, set the intro text
  useEffect(() => {
    if (!isComplete && !showFollowUp) {
      const currentQ = domains[currentDomain]?.questions[currentQuestion];
      if (currentQ && typeof currentQ.aiIntro === 'string') {
        setAiIntroText(currentQ.aiIntro);
      }
    }
  }, [currentDomain, currentQuestion, isComplete, showFollowUp]);

  // Set AI message instantly without typing effect
  useEffect(() => {
    if (!aiIntroText) return;
    setAiMessage(aiIntroText);
  }, [aiIntroText]);

  // Animate progress bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  /**
   * Enhanced Wellness Score Calculation
   * 
   * This improved calculation addresses issues with the previous method:
   * 
   * 1. **Problem**: Old method averaged ALL domains, including zero-stress ones
   *    **Solution**: Only calculates from stress-affected domains (score >= 4)
   * 
   * 2. **Problem**: All domains treated equally regardless of importance
   *    **Solution**: Weighted scoring (Critical domains = 1.5x, Others = 1.0x)
   * 
   * 3. **Problem**: Users with mostly zero stress got artificially low scores
   *    **Solution**: Minimum score protection (5+) for users with 3+ non-stressed domains
   * 
   * 4. **Problem**: Only used survey scores, ignored AI stress analysis
   *    **Solution**: Integrates AI stress analysis when available
   * 
   * Critical Domains: Work & Career, Self-Worth & Identity
   * Formula: wellnessScore = 10 - (weightedStressScore / 10)
   * Range: 1-10 (1 = high stress, 10 = excellent wellness)
   */
  const calculateWellnessScore = () => {
    // Get domain scores using the same logic as formatResponsesForWellnessScore
    const domainScores = domains.map((domain, index) => {
      // Gather all stress scores for the domain (prefer enhanced AI analysis, fallback to basic AI, then survey score)
      const scores = domain.questions.map(q => {
        const ai = stressAnalysis[q.id];
        // Prioritize enhanced analysis score, fallback to basic AI score, then survey score
        if (ai?.enhanced?.score && typeof ai.enhanced.score === 'number') {
          return ai.enhanced.score;
        } else if (ai && typeof ai.score === 'number') {
          return ai.score;
        } else {
          return responses[q.id] ?? 0;
        }
      });

      // Exclude 0-score responses from average calculation
      const nonZeroScores = scores.filter(score => score > 0);
      // If no question has a stress score >= 4, set domain stress to 0% and label as 'No Concern'
      // Check if ManovaAgent detected stress in any question for this domain
      const hasStress = domain.questions.some(q => {
        const ai = stressAnalysis[q.id];
        // Check enhanced analysis first, then basic AI
        if (ai?.enhanced) {
          return ai.enhanced.needsDeepDive || ai.enhanced.score >= 7;
        } else if (ai) {
          return ai.category === "High" || ai.category === "Moderate";
        }
        return false;
      });
      if (!hasStress) {
        return {
          domain: domain.name,
          score: 0,
          label: 'No Concern',
          hasStress: false
        };
      }
      // Otherwise, calculate average (excluding 0s)
      const average = nonZeroScores.length > 0
        ? nonZeroScores.reduce((sum, score) => sum + score, 0) / nonZeroScores.length
        : 0;
      const stressScore = Math.round((average / 10) * 100); // 0-10 scale to 0-100%
      return {
        domain: domain.name,
        score: stressScore,
        label: stressScore === 0 ? 'No Concern' : undefined,
        hasStress: true
      };
    }).filter(Boolean);

    // Separate domains with stress from those without
    const stressDomains = domainScores.filter(d => d.hasStress);
    const nonStressDomains = domainScores.filter(d => !d.hasStress);

    // Define critical domains that should have higher weight
    const criticalDomains = ['Work & Career', 'Self-Worth & Identity'];
    
    // Calculate weighted average stress score from stress-affected domains only
    let weightedStressScore = 0;
    let totalWeight = 0;
    
    if (stressDomains.length > 0) {
      stressDomains.forEach(domain => {
        const weight = criticalDomains.includes(domain.domain) ? 1.5 : 1.0;
        weightedStressScore += domain.score * weight;
        totalWeight += weight;
      });
      
      weightedStressScore = weightedStressScore / totalWeight;
    }

    // Calculate wellness score based on stress-affected domains only
    // Higher stress = lower wellness score
    let wellnessScore = 10 - (weightedStressScore / 10); // Convert 0-100% to 0-10 scale, then invert
    
    // Apply minimum score logic for users with mostly non-stressed domains
    if (nonStressDomains.length >= 3) {
      // Check if any critical domains have high stress (>70%)
      const criticalDomainStress = stressDomains
        .filter(d => criticalDomains.includes(d.domain))
        .map(d => d.score);
      
      const hasCriticalStress = criticalDomainStress.some(score => score > 70);
      
      if (!hasCriticalStress) {
        // If 3+ domains have no stress and no critical domains are highly stressed,
        // ensure minimum wellness score of 5
        wellnessScore = Math.max(wellnessScore, 5);
      }
    }

    // Ensure score is within valid range (1-10)
    wellnessScore = Math.max(1, Math.min(10, Math.round(wellnessScore)));
    
    // Debug logging
    console.log('🧮 Wellness Score Calculation:', {
      stressDomains: stressDomains.map(d => ({ domain: d.domain, score: d.score })),
      nonStressDomains: nonStressDomains.map(d => d.domain),
      weightedStressScore,
      calculatedScore: wellnessScore,
      criticalDomainStress: stressDomains
        .filter(d => criticalDomains.includes(d.domain))
        .map(d => ({ domain: d.domain, score: d.score }))
    });

    return wellnessScore;
  };

  const analyzeEmotionalState = () => {
    // Use ManovaAgent stress analysis results instead of static scoring
    const domainScores = domains.map((domain) => {
      const domainAnalysis = domain.questions.map(q => {
        const ai = stressAnalysis[q.id];
        if (ai?.enhanced) {
          return {
            score: ai.enhanced.score,
            category: ai.enhanced.tag,
            needsDeepDive: ai.enhanced.needsDeepDive
          };
        } else if (ai) {
          return {
            score: ai.score,
            category: ai.category,
            needsDeepDive: ai.score >= 7
          };
        }
        return { score: 0, category: 'Low', needsDeepDive: false };
      });

      // Calculate domain stress based on ManovaAgent analysis
      const stressedQuestions = domainAnalysis.filter(a => a.needsDeepDive);
      const avgStressScore = domainAnalysis.length > 0 
        ? domainAnalysis.reduce((sum, a) => sum + a.score, 0) / domainAnalysis.length
        : 0;

      return { 
        domain: domain.name, 
        score: avgStressScore,
        hasHighStress: stressedQuestions.length > 0,
        stressedQuestionsCount: stressedQuestions.length
      };
    });

    // Identify primary concerns based on ManovaAgent analysis
    const concerns = domainScores
      .filter(d => d.hasHighStress || d.score >= 6) // High stress or moderate-high stress
      .sort((a, b) => b.score - a.score)
      .map(d => d.domain);

    // Determine overall sentiment based on stress analysis
    const highStressDomains = domainScores.filter(d => d.hasHighStress);
    const avgStressScore = domainScores.reduce((sum, d) => sum + d.score, 0) / domainScores.length;
    
    let mood = 'positive';
    if (highStressDomains.length >= 2) {
      mood = 'very stressed';
    } else if (highStressDomains.length === 1 || avgStressScore >= 6) {
      mood = 'stressed';
    } else if (avgStressScore >= 4) {
      mood = 'moderate';
    } else if (avgStressScore >= 2) {
      mood = 'managing well';
    }

    return {
      mood,
      primaryConcerns: concerns,
      domainScores,
      needsSupport: highStressDomains.length > 0 || avgStressScore >= 6,
      highStressDomains: highStressDomains.length,
      avgStressScore
    };
  };

  // Helper to get label for a response value
  const getOptionLabel = (value) => {
    const found = responseOptions.find(opt => opt.value === value);
    return found ? found.label : value;
  };

  const handleResponse = async (value) => {
    const questionObj = domains[currentDomain]?.questions[currentQuestion];
    const questionId = questionObj.id;
    const currentQuestionText = questionObj.text;
    const isPositive = questionObj.isPositive || questionObj.positive || false;
    const answerLabel = questionObj.options.find(opt => opt.value === value)?.label || value;
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
    setIsAnalyzingStress(true);
    try {
      // Use enhanced stress analysis with domain context
      const analysis = await analyzeStressResponse(
        currentQuestionText, 
        answerLabel, 
        null, // emotion - will be detected by enhanced analysis
        domains[currentDomain].name, // domain for enhanced analysis
        questionId // questionId for enhanced analysis
      );
      
      setStressAnalysis(prev => ({
        ...prev,
        [questionId]: {
          ...analysis,
          answerLabel,
          questionText: currentQuestionText,
          // Include enhanced analysis data if available
          enhanced: analysis.enhanced || null
        }
      }));
      
      // Console log for cause tag testing
      if (analysis.enhanced?.causeTag) {
        console.log(`🏷️ Question "${currentQuestionText}" | Answer: "${answerLabel}" | Cause Tag: "${analysis.enhanced.causeTag}" | Score: ${analysis.enhanced.score}`);
      }

      // Generate and store emotional vector using modular approach
      try {
        const responseData = {
          userId,
          questionId,
          questionText: currentQuestionText,
          answerLabel,
          answerValue: value,
          domain: domains[currentDomain].name,
          isPositive
        };

        const result = await processQuestionResponse(responseData);
        
        if (result.success) {
          if (result.vectorStored) {
            console.log(`✅ Vector stored for user ${userId} - Domain: ${domains[currentDomain].name}, Question: ${questionId}`);
          } else {
            console.warn(`⚠️ Vector storage failed for ${questionId}: ${result.vectorError || 'Unknown error'}`);
          }
          
          // Update stress analysis with the result
          setStressAnalysis(prev => ({
            ...prev,
            [questionId]: {
              ...result.stressAnalysis,
              answerLabel,
              questionText: currentQuestionText,
              enhanced: result.stressAnalysis.enhanced || null,
              vectorStored: result.vectorStored,
              vectorId: result.vectorId,
              vectorError: result.vectorError
            }
          }));
        } else {
          console.error('Response processing failed:', result.error);
        }
        
      } catch (vectorError) {
        console.error('Error storing emotional vector:', vectorError);
        // Don't block the survey flow if vector storage fails
      }
    } catch (error) {
      console.error('Error analyzing stress level:', error);
    } finally {
      setIsAnalyzingStress(false);
    }
    setTimeout(async () => {
      if (currentQuestion < domains[currentDomain].questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        // End of domain: check if follow-up is needed
        const avgScore = calculateDomainScore(currentDomain);
        
        // Wait a bit for any pending stress analysis to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Build stressedQuestions array for deep dive using AI stress analysis
        const allQuestions = domains[currentDomain].questions
          .map(q => {
            const score = responses[q.id];
            const questionStressAnalysis = stressAnalysis[q.id];
            const isPositive = q.isPositive || q.positive || false;
            const stressScore = questionStressAnalysis?.enhanced?.score || questionStressAnalysis?.score || score;
            
            // Debug logging
            console.log(`Question ${q.id}: Survey score=${score}, AI stress score=${stressScore}, Emotion=${questionStressAnalysis?.emotion}, Intensity=${questionStressAnalysis?.intensity}`);
            
            // Determine stressLevel based on AI stress score
            let stressLevel = 'low';
            if (stressScore >= 7) {
              stressLevel = 'high';
            } else if (stressScore >= 4) {
              stressLevel = 'moderate';
            }
            
            return {
              id: q.id,
              text: q.text,
              selectedOption: getOptionLabel(score),
              score: score, // Original survey score
              // Add stress analysis data with enhanced analysis priority
              emotion: questionStressAnalysis?.enhanced?.tag || questionStressAnalysis?.emotion || '',
              intensity: questionStressAnalysis?.enhanced?.intensity || questionStressAnalysis?.intensity || 'Moderate',
              stressScore: stressScore, // Enhanced AI stress score
              stressLevel: stressLevel, // NEW: stressLevel property for domain transition logic
              answerLabel: questionStressAnalysis?.answerLabel || getOptionLabel(score),
              // Add domain information for filtering
              domain: domains[currentDomain].name,
              aiAnalysis: questionStressAnalysis ? {
                score: questionStressAnalysis.enhanced?.score || questionStressAnalysis.score,
                emotion: questionStressAnalysis.enhanced?.tag || questionStressAnalysis.emotion,
                intensity: questionStressAnalysis.enhanced?.intensity || questionStressAnalysis.intensity,
                // Include enhanced analysis data
                enhanced: questionStressAnalysis.enhanced || null
              } : null,
              // Optionally add customReason, tags if available in responses
              customReason: responses[`${q.id}_customReason`] || '',
              tags: responses[`${q.id}_tags`] || [],
              isPositive
            };
          });

        // Apply the enhanced filtering logic using the new stress analysis
        const filteringResult = await filterDeepDiveQuestions(allQuestions, domains[currentDomain].name, userId);
        const filteredQuestions = filteringResult.filteredQuestions;
        const domainNeedsReview = filteringResult.domainNeedsReview;

        // Add debug logging for deep dive trigger check
        console.log("Deep Dive Trigger Check", {
          domain: domains[currentDomain].name,
          questions: allQuestions.map(q => ({
            q: q.text,
            score: q.stressScore || q.score,
            stress: q.aiAnalysis?.score || 'unknown',
            stressLevel: q.stressLevel,
            include: q.includeInDeepDive,
            emotion: q.emotion,
            intensity: q.intensity,
            aiAnalysis: q.aiAnalysis
          }))
        });

        // Use ManovaAgent analysis to determine deep dive trigger
        const shouldTriggerDeepDive = allQuestions.some(q => {
          const ai = q.aiAnalysis;
          // Check enhanced analysis first
          if (ai?.enhanced) {
            return ai.enhanced.needsDeepDive || ai.enhanced.score >= 7;
          }
          // Fallback to basic AI analysis
          if (ai) {
            return ai.category === "High" || ai.score >= 7;
          }
          return false;
        });
        
        // Check if deep dive should be triggered based on ManovaAgent analysis
        const hasHighStressQuestions = shouldTriggerDeepDive;
        
        console.log("🔍 Deep Dive Analysis for all domains:", {
          domain: domains[currentDomain].name,
          filteredQuestionsCount: filteredQuestions.length,
          domainNeedsReview,
          shouldTriggerDeepDive,
          hasHighStressQuestions: hasHighStressQuestions,
          highStressQuestionsCount: allQuestions.filter(q => q.stressLevel === 'high').length,
          allQuestionsAnalysis: allQuestions.map(q => ({
            text: q.text,
            aiScore: q.aiAnalysis?.score,
            emotion: q.emotion,
            intensity: q.intensity,
            answer: q.answerLabel,
            stressLevel: q.stressLevel,
            hasHighStress: q.stressLevel === 'high'
          }))
        });

        // Debug logging for all domains
        console.log("🔍 Enhanced Deep Dive Questions", filteredQuestions.map(q => ({
          q: q.text,
          score: q.aiAnalysis?.score,
          stressLevel: q.stressLevel,
          domain: q.domain,
          userAnswer: q.selectedOption,
          emotion: q.emotion,
          intensity: q.intensity
        })));
        
        console.log("🔍 Domain Review Status:", {
          domain: domains[currentDomain].name,
          needsReview: domainNeedsReview,
          sometimesCount: filteringResult.sometimesCount,
          totalAnswers: filteringResult.totalAnswers,
          shouldTriggerDeepDive
        });
        
        // Additional debug: show all questions and their analysis
        const enhancedAnalysisPromises = allQuestions.map(async q => {
          // Safety check: ensure we have a valid answer before calling comprehensiveStressAnalysis
          const answer = q.answerLabel || q.selectedOption || 'No answer provided';
          try {
            const enhancedAnalysis = await comprehensiveStressAnalysis(
              answer,
              q.text,
              domains[currentDomain].name.toLowerCase(),
              undefined,
              false,
              userId
            );
            return {
              q: q.text,
              aiScore: q.aiAnalysis?.score,
              enhancedScore: enhancedAnalysis.score,
              enhancedEmotion: enhancedAnalysis.emotion,
              enhancedIntensity: enhancedAnalysis.intensity,
              shouldTrigger: enhancedAnalysis.shouldTriggerDeepDive,
              domainNeedsReview: enhancedAnalysis.domainNeedsReview,
              confidence: enhancedAnalysis.confidence,
              reason: enhancedAnalysis.reason,
              domain: q.domain,
              userAnswer: q.selectedOption
            };
          } catch (error) {
            console.error(`Error analyzing question: ${q.text}`, error);
            return {
              q: q.text,
              aiScore: q.aiAnalysis?.score,
              enhancedScore: 2,
              enhancedEmotion: 'Neutral',
              enhancedIntensity: 'Low',
              shouldTrigger: false,
              domainNeedsReview: false,
              confidence: 'low',
              reason: 'Analysis failed',
              domain: q.domain,
              userAnswer: q.selectedOption
            };
          }
        });
        
        const enhancedAnalysisResults = await Promise.all(enhancedAnalysisPromises);
        console.log("🔍 All Questions with Enhanced Analysis:", enhancedAnalysisResults);

        // Ensure showDeepDive is triggered before moving to the next domain
        if (hasHighStressQuestions) {
          console.log(`🚀 Triggering deep dive for ${domains[currentDomain].name} - Found ${allQuestions.filter(q => q.stressLevel === 'high').length} high stress questions`);
          
          // Prepare data for GPT-4
          setIsLoadingDeepDive(true);
          const domain = domains[currentDomain].name;
          const questionsAndAnswers = domains[currentDomain].questions.map(q => ({
            id: q.id,
            text: q.text,
            answer: responses[q.id] ?? 0
          }));

          try {
            const followup = await mcpService.generateDeepDiveFollowup(domain, questionsAndAnswers);
            setDeepDiveDomain(domain);
            setDeepDiveFollowup(followup);
            setShowDeepDive(true);
            // Pass flaggedQuestions as state for DeepDiveFollowup
            setDeepDiveFollowup(prev => ({ 
              ...prev, 
              stressedQuestions: filteredQuestions, // These are the flagged questions
              domainNeedsReview: domainNeedsReview,
              sometimesCount: filteringResult.sometimesCount,
              totalAnswers: filteringResult.totalAnswers
            }));
          } catch (e) {
            console.error('Error generating deep dive:', e);
            setDeepDiveDomain(domain);
            setDeepDiveFollowup({
              title: `Deep Dive: ${domain}`,
              followupIntro: domainNeedsReview 
                ? "Thanks for sharing. I noticed some patterns in your responses that suggest this area might benefit from deeper exploration. Let's take a closer look:"
                : "Thanks for sharing. Based on your check-in, here are a few things that might be contributing to your stress. Please select all that apply:",
              options: [],
              textboxPrompt: 'Share anything else?',
              rootEmotion: '',
              urgencyLevel: 'medium',
              suggestedTags: [],
              stressedQuestions: filteredQuestions, // These are the flagged questions
              domainNeedsReview: domainNeedsReview,
              sometimesCount: filteringResult.sometimesCount,
              totalAnswers: filteringResult.totalAnswers
            });
            setShowDeepDive(true);
          } finally {
            setIsLoadingDeepDive(false);
          }
        } else {
          // No high-stress questions found - show positive message and continue to next domain
          console.log(`🎉 No high stress questions (stressLevel === 'high') detected in ${domains[currentDomain].name} domain`);
          setNoStressedQuestions(true);
          setAiMessage(`Great news! Your responses in ${domains[currentDomain].name} show you're managing this area well. No significant stress concerns were detected.`);
          
          // Wait a moment to show the positive message, then continue to next domain
          setTimeout(async () => {
            setNoStressedQuestions(false);
            // Always proceed to next domain regardless of stress analysis
            if (currentDomain < domains.length - 1) {
              setCurrentDomain(prev => prev + 1);
              setCurrentQuestion(0);
              setShowDeepDive(false);
              setShowDomainInsight(false);
              setNoStressedQuestions(false);
            } else {
              // Survey complete - process enhanced analysis
              setIsComplete(true);
              const score = calculateWellnessScore();
              setWellnessScore(score);
              const emotionalAnalysis = analyzeEmotionalState();
              setSentiment(emotionalAnalysis);
              setAiMessage("Thank you for sharing so openly with me. I'm analyzing your responses to provide personalized insights...");
              
              // Prepare survey data for final submission
              const surveyData = {
                responses: responses,
                stressScore: score,
                emotionSummary: emotionalAnalysis,
                wellnessScore: score,
                domainScores: formatResponsesForWellnessScore(),
                stressAnalysis: stressAnalysis,
                deepDiveSummaries: deepDiveSummaries,
                patternAnalysis: patternAnalysisResult,
                deepDiveTrigger: deepDiveTriggerResult
              };
              
              // Submit final survey data
              try {
                await handleSurveySubmit(surveyData);
                console.log('✅ Survey completion data saved successfully');
              } catch (error) {
                console.error('❌ Error saving survey completion data:', error);
                // Don't block the UI flow if save fails
              }
              
              // Process enhanced stress analysis batch and save to Firestore
              try {
                const allResponses = [];
                domains.forEach(domain => {
                  domain.questions.forEach(question => {
                    const response = responses[question.id];
                    if (response !== undefined) {
                      const answerLabel = question.options?.find(opt => opt.value === response)?.label || response;
                      allResponses.push({
                        question: question.text,
                        answer: answerLabel,
                        domain: domain.name,
                        questionId: question.id
                      });
                    }
                  });
                });
                
                // Process batch analysis and save to Firestore
                if (allResponses.length > 0) {
                  enhancedAnalysisIntegration(allResponses, userId)
                    .then(result => {
                      if (result.success) {
                        console.log('✅ Enhanced stress analysis saved successfully:', result.summary);
                      } else {
                        console.warn('⚠️ Enhanced stress analysis save failed:', result.error);
                      }
                    })
                    .catch(error => {
                      console.error('❌ Error saving enhanced stress analysis:', error);
                    });
                }
                
                // 🧠 Layer 1 AI: Emotional Pattern Analysis
                try {
                  console.log('🧠 Starting Layer 1 emotional pattern analysis...');
                  
                  // Prepare current responses with stress analysis data
                  const currentResponsesForAnalysis = allResponses.map(response => {
                    const questionStressAnalysis = Object.values(stressAnalysis).find(
                      analysis => analysis.questionText === response.question
                    );
                    
                    return {
                      ...response,
                      stressScore: questionStressAnalysis?.enhanced?.score || questionStressAnalysis?.score || 0,
                      aiAnalysis: questionStressAnalysis ? {
                        score: questionStressAnalysis.enhanced?.score || questionStressAnalysis.score,
                        enhanced: questionStressAnalysis.enhanced,
                        emotion: questionStressAnalysis.enhanced?.tag || questionStressAnalysis.emotion,
                        intensity: questionStressAnalysis.enhanced?.intensity || questionStressAnalysis.intensity,
                        causeTag: questionStressAnalysis.enhanced?.causeTag
                      } : null
                    };
                  });
                  
                  // Perform emotional pattern analysis
                  const patternAnalysis = await analyzeEmotionalPatterns(userId, currentResponsesForAnalysis);
                  
                  // Generate deep dive trigger based on patterns
                  const deepDiveTrigger = generateDeepDiveTrigger(patternAnalysis);
                  
                  console.log('🎯 Pattern-based deep dive analysis:', {
                    shouldTrigger: deepDiveTrigger.shouldTrigger,
                    reason: deepDiveTrigger.reason,
                    recommendTherapist: deepDiveTrigger.recommendTherapist,
                    focusDomains: deepDiveTrigger.focusDomains
                  });
                  
                  // Store pattern analysis results in state for UI display
                  setPatternAnalysisResult(patternAnalysis);
                  setDeepDiveTriggerResult(deepDiveTrigger);
                  
                  // Trigger therapist recommendation if needed
                  if (deepDiveTrigger.recommendTherapist) {
                    console.log('🏥 Therapist recommendation triggered due to recurring patterns');
                    setShowTherapistRecommendation(true);
                    setAiMessage(`
                      I've noticed some recurring stress patterns in your responses that suggest you might benefit from speaking with a mental health professional. 
                      This is completely normal and shows self-awareness. Consider scheduling a consultation to discuss these patterns further.
                    `);
                  } else if (deepDiveTrigger.shouldTrigger) {
                    setAiMessage(`
                      I've identified some patterns in your responses that suggest certain areas may need attention. 
                      Let's explore these patterns further to help you develop better coping strategies.
                    `);
                  }
                  
                  // Perform vector cleanup for storage optimization
                  await performVectorCleanup(userId, 50);
                  
                } catch (patternError) {
                  console.error('❌ Error in emotional pattern analysis:', patternError);
                  // Don't block the survey completion if pattern analysis fails
                }
              } catch (error) {
                console.error('❌ Error processing enhanced analysis batch:', error);
              }
              
              setTimeout(() => {
                setShowResults(true);
              }, 2000);
            }
          }, 3000);
        }
      }
    }, 500);
  };

  const calculateDomainScore = (domainIndex) => {
    const domain = domains[domainIndex];
    const domainResponses = domain.questions
      .map(q => responses[q.id])
      .filter(score => score !== undefined && score !== null);
    
    if (domainResponses.length === 0) return null;
    
    const average = domainResponses.reduce((sum, score) => sum + score, 0) / domainResponses.length;
    return Math.round(average * 25); // Convert to percentage
  };

  const getWellnessLevel = (score) => {
    if (score <= 25) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score <= 50) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score <= 75) return { level: 'Moderate Concern', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'High Concern', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getWellnessFeedback = (score) => {
    // Get domain scores to provide more specific feedback
    const domainScores = formatResponsesForWellnessScore();
    const stressDomains = domainScores.filter(d => d.hasStress);
    const nonStressDomains = domainScores.filter(d => !d.hasStress);
    
    // Define critical domains
    const criticalDomains = ['Work & Career', 'Self-Worth & Identity'];
    const criticalDomainStress = stressDomains
      .filter(d => criticalDomains.includes(d.domain))
      .map(d => d.score);
    
    const hasCriticalStress = criticalDomainStress.some(score => score > 70);

    if (score >= 8) {
      return {
        message: "Excellent! You're showing strong wellness across all domains. Your balanced approach to life is serving you well.",
        color: "text-green-600",
        bg: "bg-green-50"
      };
    } else if (score >= 6) {
      if (nonStressDomains.length >= 3) {
        return {
          message: "You're doing well overall! Most areas of your life are balanced, with just a few areas that could use attention. Focus on the domains showing higher stress levels.",
          color: "text-blue-600",
          bg: "bg-blue-50"
        };
      } else {
        return {
          message: "You're managing well despite some challenges. Your responses show resilience and self-awareness. Consider focusing on the areas with higher stress levels.",
          color: "text-blue-600",
          bg: "bg-blue-50"
        };
      }
    } else if (score >= 4) {
      if (hasCriticalStress) {
        return {
          message: "I notice some significant challenges in important areas of your life. While you're managing, these critical domains deserve attention. Consider reaching out for support.",
          color: "text-yellow-600",
          bg: "bg-yellow-50"
        };
      } else {
        return {
          message: "You're experiencing some stress, but it's manageable. Focus on the specific areas showing higher stress levels. Small changes can make a big difference.",
          color: "text-yellow-600",
          bg: "bg-yellow-50"
        };
      }
    } else {
      if (hasCriticalStress) {
        return {
          message: "You're experiencing significant stress in critical areas of your life. This is completely valid and you don't have to navigate it alone. Consider reaching out to a mental health professional or trusted support system.",
          color: "text-red-600",
          bg: "bg-red-50"
        };
      } else {
        return {
          message: "Your responses suggest you're experiencing considerable stress across multiple areas. Remember, it's okay to seek support. Consider reaching out to a mental health professional or trusted support system.",
          color: "text-red-600",
          bg: "bg-red-50"
        };
      }
    }
  };

  const goToNextDomainOrFinish = async (skipDeepDive = false, skipDomainInsight = false) => {
    const domainScore = calculateDomainScore(currentDomain);
    
    // ALWAYS proceed to next domain or finish - never skip domains based on stress
    if (currentDomain < domains.length - 1) {
      setCurrentDomain(prev => prev + 1);
      setCurrentQuestion(0);
      setShowFollowUp(false);
      setFollowUpQuestion('');
      setFollowUpAnswer('');
      setShowDeepDive(false);
      setShowDomainInsight(false); // Reset domain insight state
      setNoStressedQuestions(false);
    } else {
      setIsComplete(true);
      const score = calculateWellnessScore();
      setWellnessScore(score);
      const emotionalAnalysis = analyzeEmotionalState();
      setSentiment(emotionalAnalysis);
      setAiMessage("Thank you for sharing so openly with me. I'm analyzing your responses to provide personalized insights...");
      
      // Prepare survey data for final submission
      const surveyData = {
        responses: responses,
        stressScore: score,
        emotionSummary: emotionalAnalysis,
        wellnessScore: score,
        domainScores: formatResponsesForWellnessScore(),
        stressAnalysis: stressAnalysis,
        deepDiveSummaries: deepDiveSummaries,
        patternAnalysis: patternAnalysisResult,
        deepDiveTrigger: deepDiveTriggerResult
      };
      
      // Submit final survey data
      try {
        await handleSurveySubmit(surveyData);
        console.log('✅ Survey completion data saved successfully');
      } catch (error) {
        console.error('❌ Error saving survey completion data:', error);
        // Don't block the UI flow if save fails
      }
      
      setTimeout(() => {
        setShowResults(true);
      }, 2000);
    }
  };

  const handleDeepDiveSave = async (payload) => {
    const userIdToUse = userId;
    // Support both { domain, reasons, ... } and { data: { domain, reasons, ... }, ... }
    const { domain, reasons, aiSummary, personalizedAdvice } = payload.data || payload;
    if (!userIdToUse) {
      console.warn("⚠️ Missing userId. Not saving or building context.");
      return;
    }
    if (!domain || !reasons || !reasons.length) {
      console.warn("⚠️ Missing data or userId. Not continuing.");
      return;
    }
    saveDeepDiveInsight(userIdToUse, domain, payload.data || payload);
    
    // Persist deep dive summary in local state for WellnessScore
    // Structure the data to match what the InsightModal expects
    setDeepDiveSummaries(prev => ({
      ...prev,
      [domain]: {
        summary: aiSummary || (personalizedAdvice && personalizedAdvice.validation) || '',
        actionableSteps: (personalizedAdvice && personalizedAdvice.actionableSteps) || [],
        reflectionQuestions: (personalizedAdvice && personalizedAdvice.reflectionQuestions) || [],
        selfCompassion: (personalizedAdvice && personalizedAdvice.selfCompassion) || '',
        // Add additional metadata for debugging
        timestamp: new Date().toISOString(),
        domain: domain,
        reasons: reasons
      }
    }));
    
    // Always proceed to next domain regardless of payload.continue
    if (payload.continue) {
      await goToNextDomainOrFinish(true);
    }
  };

  // 🔥 Finalize check-in save logic
  const handleSurveySubmit = async (surveyData) => {
    const userId = auth.currentUser?.uid;
    
    console.log('🔥 Survey submission initiated:', {
      userId,
      surveyDataKeys: Object.keys(surveyData),
      responsesCount: Object.keys(surveyData.responses || {}).length,
      wellnessScore: surveyData.wellnessScore
    });

    // 🔥 Save check-in to Firestore
    await saveCheckinData(userId, {
      ...surveyData,
      timestamp: new Date().toISOString()
    });

    // 🚀 NEW: Store complete check-in as vector embedding
    try {
      console.log('📡 Generating combined check-in embedding for vector storage...');
      
      // Combine all survey responses into a comprehensive text
      const responses = surveyData.responses || {};
      const combinedAnswers = [];
      const domainsProcessed = [];
      
      // Collect all answers with domain context
      domains.forEach(domain => {
        const domainAnswers = [];
        domain.questions.forEach(question => {
          const answer = responses[question.id];
          if (answer !== undefined && answer !== null) {
            const answerLabel = question.options?.find(opt => opt.value === answer)?.label || answer;
            domainAnswers.push(`${question.text}: ${answerLabel}`);
          }
        });
        
        if (domainAnswers.length > 0) {
          domainsProcessed.push(domain.name);
          combinedAnswers.push(`${domain.name} - ${domainAnswers.join('; ')}`);
        }
      });
      
      const combinedResponseText = combinedAnswers.join(' | ');
      const finalDomain = domainsProcessed.length === 1 ? domainsProcessed[0] : 'multi';
      const finalStressScore = surveyData.wellnessScore ? Math.round((10 - surveyData.wellnessScore) * 10) / 10 : 5;
      
      console.log('📝 Combined check-in data:', {
        domains: domainsProcessed,
        finalDomain,
        finalStressScore,
        responseLength: combinedResponseText.length
      });
      
      // Generate embedding for the complete check-in
      const embeddingData = {
        question: 'Complete wellness check-in summary',
        answer: combinedResponseText,
        domain: finalDomain,
        stressScore: finalStressScore
      };
      
      const embedding = await getResponseEmbedding(embeddingData);
      console.log(`🔢 Generated complete check-in embedding (${embedding.length} dimensions)`);
      
      // Prepare metadata for complete check-in vector
      const metadata = {
        timestamp: new Date().toISOString(),
        domain: finalDomain,
        stressScore: finalStressScore,
        response: combinedResponseText,
        question: 'Complete wellness check-in summary',
        emotion: surveyData.dominantEmotion || 'mixed',
        wellnessScore: surveyData.wellnessScore || 5,
        domainsIncluded: domainsProcessed.join(', '),
        responseCount: Object.keys(responses).length,
        checkInType: 'complete_survey'
      };
      
      // Store complete check-in vector in Pinecone
      const vectorResult = await upsertUserVector(userId, embedding, metadata);
      
      if (vectorResult.success) {
        console.log('✅ Complete check-in vector stored successfully:', {
          vectorId: vectorResult.vectorId,
          domains: domainsProcessed,
          stressScore: finalStressScore,
          wellnessScore: surveyData.wellnessScore
        });
      } else {
        console.warn('⚠️ Complete check-in vector storage failed:', {
          error: vectorResult.error,
          userId,
          domains: domainsProcessed,
          continuingFlow: true
        });
      }
      
    } catch (embeddingError) {
      console.error('❌ Error storing complete check-in embedding:', embeddingError);
      console.warn('⚠️ Check-in saved to Firestore successfully, but vector storage failed');
      // Don't throw error - check-in is saved, vector storage is supplementary
    }
  };

  const resetSurvey = () => {
    setCurrentDomain(0);
    setCurrentQuestion(0);
    setResponses({});
    setIsComplete(false);
    setShowResults(false);
    setAiMessage('');
    setShowFollowUp(false);
    setFollowUpQuestion('');
    setFollowUpAnswer('');
    setFollowUps({});
    setWellnessScore(0);
    setSentiment({});
    setDeepDiveSummaries({}); // Clear deep dive summaries on reset
    setStressAnalysis({}); // Clear stress analysis
    setDomainInsights({}); // Clear domain insights
    setCurrentDomainInsight(null);
    setShowDomainInsight(false);
    setNoStressedQuestions(false); // Clear no stressed questions state
  };

  // Navigation function for DeepDiveFollowup
  const goToNextDomain = async () => {
    console.log('🔄 Navigating to next domain from DeepDiveFollowup');
    
    if (currentDomain < domains.length - 1) {
      // Move to next domain - ALWAYS show next domain regardless of stress analysis
      setCurrentDomain(prev => prev + 1);
      setCurrentQuestion(0);
      setShowFollowUp(false);
      setFollowUpQuestion('');
      setFollowUpAnswer('');
      setShowDeepDive(false);
      setShowDomainInsight(false);
      setCurrentDomainInsight(null);
      setNoStressedQuestions(false);
      
      console.log(`✅ Moved to domain: ${domains[currentDomain + 1].name}`);
    } else {
      // Survey complete - show results
      console.log('✅ Survey complete, showing results');
      setIsComplete(true);
      const score = calculateWellnessScore();
      setWellnessScore(score);
      const emotionalAnalysis = analyzeEmotionalState();
      setSentiment(emotionalAnalysis);
      setAiMessage("Thank you for sharing so openly with me. I'm analyzing your responses to provide personalized insights...");
      
      // Prepare survey data for final submission
      const surveyData = {
        responses: responses,
        stressScore: score,
        emotionSummary: emotionalAnalysis,
        wellnessScore: score,
        domainScores: formatResponsesForWellnessScore(),
        stressAnalysis: stressAnalysis,
        deepDiveSummaries: deepDiveSummaries,
        patternAnalysis: patternAnalysisResult,
        deepDiveTrigger: deepDiveTriggerResult
      };
      
      // Submit final survey data
      try {
        await handleSurveySubmit(surveyData);
        console.log('✅ Survey completion data saved successfully');
      } catch (error) {
        console.error('❌ Error saving survey completion data:', error);
        // Don't block the UI flow if save fails
      }
      
      setTimeout(() => {
        setShowResults(true);
      }, 2000);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.questionStartTime === undefined) {
      window.questionStartTime = Date.now();
    }
  }, []);

  // --- Advanced User Context Builder ---
  class AdvancedUserContextBuilder {
    static buildContext(userId, userHistory, currentDomain) {
      return {
        userId,
        checkInCount: userHistory?.length || 1,
        currentDomain,
        stressTrends: this.calculateStressTrends(userHistory),
        recurringConcerns: this.extractRecurringConcerns(userHistory),
        improvementStreaks: this.trackImprovementStreaks(userHistory),
        lastCheckIn: userHistory?.[0]?.date || null,
        previousResponses: this.organizeResponsesByDomain(userHistory),
        responsePatterns: this.analyzeResponsePatterns(userHistory),
        historyDepth: userHistory?.length || 1
      };
    }

    static calculateStressTrends(history) {
      if (!history) return {};
      const trends = {};
      const domains = [...new Set(history.map(h => h.domain))];
      domains.forEach(domain => {
        const domainHistory = history.filter(h => h.domain === domain).slice(0, 2); // Only last 2
        const weights = domainHistory.map(h => h.weight);
        if (weights.length < 2) return;
        const trend = weights[0] > weights[1] ? 'down' : (weights[0] < weights[1] ? 'up' : 'stable');
        trends[domain] = { trend, last: weights[0], prev: weights[1] };
      });
      return trends;
    }

    static extractRecurringConcerns(history) {
      if (!history) return [];
      const allText = history.map(h => h.customInput || '').join(' ').toLowerCase();
      const keywords = ['recognition', 'overwhelmed', 'anxiety', 'support', 'burnout', 'isolation', 'sleep', 'money', 'purpose'];
      return keywords.filter(kw => allText.includes(kw));
    }

    static trackImprovementStreaks(history) {
      if (!history) return {};
      const streaks = {};
      const domains = [...new Set(history.map(h => h.domain))];
      domains.forEach(domain => {
        const domainHistory = history.filter(h => h.domain === domain);
        let streak = 0;
        for (let i = 1; i < domainHistory.length; i++) {
          if (domainHistory[i].weight < domainHistory[i - 1].weight) streak++;
          else break;
        }
        streaks[domain] = streak;
      });
      return streaks;
    }

    static organizeResponsesByDomain(history) {
      if (!history) return {};
      const byDomain = {};
      history.forEach(response => {
        if (!byDomain[response.domain]) byDomain[response.domain] = [];
        byDomain[response.domain].push({
          question: response.question,
          answer: response.answer,
          weight: response.weight,
          date: response.date
        });
      });
      return byDomain;
    }

    static analyzeResponsePatterns(history) {
      if (!history) return {};
      const patterns = {};
      history.forEach(h => {
        const day = new Date(h.date).getDay();
        if (!patterns[day]) patterns[day] = [];
        patterns[day].push(h.weight);
      });
      return patterns;
    }

    buildPersonalizedPrompt(userContext, domain, questionIndex) {
      const lastDomainResponses = userContext.previousResponses[domain] || [];
      const trendObj = userContext.stressTrends[domain] || {};
      let trendMessage = '';
      if (trendObj.trend === 'down') {
        trendMessage = "You seem to be managing work stress better. What's been most helpful?";
      } else if (trendObj.trend === 'up') {
        trendMessage = "I notice work has been more challenging lately. What's changed?";
      } else if (trendObj.trend === 'stable' && trendObj.last >= 3) {
        trendMessage = "Work stress has been ongoing. Have you considered any new strategies?";
      }
      const lastConcern = userContext.recurringConcerns[0] || '';
      const streak = userContext.improvementStreaks[domain] || 0;
      const historyDepth = userContext.historyDepth || 1;

      return `
USER CONTEXT:
- Check-in #: ${userContext.checkInCount}
- ${domain} stress trend: ${trendObj.trend || 'unknown'}
- Previous: ${trendObj.prev ?? 'N/A'}, Last: ${trendObj.last ?? 'N/A'}
- Recurring concern: ${lastConcern}
- Improvement streak: ${streak} check-ins
- History depth: ${historyDepth}

THERAPIST INSIGHT:
${trendMessage}

PREVIOUS RESPONSES:
${lastDomainResponses.map(r => `- [${r.date}] ${r.question}: ${r.answer} (${r.weight})`).join('\n')}

INSTRUCTIONS:
- Use the above trend message as the basis for your next question.
- Reference the user's most recent answers and trends.
- Sound like a therapist who remembers and tracks progress.
- Explain your reasoning for this question in the personalizationReason field.

Generate a question for ${domain}, question #${questionIndex + 1}, that is highly personalized to this context. Respond with valid JSON including a personalizationReason field.
`;
    }
  }

  // Replace UserContextBuilder with AdvancedUserContextBuilder in useEffect
  useEffect(() => {
    const loadUserContext = async () => {
      const userIdToUse = userId;
      if (!userIdToUse) {
        console.warn("⚠️ Missing userId. Not saving or building context.");
        return;
      }
      try {
        const { checkins } = await getCheckinHistory(userIdToUse);
        
        // Use the new contextual memory builder
        const currentDomainName = domains[currentDomain].name;
        const contextualMemory = contextualMemoryBuilder(currentDomainName, checkins);
        
        // Build full context using the new module
        const fullContext = await buildFullContext(userIdToUse, checkins, currentDomainName);
        
        // Combine with existing AdvancedUserContextBuilder for backward compatibility
        const advancedContext = AdvancedUserContextBuilder.buildContext(userIdToUse, checkins, currentDomainName);
        
        // Merge contexts
        const mergedContext = {
          ...advancedContext,
          ...fullContext,
          contextualMemory: contextualMemory
        };
        
        setUserContext(mergedContext);
      } catch (error) {
        console.error('Error loading user context:', error);
        setUserContext({
          userId: userIdToUse,
          checkInCount: 1,
          currentDomain: domains[currentDomain].name,
          stressTrends: {},
          recurringConcerns: [],
          improvementStreaks: {},
          lastCheckIn: null,
          previousResponses: {},
          responsePatterns: {},
          historyDepth: 1,
          contextualMemory: null
        });
      }
    };
    loadUserContext();
  }, [userId, currentDomain]);

  // Replace the mock getUserHistory with a real Firestore call
  async function getUserHistory(userId) {
    const { checkins } = await getCheckinHistory(userId);
    // Map Firestore checkin docs to the expected format for context builder
    return checkins.flatMap(checkin => {
      // If responses is an object, flatten to array of domain/question/answer/weight
      if (checkin.responses && typeof checkin.responses === 'object') {
        return Object.entries(checkin.responses).map(([question, value]) => ({
          domain: checkin.domain || '',
          question,
          answer: value.answer || value, // support both {answer,weight} and primitive
          weight: value.weight !== undefined ? value.weight : (typeof value === 'number' ? value : 0),
          date: checkin.timestamp || checkin.date || '',
          customInput: checkin.customInput || '',
          responseTime: checkin.responseTime || 30
        }));
      }
      // Fallback: treat as a single response
      return [{
        domain: checkin.domain || '',
        question: checkin.question || '',
        answer: checkin.answer || '',
        weight: checkin.weight || 0,
        date: checkin.timestamp || checkin.date || '',
        customInput: checkin.customInput || '',
        responseTime: checkin.responseTime || 30
      }];
    });
  }

  // --- Survey Submission Logic (for integration) ---
  // 💡 Remove legacy submit logic and helper functions for stress scoring
  // ... existing code ...

  // ✅ New Function: Format responses for WellnessScore component
  const formatResponsesForWellnessScore = () => {
    const domainScores = domains.map((domain, index) => {
      // Gather all stress scores for the domain (prefer AI stressAnalysis, fallback to survey score)
      const scores = domain.questions.map(q => {
        const ai = stressAnalysis[q.id];
        // Use AI score if available, else survey score
        return ai && typeof ai.score === 'number' ? ai.score : (responses[q.id] ?? 0);
      });

      // Exclude 0-score responses from average calculation
      const nonZeroScores = scores.filter(score => score > 0);
      // If no question has a stress score >= 4, set domain stress to 0% and label as 'No Concern'
      // Check if ManovaAgent detected stress in any question for this domain
      const hasStress = domain.questions.some(q => {
        const ai = stressAnalysis[q.id];
        // Check enhanced analysis first, then basic AI
        if (ai?.enhanced) {
          return ai.enhanced.needsDeepDive || ai.enhanced.score >= 7;
        } else if (ai) {
          return ai.category === "High" || ai.category === "Moderate";
        }
        return false;
      });
      if (!hasStress) {
        return {
          domain: domain.name,
          score: 0,
          label: 'No Concern',
          hasStress: false
        };
      }
      // Otherwise, calculate average (excluding 0s)
      const average = nonZeroScores.length > 0
        ? nonZeroScores.reduce((sum, score) => sum + score, 0) / nonZeroScores.length
        : 0;
      const stressScore = Math.round((average / 10) * 100); // 0-10 scale to 0-100%
      return {
        domain: domain.name,
        score: stressScore,
        label: stressScore === 0 ? 'No Concern' : undefined,
        hasStress: true
      };
    }).filter(Boolean);

    return domainScores;
  };

  // ✅ New Function: Generate Personalized Questions using Contextual Memory
  const generatePersonalizedQuestionForDomain = async (domain, questionIndex) => {
    try {
      // Get user's survey history for this domain
      const { checkins } = await getCheckinHistory(userId);
      
      const defaultQuestion = domains[domain].questions[questionIndex].text;
      
      // Use the utility function
      return await generatePersonalizedQuestion(
        domain, 
        checkins, 
        defaultQuestion, 
        mcpService._callOpenAIChat.bind(mcpService)
      );
    } catch (error) {
      console.error('Error generating personalized question:', error);
      return domains[domain].questions[questionIndex].text;
    }
  };

  // ✅ Enhanced Question Loading with Personalization
  const [personalizedQuestions, setPersonalizedQuestions] = useState({});
  const [isLoadingPersonalization, setIsLoadingPersonalization] = useState(false);

  useEffect(() => {
    const loadPersonalizedQuestions = async () => {
      if (!userContext || userContext.historyDepth < 2) return; // Only personalize for users with history
      
      setIsLoadingPersonalization(true);
      try {
        const personalized = {};
        
        // Generate personalized questions for each domain
        for (let domainIndex = 0; domainIndex < domains.length; domainIndex++) {
          const domain = domains[domainIndex];
          const domainQuestions = {};
          
          for (let questionIndex = 0; questionIndex < domain.questions.length; questionIndex++) {
            const personalizedQ = await generatePersonalizedQuestionForDomain(domain.name, questionIndex);
            domainQuestions[questionIndex] = personalizedQ;
          }
          
          personalized[domainIndex] = domainQuestions;
        }
        
        setPersonalizedQuestions(personalized);
        
        // Generate wellness insights for personalization message
        if (userContext) {
          const insights = await generateWellnessInsights(userId, userContext);
          setWellnessInsights(insights);
        }
      } catch (error) {
        console.error('Error loading personalized questions:', error);
      } finally {
        setIsLoadingPersonalization(false);
      }
    };

    loadPersonalizedQuestions();
  }, [userContext, userId]);

  // Generate AI insight for a completed domain
  const generateDomainInsight = async (domainIndex, domainScore) => {
    const domain = domains[domainIndex];
    
    // Build domain answers array
    const domainAnswers = domain.questions.map(q => ({
      question: q.text,
      answer: responses[q.id] || 0,
      label: getOptionLabel(responses[q.id] || 0)
    }));

    // Enhanced stress detection: Check for ANY individual stress triggers
    const hasIndividualStressTriggers = domain.questions.some(q => {
      const response = responses[q.id];
      const questionStressAnalysis = stressAnalysis[q.id];
      
      // Check for high stress indicators in individual responses
      const hasHighStress = (
        (questionStressAnalysis?.score || 0) >= 7 || // High AI stress score
        questionStressAnalysis?.intensity?.toLowerCase() === 'high' || // High intensity
        ['overwhelmed', 'anxious', 'stressed'].includes(questionStressAnalysis?.emotion?.toLowerCase()) || // High stress emotions
        (response >= 3 && !q.isPositive) || // High survey score for negative questions
        (response <= 1 && q.isPositive) // Low survey score for positive questions
      );
      
      return hasHighStress;
    });

    // Extract tags from responses (you can enhance this based on your tagging logic)
    const selectedTags = [];
    domain.questions.forEach(q => {
      const response = responses[q.id];
      const questionStressAnalysis = stressAnalysis[q.id];
      
      // Only include tags for HIGH stress (consistent with deep dive filtering)
      const hasStress = (
        response >= 3 || // High survey score
        (questionStressAnalysis?.score || 0) >= 8 || // HIGH AI stress score only
        questionStressAnalysis?.intensity?.toLowerCase() === 'high' // Only HIGH intensity
      );
      
      if (hasStress) {
        // Add domain-specific tags based on question content
        if (q.text.toLowerCase().includes('work')) selectedTags.push('workload');
        if (q.text.toLowerCase().includes('manager') || q.text.toLowerCase().includes('support')) selectedTags.push('lack of support');
        if (q.text.toLowerCase().includes('recognition')) selectedTags.push('lack of recognition');
        if (q.text.toLowerCase().includes('purpose') || q.text.toLowerCase().includes('meaning')) selectedTags.push('lack of purpose');
        if (q.text.toLowerCase().includes('overwhelm') || q.text.toLowerCase().includes('drain')) selectedTags.push('burnout');
        if (q.text.toLowerCase().includes('financial') || q.text.toLowerCase().includes('money')) selectedTags.push('financial stress');
        if (q.text.toLowerCase().includes('sleep') || q.text.toLowerCase().includes('energy')) selectedTags.push('health concerns');
        if (q.text.toLowerCase().includes('relationship') || q.text.toLowerCase().includes('connection')) selectedTags.push('relationship stress');
        if (q.text.toLowerCase().includes('authentic') || q.text.toLowerCase().includes('identity')) selectedTags.push('self-worth');
      }
    });

    // Calculate average intensity (convert domain score to 1-10 scale)
    // Enhanced: Consider individual stress triggers in intensity calculation
    let averageIntensity = Math.round((domainScore / 100) * 10);
    
    // Boost intensity if individual stress triggers are found
    if (hasIndividualStressTriggers) {
      averageIntensity = Math.max(averageIntensity, 8); // Minimum HIGH stress if individual triggers found
    }

    // Special handling for Personal Life domain
    if (domain.name === 'Personal Life') {
      // Check if ANY question has high stress indicators
      const hasHighStressCues = domain.questions.some(q => {
        const response = responses[q.id];
        const questionStressAnalysis = stressAnalysis[q.id];
        const answer = getOptionLabel(response || 0)?.toLowerCase() || '';
        
        return (
          (questionStressAnalysis?.score || 0) >= 8 ||
          questionStressAnalysis?.intensity?.toLowerCase() === 'high' ||
          ['overwhelmed', 'anxious', 'stressed'].includes(questionStressAnalysis?.emotion?.toLowerCase()) ||
          answer.includes('very often') || answer.includes('always') ||
          answer.includes('not at all') || answer.includes('never')
        );
      });
      
      // If high stress cues found, ensure deep dive is triggered instead of domain insight
      if (hasHighStressCues) {
        console.log("🔍 Personal Life: High stress cues detected, should trigger deep dive instead of domain insight");
        // This will be handled by the main logic above
        return;
      }
    }

    try {
      // Use the new domainInsightBuilder with enhanced sensitivity
      const prompt = domainInsightBuilder(domain.name, domainAnswers, selectedTags, averageIntensity);
      const gptRes = await callOpenAI(prompt);
      
      // Clean the response to handle markdown formatting
      let cleanedResponse = gptRes;
      if (typeof cleanedResponse === 'string') {
        // Remove markdown code blocks
        cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        // Remove any leading/trailing whitespace and newlines
        cleanedResponse = cleanedResponse.replace(/^\s+|\s+$/g, '');
      }
      
      const { summary, tips, stressLevel } = JSON.parse(cleanedResponse || "{}");

      // Enhanced stress level determination - Only HIGH stress triggers deep dive
      let finalStressLevel = stressLevel || "Low";
      if (hasIndividualStressTriggers) {
        finalStressLevel = averageIntensity >= 8 ? "High" : "Low"; // Only HIGH stress, no moderate
      }

      const domainInsight = {
        domain: domain.name,
        insight: summary || "You're managing this area well.",
        suggestions: tips || ["Keep up the good work", "Consider small improvements"],
        stressLevel: finalStressLevel,
        hasIndividualStressTriggers,
        averageIntensity
      };

      setDomainInsights(prev => ({ ...prev, [domainIndex]: domainInsight }));
      setCurrentDomainInsight(domainInsight);
      setShowDomainInsight(true);
    } catch (error) {
      console.error('Error generating domain insight:', error);
      console.log('Raw response:', gptRes);
      // Fallback insight with enhanced stress detection - Only HIGH stress
      const fallbackStressLevel = hasIndividualStressTriggers 
        ? (averageIntensity >= 8 ? "High" : "Low")
        : (domainScore > 70 ? "High" : "Low"); // Higher threshold for high stress
        
      const fallbackInsight = {
        domain: domain.name,
        insight: hasIndividualStressTriggers 
          ? "I noticed some areas that might need attention in this domain."
          : "Thank you for sharing your experiences in this area.",
        suggestions: hasIndividualStressTriggers 
          ? ["Consider exploring these concerns further", "Reach out for support if needed", "Practice self-compassion"]
          : ["Continue monitoring your feelings", "Reach out for support if needed"],
        stressLevel: fallbackStressLevel,
        hasIndividualStressTriggers,
        averageIntensity
      };
      setDomainInsights(prev => ({ ...prev, [domainIndex]: fallbackInsight }));
      setCurrentDomainInsight(fallbackInsight);
      setShowDomainInsight(true);
    }
  };

  const handleContinueFromInsight = async () => {
    setShowDomainInsight(false);
    setCurrentDomainInsight(null);
            await goToNextDomainOrFinish(false, true); // Skip domain insight since it was already shown
  };

  if (showResults) {
    const wellnessFeedback = getWellnessFeedback(wellnessScore);
    const wellnessScoreData = formatResponsesForWellnessScore();
    
    const handleViewDashboard = () => {
      window.location.href = '/dashboard';
    };

    const handleTakeSurveyAgain = () => {
      resetSurvey();
    };
    
    return (
      <div className="min-h-screen bg-white pt-20 pb-8 px-4">
        <WellnessSummary 
          domainScores={wellnessScoreData}
          overallScore={wellnessScore}
          mood={sentiment.mood}
          onViewDashboard={handleViewDashboard}
          onTakeSurveyAgain={handleTakeSurveyAgain}
          deepDiveSummaries={deepDiveSummaries}
        />
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-20 pb-8 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center">
          <div className="animate-pulse mb-6">
            <Brain className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
          </div>
          <div className="min-h-[100px]">
            <p className="text-lg text-gray-700 leading-relaxed">
              {aiMessage}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- Follow-up screen ---
  if (showFollowUp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
          <h2 className="text-2xl font-bold mb-4 text-indigo-700">Deep-Dive Follow-Up</h2>
          <p className="mb-6 text-gray-700">{followUpQuestion}</p>
          <form onSubmit={handleDeepDiveSave}>
            <textarea
              className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              rows={4}
              value={followUpAnswer}
              onChange={e => setFollowUpAnswer(e.target.value)}
              placeholder="Type your response here..."
              required
              disabled={isLoadingFollowUp}
            />
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              disabled={isLoadingFollowUp || !followUpAnswer.trim()}
            >
              {isLoadingFollowUp ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (showDeepDive && deepDiveFollowup) {
    // Get all responses for the current domain
    const domainQuestions = domains[currentDomain]?.questions.map(q => {
      const score = responses[q.id];
      const questionStressAnalysis = stressAnalysis[q.id];
      const stressScore = questionStressAnalysis?.score || score;
      
      return {
        id: q.id,
        text: q.text,
        selectedOption: getOptionLabel(score),
        score: score,
        emotion: questionStressAnalysis?.emotion || '',
        intensity: questionStressAnalysis?.intensity || 'Moderate',
        stressScore: stressScore,
        answerLabel: questionStressAnalysis?.answerLabel || getOptionLabel(score),
        domain: domains[currentDomain].name,
        aiAnalysis: questionStressAnalysis ? {
          score: questionStressAnalysis.enhanced?.score || questionStressAnalysis.score,
          emotion: questionStressAnalysis.enhanced?.tag || questionStressAnalysis.emotion,
          intensity: questionStressAnalysis.enhanced?.intensity || questionStressAnalysis.intensity
        } : null,
        // Add AI stress category and deep dive eligibility
        aiStressCategory: stressScore >= 7 ? 'high' : stressScore >= 5 ? 'moderate' : 'low',
        deepDiveEligible: stressScore >= 7, // Eligible if HIGH stress only (>= 7)
        response: score !== undefined ? score : null
      };
    }) || [];

    // Sanitize domainQuestions to ensure all required properties are present
    const sanitized = domainQuestions.map((q) => ({
      ...q,
      aiStressCategory: q.aiStressCategory ?? "normal", // fallback
      deepDiveEligible: q.deepDiveEligible !== false,
    }));

    return (
      <DeepDiveFollowup
        domainName={deepDiveDomain}
        userId={userId}
        isLoading={isLoadingDeepDive}
        deepDiveData={deepDiveFollowup}
        stressedQuestions={deepDiveFollowup.stressedQuestions || []}
        flaggedQuestions={deepDiveFollowup.stressedQuestions || []} // Pass as flaggedQuestions for explicit clarity
        domainQuestions={sanitized}
        goToNextDomain={goToNextDomain}
        onSave={handleDeepDiveSave}
      />
    );
  }

  // Safety check to ensure domains array is properly initialized
  if (!domains || domains.length === 0 || currentDomain >= domains.length) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-20 pb-8 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading survey...</p>
        </div>
      </div>
    );
  }

  const currentQ = domains[currentDomain]?.questions[currentQuestion];
  const Icon = domains[currentDomain]?.icon;

  // Safety check for current question
  if (!currentQ) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-20 pb-8 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  // Get personalized question if available
  const personalizedQuestion = personalizedQuestions[currentDomain]?.[currentQuestion];
  const displayQuestion = personalizedQuestion || currentQ?.text || '';

  // Add logic to show a different personalization message in the UI based on user history depth
  let personalizationMessage = '';
  if (userContext?.historyDepth === 1) {
    personalizationMessage = "Welcome! Let's start building your wellness journey.";
  } else if (userContext?.historyDepth < 4) {
    personalizationMessage = "We're starting to see some patterns in your responses.";
  } else {
    personalizationMessage = "You have a rich history with us. Your questions are now highly personalized!";
  }

  // Add contextual memory insights if available
  if (userContext?.contextualMemory?.input) {
    const memory = userContext.contextualMemory;
    if (memory.input.trim()) {
      personalizationMessage += ` I remember your recent concerns about ${memory.domain}.`;
    }
  }

  // Add wellness insights if available
  if (wellnessInsights?.insight) {
    personalizationMessage = wellnessInsights.insight;
  }

  // Add the AI Insight component after the main survey content
  if (
    showDomainInsight &&
    currentDomainInsight &&
    currentDomainInsight.stressLevel &&
    currentDomainInsight.stressLevel.toLowerCase() !== "low"
  ) {
    // If stress level is not low, redirect to deep dive instead of showing domain insight
    console.log("🔍 Domain insight stress level is not low, redirecting to deep dive");
    
    // Trigger deep dive logic
    const domain = domains[currentDomain];
    const allQuestions = domain.questions.map(q => {
      const score = responses[q.id];
      const questionStressAnalysis = stressAnalysis[q.id];
      const stressScore = questionStressAnalysis?.enhanced?.score || questionStressAnalysis?.score || score;
      
      return {
        id: q.id,
        text: q.text,
        selectedOption: getOptionLabel(score),
        score: score,
        emotion: questionStressAnalysis?.emotion || '',
        intensity: questionStressAnalysis?.intensity || 'Moderate',
        stressScore: stressScore,
        answerLabel: questionStressAnalysis?.answerLabel || getOptionLabel(score),
        domain: domain.name,
        aiAnalysis: questionStressAnalysis ? {
          score: questionStressAnalysis.enhanced?.score || questionStressAnalysis.score,
          emotion: questionStressAnalysis.enhanced?.tag || questionStressAnalysis.emotion,
          intensity: questionStressAnalysis.enhanced?.intensity || questionStressAnalysis.intensity
        } : null,
        customReason: responses[`${q.id}_customReason`] || '',
        tags: responses[`${q.id}_tags`] || [],
        isPositive: q.isPositive || q.positive || false
      };
    });

    // Set up deep dive data
    setDeepDiveDomain(domain.name);
    setDeepDiveFollowup({
      title: `Deep Dive: ${domain.name}`,
      followupIntro: "Thanks for sharing. Based on your responses, I'd like to explore this area further with you.",
      options: [],
      textboxPrompt: 'Share anything else?',
      rootEmotion: '',
      urgencyLevel: 'medium',
      suggestedTags: [],
      stressedQuestions: allQuestions,
      domainNeedsReview: true,
      sometimesCount: 0,
      totalAnswers: allQuestions.length
    });
    setShowDeepDive(true);
    setShowDomainInsight(false);
    setCurrentDomainInsight(null);
    return null;
  }

  // If stress level is Low, show the insight section
  if (
    showDomainInsight &&
    currentDomainInsight &&
    currentDomainInsight.stressLevel &&
    currentDomainInsight.stressLevel.toLowerCase() === "low"
  ) {
    return (
      <div className="min-h-screen bg-white pt-16 pb-6 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Domain Complete</h1>
              <p className="text-base text-gray-600">Here's what I noticed about your {currentDomainInsight.domain} responses</p>
          </div>

            <div className="mt-10 p-6 bg-indigo-50 rounded-xl shadow-sm space-y-4">
              <h3 className="text-xl font-semibold text-indigo-800 flex items-center">
                🧠 AI Insight: {currentDomainInsight.domain}
              </h3>
              
              <p className="text-base text-gray-700 leading-relaxed">
                {currentDomainInsight.insight}
              </p>

              <div className="text-sm mt-4 p-4 bg-white border rounded-lg shadow-sm">
                <p className="font-medium text-indigo-700 mb-2">AI Suggestions:</p>
                <ul className="list-disc list-inside text-indigo-700 space-y-1">
                  {currentDomainInsight.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
            </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-indigo-500 italic">
                  Stress Level: {currentDomainInsight.stressLevel}
            </div>
                <button
                  onClick={handleContinueFromInsight}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Continue
                </button>
          </div>
            </div>
          </div>
        </div>
      );
  }

  return (
    <>
      <div className="min-h-screen bg-white overflow-x-hidden px-4 sm:px-6 lg:px-16 pt-12">
        <div className="grid grid-cols-12 gap-8 max-w-screen-xl mx-auto">
          <div className="col-span-12 mb-6">
        {/* Enhanced Header */}
            <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-4">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Wellness Assessment</span>
            <Badge variant="secondary" className="ml-2">
              ~10 minutes
            </Badge>
                    </div>
              <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-3">
            How are you feeling today?
                      </h1>
              <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Take a few minutes to reflect on different aspects of your life. Your honest responses will help us provide personalized insights and recommendations.
                      </p>
            </div>
                    </div>

          <div className="col-span-12 mb-6">
        {/* Enhanced Progress Overview */}
            <Card className="shadow-sm border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">
                  Question {currentQuestionNumber} of {totalQuestions}
                </span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Your progress through the wellness assessment</p>
                  </TooltipContent>
                </Tooltip>
                  </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {Math.round(animatedProgress)}% Complete
                </span>
                <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  animatedProgress > 80 ? 'bg-green-500' :
                  animatedProgress > 50 ? 'bg-blue-500' :
                  animatedProgress > 25 ? 'bg-yellow-500' : 'bg-gray-300'
                }`}></div>
                    </div>
                  </div>
            <Progress 
              value={animatedProgress} 
              className="h-3 transition-all duration-500 ease-out" 
            />
            <div className="flex justify-between mt-2">
              {domains.map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index < currentDomain ? 'bg-green-500 scale-110' :
                    index === currentDomain ? 'bg-blue-500 scale-125' : 
                    'bg-gray-200'
                  }`}
                />
              ))}
                </div>
          </CardContent>
        </Card>
          </div>

          <div className="col-span-12 lg:col-span-8">
          {/* Main Survey Card */}
            <Card className={`shadow-lg border-0 transition-all duration-300 ${
              showQuestionTransition ? 'ring-2 ring-blue-200 shadow-xl' : ''
            }`}>
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${getColorClasses(domains[currentDomain]?.color || 'blue')}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                                          <CardTitle className="text-xl text-gray-900">
                      {domains[currentDomain]?.name || 'Domain'}
                    </CardTitle>
                      <Tooltip>
                        <TooltipTrigger>
                          <Lightbulb className="w-4 h-4 text-gray-400 hover:text-yellow-500 transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{domains[currentDomain]?.description || 'Domain description'}</p>
                        </TooltipContent>
                      </Tooltip>
                </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Question {currentQuestion + 1} of {domains[currentDomain]?.questions?.length || 0}
                    </p>
              </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* AI Insight Message */}
                {aiMessage && (
                  <motion.div
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    exit={false}
                    transition={{ duration: 0.15 }}
                    className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <Brain className="w-3 h-3 text-white" />
                      </div>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        {aiMessage}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* No Stressed Questions Detected */}
                {noStressedQuestions && (
                  <motion.div
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    exit={false}
                    transition={{ duration: 0.15 }}
                    className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 flex items-center space-x-3"
                  >
                    <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-sm text-green-700 font-medium">
                      No emotional concerns detected in this domain 🎉
                    </span>
                  </motion.div>
                )}

                {/* Personalization Message */}
                {personalizationMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100"
                  >
                    <p className="text-sm text-purple-800 leading-relaxed">
                      {personalizationMessage}
                    </p>
                  </motion.div>
                )}

                {/* Question */}
                <div>
                  <h2 className="text-lg lg:text-xl text-gray-900 mb-2 leading-relaxed">
                    {currentQ?.text}
                  </h2>
                  {currentQ?.subtitle && (
                    <p className="text-sm text-gray-600 mb-6 italic">
                      {currentQ.subtitle}
                    </p>
                  )}
                  
                  {/* Enhanced Answer Options */}
                  <div className="space-y-3">
                    {currentQ?.options.map((option, index) => (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleResponse(option.value)}
                            onMouseEnter={() => setHoveredOption(index)}
                            onMouseLeave={() => setHoveredOption(null)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md ${
                              responses[currentQ.id] === option.value
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 text-blue-900 shadow-md scale-[1.02]'
                                : hoveredOption === index
                                ? 'bg-gradient-to-r from-gray-50 to-blue-50 border-blue-200 text-gray-700 shadow-sm'
                                : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <span className="font-medium">{option.label}</span>
                                {(hoveredOption === index || responses[currentQ.id] === option.value) && option.description && (
                                  <div className="text-xs text-gray-600 mt-1 transition-all duration-200">
                                    {option.description}
                                  </div>
                                )}
                              </div>
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                responses[currentQ.id] === option.value
                                  ? 'bg-blue-600 border-blue-600 scale-110'
                                  : hoveredOption === index
                                  ? 'border-blue-400 scale-105'
                                  : 'border-gray-300'
                              }`}>
                                {responses[currentQ.id] === option.value && (
                                  <CheckCircle className="w-4 h-4 text-white" />
                                )}
                              </div>
                            </div>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{option.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                              </div>
                      </div>

                      {/* Enhanced Stress Analysis Indicator */}
                {stressAnalysis[currentQ?.id] && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Brain className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                                {/* Display enhanced tag if available, fallback to emotion */}
                                AI Analysis: {stressAnalysis[currentQ.id].enhanced?.tag || stressAnalysis[currentQ.id].emotion || 'Stress'}
                                {/* Show cause tag if available */}
                                {stressAnalysis[currentQ.id].enhanced?.causeTag && stressAnalysis[currentQ.id].enhanced.causeTag !== 'low_stress' && (
                                  <span className="text-xs text-blue-600 ml-2 px-2 py-1 bg-blue-100 rounded-full">
                                    {stressAnalysis[currentQ.id].enhanced.causeTag.replace('_', ' ')}
                                  </span>
                                )}
                              </span>
                            </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              // Use enhanced analysis data for accurate color coding
                              (() => {
                                const enhanced = stressAnalysis[currentQ.id].enhanced;
                                const score = enhanced?.score || stressAnalysis[currentQ.id].score || 0;
                                const intensity = enhanced?.intensity || stressAnalysis[currentQ.id].intensity;
                                const labelColor = enhanced?.labelColor;
                                
                                // Use enhanced labelColor if available, otherwise determine from score
                                if (labelColor === 'red' || score >= 8 || intensity === 'High') {
                                  return 'bg-red-100 text-red-700';
                                } else if (labelColor === 'yellow' || (score >= 5 && score < 8) || intensity === 'Moderate') {
                                  return 'bg-yellow-100 text-yellow-700';
                                } else {
                                  return 'bg-green-100 text-green-700';
                                }
                              })()
                            }`}>
                              {/* Display proper stress level based on score */}
                              {(() => {
                                const enhanced = stressAnalysis[currentQ.id].enhanced;
                                const score = enhanced?.score || stressAnalysis[currentQ.id].score || 0;
                                const intensity = enhanced?.intensity || stressAnalysis[currentQ.id].intensity;
                                
                                if (score >= 8 || intensity === 'High') return 'High Stress';
                                if (score >= 5 || intensity === 'Moderate') return 'Moderate Stress';
                                return 'Low Stress';
                              })()}
                            </div>
                          </div>
                    <div className="text-xs text-blue-600">
                            Stress Score: {stressAnalysis[currentQ.id].enhanced?.score || stressAnalysis[currentQ.id].score || 0}/10
                          </div>
                        </motion.div>
                      )}

                      {/* Loading Stress Analysis */}
                {isAnalyzingStress && responses[currentQ?.id] !== undefined && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center space-x-3"
                        >
                          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-600">
                            Analyzing your response...
                          </span>
                        </motion.div>
                      )}

                {/* Enhanced Navigation */}
                <div className="flex items-center justify-between pt-6">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    disabled={currentQuestion === 0 && currentDomain === 0}
                    className="flex items-center space-x-2 hover:bg-gray-50 transition-all duration-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </Button>
                  
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>Press Enter to continue</span>
                  </div>
                  
                  <Button
                    onClick={handleNext}
                    disabled={responses[currentQ?.id] === undefined}
                    className={`flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 ${
                      responses[currentQ?.id] !== undefined 
                        ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl' 
                        : ''
                    }`}
                  >
                    <span>
                      {currentDomain === domains.length - 1 && currentQuestion === domains[currentDomain].questions.length - 1
                        ? 'Complete Assessment'
                        : 'Next Question'
                      }
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {stressAnalysis[currentQ.id] && (
                  <div className="mt-2 text-sm text-gray-500">
                    Emotion: {stressAnalysis[currentQ.id].enhancedEmotion || stressAnalysis[currentQ.id].enhanced?.tag || stressAnalysis[currentQ.id].emotion} |
                    Intensity: {stressAnalysis[currentQ.id].enhancedIntensity || stressAnalysis[currentQ.id].enhanced?.intensity || stressAnalysis[currentQ.id].intensity} |
                    Score: {stressAnalysis[currentQ.id].enhancedScore || stressAnalysis[currentQ.id].enhanced?.score || stressAnalysis[currentQ.id].score} |
                    Reason: {stressAnalysis[currentQ.id].reason || stressAnalysis[currentQ.id].enhanced?.reason}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="col-span-12 lg:col-span-4">
            {/* Assessment Progress Block */}
            <div className="space-y-4">
            {/* Domain Progress */}
              <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  Assessment Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {domains.map((domain, index) => {
                  const DomainIcon = domain.icon;
                  const isActive = index === currentDomain;
                  const isComplete = index < currentDomain;
                  const isPending = index > currentDomain;
                  
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border transition-all duration-300 hover:shadow-sm ${
                        isActive 
                          ? `border-2 ${getColorClasses(domain.color, 'light')} shadow-sm` 
                          : isComplete 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          isActive 
                            ? getColorClasses(domain.color)
                            : isComplete 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {isComplete ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <DomainIcon className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${
                            isActive 
                              ? domain.color === 'blue' ? 'text-blue-700' :
                                domain.color === 'rose' ? 'text-rose-700' :
                                domain.color === 'emerald' ? 'text-emerald-700' :
                                domain.color === 'amber' ? 'text-amber-700' :
                                'text-violet-700'
                              : isComplete 
                              ? 'text-green-700' 
                              : 'text-gray-600'
                          }`}>
                            {domain.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {isComplete ? 'Complete' : isActive ? 'In Progress' : 'Pending'}
                          </div>
                        </div>
                        {isActive && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Quick Stats */}
              <Card className="shadow-md border-0">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-semibold text-blue-600">
                      {Object.keys(responses).length}
                  </div>
                    <div className="text-xs text-blue-700">Completed</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-gray-600">
                      {totalQuestions - Object.keys(responses).length}
                </div>
                    <div className="text-xs text-gray-700">Remaining</div>
                    </div>
                  </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>

      {/* Deep Dive Followup: Show when high stress is detected and deepDiveData exists */}
      {(() => {
        // Find the current question object
        const questionObj = domains[currentDomain]?.questions[currentQuestion];
        const questionId = questionObj?.id;
        const stress = stressAnalysis[questionId];
        const stressScore = stress?.enhanced?.score ?? stress?.score ?? 0;
        const deepDive = deepDiveData && deepDiveData.causes && deepDiveData.suggestions;
        // Only show if high stress and deepDiveData is not empty
        if (stressScore >= 7 && deepDive && deepDiveData.causes.length && deepDiveData.suggestions.length) {
          return (
            <DeepDiveFollowup
              domain={domains[currentDomain].name}
              question={questionObj.text}
              answer={responses[questionId]}
              stressScore={stressScore}
              emotion={stress?.enhancedEmotion || stress?.enhanced?.tag || stress?.emotion}
              intensity={stress?.enhancedIntensity || stress?.enhanced?.intensity || stress?.intensity}
              causes={deepDiveData.causes}
              suggestions={deepDiveData.suggestions}
            />
          );
        }
        return null;
      })()}
    </>
  );
};

export default WellnessSurvey;