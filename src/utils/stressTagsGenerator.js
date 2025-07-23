/**
 * Generate stress contributor suggestions based on user answers
 * @param {Array} stressedAnswers - Array of objects with answer property
 * @returns {Array} Array of stress contributor suggestions
 */
export function generateStressContributors(stressedAnswers) {
  if (!stressedAnswers || stressedAnswers.length === 0) {
    return [];
  }

  // Common stress contributors based on typical survey responses
  const commonStressContributors = [
    'Feeling overworked or stretched thin',
    'Struggling with unclear expectations',
    'Not feeling appreciated or recognized',
    'Trouble disconnecting after work',
    'Fear of disappointing others',
    'Lack of support from colleagues or management',
    'Difficulty maintaining work-life balance',
    'Concerns about job security or career growth',
    'Communication challenges with team',
    'Technology or system-related stress',
    'Too many meetings or interruptions',
    'Perfectionism or high self-expectations',
    'Time management difficulties',
    'Unclear role or responsibilities',
    'Challenging workplace culture'
  ];

  // Analyze answers to determine relevant stress contributors
  const relevantContributors = [];
  
  stressedAnswers.forEach(({ answer }) => {
    const answerLower = answer.toLowerCase();
    
    // Map answer patterns to stress contributors
    if (answerLower.includes('often') || answerLower.includes('very often') || answerLower.includes('always')) {
      relevantContributors.push('Feeling overworked or stretched thin');
    }
    
    if (answerLower.includes('not satisfied') || answerLower.includes('dissatisfied') || answerLower.includes('poor')) {
      relevantContributors.push('Not feeling appreciated or recognized');
    }
    
    if (answerLower.includes('stress') || answerLower.includes('overwhelmed') || answerLower.includes('drained')) {
      relevantContributors.push('Difficulty maintaining work-life balance');
    }
    
    if (answerLower.includes('unsure') || answerLower.includes('unclear') || answerLower.includes('confused')) {
      relevantContributors.push('Struggling with unclear expectations');
    }
    
    if (answerLower.includes('alone') || answerLower.includes('isolated') || answerLower.includes('unsupported')) {
      relevantContributors.push('Lack of support from colleagues or management');
    }
    
    if (answerLower.includes('fear') || answerLower.includes('worried') || answerLower.includes('anxious')) {
      relevantContributors.push('Fear of disappointing others');
    }
    
    if (answerLower.includes('perfection') || answerLower.includes('perfect') || answerLower.includes('high standards')) {
      relevantContributors.push('Perfectionism or high self-expectations');
    }
    
    if (answerLower.includes('time') || answerLower.includes('busy') || answerLower.includes('rushed')) {
      relevantContributors.push('Time management difficulties');
    }
  });

  // Remove duplicates and return unique contributors
  const uniqueContributors = [...new Set(relevantContributors)];
  
  // If no specific contributors found, return some general ones
  if (uniqueContributors.length === 0) {
    return commonStressContributors.slice(0, 5);
  }
  
  // Return up to 5 most relevant contributors
  return uniqueContributors.slice(0, 5);
}

/**
 * Generate dynamic stress contributors from high-stress questions
 * @param {Array} highStressQuestions - Array of questions with high stress responses
 * @param {string} domainName - The domain name for context
 * @returns {Array} Array of dynamically generated stress contributor options
 */
export function generateDynamicStressContributors(highStressQuestions, domainName) {
  if (!highStressQuestions || highStressQuestions.length === 0) {
    return [];
  }

  const dynamicContributors = [];

  highStressQuestions.forEach((question, index) => {
    const questionText = question.text || question.questionText || '';
    const answerText = question.answerLabel || question.selectedOption || question.answerText || '';
    const emotion = question.emotion || '';
    const stressScore = question.stressScore || question.aiAnalysis?.score || 0;

    // Skip if not high stress (score >= 8)
    if (stressScore < 8) {
      return;
    }

    // Generate contributor based on question content and answer
    const contributor = generateContributorFromQuestion(questionText, answerText, emotion, domainName);
    
    if (contributor) {
      dynamicContributors.push({
        value: `contributor_${index}`,
        label: contributor,
        questionId: question.id,
        questionText: questionText,
        answerText: answerText,
        emotion: emotion,
        stressScore: stressScore
      });
    }
  });

  // Remove duplicates based on label
  const uniqueContributors = dynamicContributors.filter((contributor, index, self) => 
    index === self.findIndex(c => c.label === contributor.label)
  );

  // Return up to 5 most relevant contributors
  return uniqueContributors.slice(0, 5);
}

/**
 * Generate a specific stress contributor label from a question and answer
 * @param {string} questionText - The question text
 * @param {string} answerText - The user's answer
 * @param {string} emotion - Detected emotion
 * @param {string} domainName - The domain name
 * @returns {string} Generated stress contributor label
 */
function generateContributorFromQuestion(questionText, answerText, emotion, domainName) {
  const questionLower = questionText.toLowerCase();
  const answerLower = answerText.toLowerCase();
  const emotionLower = emotion.toLowerCase();

  // Domain-specific patterns
  const patterns = {
    'Work & Career': {
      'emotionally drained': 'Feeling emotionally exhausted or burned out',
      'overwhelmed': 'Feeling overwhelmed by workload or responsibilities',
      'not satisfied': 'Not feeling satisfied with work environment',
      'not supported': 'Lack of support from colleagues or management',
      'unclear': 'Unclear expectations or role responsibilities',
      'work-life': 'Difficulty maintaining work-life balance',
      'appreciated': 'Not feeling appreciated for your contributions',
      'recognized': 'Lack of recognition for your efforts',
      'micromanaged': 'Feeling micromanaged or overly controlled',
      'toxic': 'Challenging or toxic workplace environment',
      'burnout': 'Experiencing burnout or extreme fatigue',
      'stress': 'High levels of work-related stress',
      'pressure': 'Feeling pressured or under high expectations',
      'meetings': 'Too many meetings or interruptions',
      'technology': 'Technology or system-related frustrations',
      'communication': 'Communication challenges with team',
      'perfectionism': 'Perfectionism or unrealistic self-expectations',
      'time management': 'Time management difficulties',
      'job security': 'Concerns about job security or career growth',
      'disconnecting': 'Trouble disconnecting from work'
    },
    'Personal Life': {
      'relationship': 'Relationship challenges or conflicts',
      'family': 'Family-related stress or conflicts',
      'lonely': 'Feeling lonely or socially isolated',
      'boundaries': 'Difficulty setting healthy boundaries',
      'personal time': 'Lack of personal time or space',
      'trust': 'Trust issues or feeling betrayed',
      'misunderstood': 'Feeling misunderstood by others',
      'pressure': 'Pressure from family or friends',
      'support': 'Lack of support network',
      'identity': 'Personal identity or self-worth struggles',
      'transitions': 'Life transitions or changes',
      'overwhelm': 'Emotional overwhelm in personal life',
      'self-care': 'Difficulty with self-care practices',
      'social': 'Social anxiety or discomfort',
      'communication': 'Communication problems in relationships'
    },
    'Financial Stress': {
      'money': 'Financial worries or money stress',
      'debt': 'Debt concerns or financial obligations',
      'expenses': 'Unexpected expenses or financial pressure',
      'paycheck': 'Living paycheck to paycheck',
      'savings': 'Insufficient savings or emergency funds',
      'cost of living': 'High cost of living stress',
      'medical': 'Medical or healthcare expenses',
      'student loan': 'Student loan debt stress',
      'credit card': 'Credit card debt concerns',
      'housing': 'Housing costs or rent stress',
      'retirement': 'Retirement planning anxiety',
      'uncertainty': 'Financial uncertainty or instability',
      'lifestyle': 'Pressure to maintain lifestyle',
      'family financial': 'Family financial responsibilities',
      'investment': 'Investment or financial planning stress'
    },
    'Health': {
      'sleep': 'Sleep problems or insomnia',
      'fatigue': 'Chronic fatigue or low energy',
      'physical': 'Physical symptoms of stress',
      'exercise': 'Lack of exercise or physical activity',
      'nutrition': 'Poor nutrition or eating habits',
      'medical': 'Medical concerns or health anxiety',
      'mental health': 'Mental health challenges',
      'pain': 'Chronic pain or physical discomfort',
      'energy': 'Low energy levels or exhaustion',
      'stress-related': 'Stress-related health issues',
      'relaxing': 'Difficulty relaxing or unwinding',
      'tension': 'Physical tension or muscle tightness',
      'health anxiety': 'Health anxiety or medical worries',
      'lifestyle': 'Lifestyle balance challenges',
      'self-care': 'Self-care or wellness difficulties'
    },
    'Self-Worth & Identity': {
      'self-doubt': 'Self-doubt or lack of confidence',
      'imposter': 'Imposter syndrome or feeling inadequate',
      'comparison': 'Comparing yourself to others',
      'perfectionism': 'Perfectionism or unrealistic standards',
      'failure': 'Fear of failure or making mistakes',
      'identity': 'Identity confusion or uncertainty',
      'confidence': 'Lack of confidence or self-esteem',
      'inadequate': 'Feeling inadequate or not good enough',
      'self-criticism': 'Self-criticism or negative self-talk',
      'values': 'Unclear personal values or direction',
      'self-compassion': 'Difficulty with self-compassion',
      'validation': 'Dependency on external validation',
      'career identity': 'Career identity or purpose struggles',
      'growth': 'Personal growth or development challenges',
      'authenticity': 'Authenticity or being true to yourself'
    }
  };

  // Get domain-specific patterns
  const domainPatterns = patterns[domainName] || patterns['Work & Career'];

  // Check for specific patterns in question and answer
  for (const [keyword, contributor] of Object.entries(domainPatterns)) {
    if (questionLower.includes(keyword) || answerLower.includes(keyword)) {
      return contributor;
    }
  }

  // Check for emotion-based patterns
  const emotionPatterns = {
    'overwhelmed': 'Feeling overwhelmed by current circumstances',
    'anxious': 'Experiencing anxiety or worry',
    'stressed': 'High levels of stress or pressure',
    'frustrated': 'Feeling frustrated or irritated',
    'sad': 'Feeling sad or down',
    'angry': 'Feeling angry or upset',
    'fear': 'Experiencing fear or worry',
    'hopeless': 'Feeling hopeless or discouraged',
    'worthless': 'Feeling worthless or inadequate',
    'lonely': 'Feeling lonely or isolated'
  };

  for (const [emotionKey, contributor] of Object.entries(emotionPatterns)) {
    if (emotionLower.includes(emotionKey)) {
      return contributor;
    }
  }

  // Check for answer intensity patterns
  if (answerLower.includes('very often') || answerLower.includes('always')) {
    return 'Frequent or persistent stress in this area';
  }
  
  if (answerLower.includes('often') || answerLower.includes('sometimes')) {
    return 'Regular stress or concern in this area';
  }

  if (answerLower.includes('not at all') || answerLower.includes('never')) {
    return 'Lack of positive experiences in this area';
  }

  // Fallback: generate based on question content
  if (questionLower.includes('how often')) {
    return 'Frequency of stress or negative experiences';
  }
  
  if (questionLower.includes('how satisfied')) {
    return 'Dissatisfaction with current situation';
  }
  
  if (questionLower.includes('how well')) {
    return 'Difficulty with specific skills or areas';
  }

  // Final fallback
  return 'Stress or concern in this area of life';
}

/**
 * Generate stress factors based on question text and domain
 * @param {string} questionText - The question text
 * @param {string} domainName - The domain name
 * @returns {Promise<Array>} Array of stress factors
 */
export async function generateStressFactors(questionText, domainName) {
  if (!questionText || !domainName) {
    return [];
  }

  // Domain-specific stress factors
  const domainStressFactors = {
    'Work & Career': [
      'Feeling overworked or stretched thin',
      'Struggling with unclear expectations',
      'Not feeling appreciated or recognized',
      'Trouble disconnecting after work',
      'Fear of disappointing others',
      'Lack of support from colleagues or management',
      'Difficulty maintaining work-life balance',
      'Concerns about job security or career growth',
      'Communication challenges with team',
      'Technology or system-related stress',
      'Too many meetings or interruptions',
      'Perfectionism or high self-expectations',
      'Time management difficulties',
      'Unclear role or responsibilities',
      'Challenging workplace culture'
    ],
    'Personal Life': [
      'Relationship challenges',
      'Family conflicts or stress',
      'Social isolation or loneliness',
      'Difficulty setting boundaries',
      'Lack of personal time',
      'Emotional exhaustion',
      'Trust issues',
      'Communication problems',
      'Feeling misunderstood',
      'Pressure from others',
      'Lack of support network',
      'Personal identity struggles',
      'Life transitions',
      'Emotional overwhelm',
      'Difficulty with self-care'
    ],
    'Financial Stress': [
      'Living paycheck to paycheck',
      'Debt concerns',
      'Unexpected expenses',
      'Job insecurity',
      'Insufficient savings',
      'High cost of living',
      'Medical expenses',
      'Student loan debt',
      'Credit card debt',
      'Housing costs',
      'Retirement planning stress',
      'Financial uncertainty',
      'Pressure to maintain lifestyle',
      'Family financial responsibilities',
      'Investment anxiety'
    ],
    'Health': [
      'Sleep problems',
      'Chronic fatigue',
      'Physical symptoms of stress',
      'Lack of exercise',
      'Poor nutrition habits',
      'Medical concerns',
      'Mental health challenges',
      'Chronic pain',
      'Energy levels',
      'Stress-related illness',
      'Difficulty relaxing',
      'Physical tension',
      'Health anxiety',
      'Lifestyle balance',
      'Self-care challenges'
    ],
    'Self-Worth & Identity': [
      'Self-doubt and insecurity',
      'Imposter syndrome',
      'Comparison to others',
      'Perfectionism',
      'Fear of failure',
      'Identity confusion',
      'Lack of confidence',
      'Feeling inadequate',
      'Self-criticism',
      'Unclear personal values',
      'Difficulty with self-compassion',
      'External validation dependency',
      'Career identity struggles',
      'Personal growth challenges',
      'Authenticity concerns'
    ]
  };

  // Get domain-specific factors
  const domainFactors = domainStressFactors[domainName] || domainStressFactors['Work & Career'];
  
  // Analyze question text to find relevant factors
  const questionLower = questionText.toLowerCase();
  const relevantFactors = [];
  
  // Simple keyword matching to find relevant stress factors
  domainFactors.forEach(factor => {
    const factorLower = factor.toLowerCase();
    
    // Check if question text contains keywords from the stress factor
    const factorKeywords = factorLower.split(' ').filter(word => word.length > 3);
    
    const hasMatchingKeywords = factorKeywords.some(keyword => 
      questionLower.includes(keyword)
    );
    
    if (hasMatchingKeywords) {
      relevantFactors.push(factor);
    }
  });

  // If no specific factors found, return some general ones for the domain
  if (relevantFactors.length === 0) {
    return domainFactors.slice(0, 5);
  }
  
  // Return up to 5 most relevant factors
  return relevantFactors.slice(0, 5);
}

/**
 * Test function to verify dynamic stress contributor generation
 * @returns {Object} Test results
 */
export function testDynamicStressContributors() {
  console.log('🧪 Testing Dynamic Stress Contributors...');
  
  // Test case 1: Work & Career domain
  const workQuestions = [
    {
      text: "How often do you feel emotionally drained by work?",
      answerLabel: "Very Often",
      emotion: "overwhelmed",
      stressScore: 9,
      aiAnalysis: { score: 9 }
    },
    {
      text: "Do you feel your efforts are recognized at work?",
      answerLabel: "Not at all",
      emotion: "frustrated",
      stressScore: 8,
      aiAnalysis: { score: 8 }
    }
  ];
  
  const workContributors = generateDynamicStressContributors(workQuestions, 'Work & Career');
  console.log('✅ Work & Career contributors:', workContributors);
  
  // Test case 2: Personal Life domain
  const personalQuestions = [
    {
      text: "How often do you feel lonely or isolated?",
      answerLabel: "Often",
      emotion: "sad",
      stressScore: 8,
      aiAnalysis: { score: 8 }
    }
  ];
  
  const personalContributors = generateDynamicStressContributors(personalQuestions, 'Personal Life');
  console.log('✅ Personal Life contributors:', personalContributors);
  
  // Test case 3: Financial Stress domain
  const financialQuestions = [
    {
      text: "How worried are you about your financial situation?",
      answerLabel: "Very worried",
      emotion: "anxious",
      stressScore: 9,
      aiAnalysis: { score: 9 }
    }
  ];
  
  const financialContributors = generateDynamicStressContributors(financialQuestions, 'Financial Stress');
  console.log('✅ Financial Stress contributors:', financialContributors);
  
  // Test case 4: Low stress questions (should be filtered out)
  const lowStressQuestions = [
    {
      text: "How satisfied are you with your work?",
      answerLabel: "Very satisfied",
      emotion: "happy",
      stressScore: 2,
      aiAnalysis: { score: 2 }
    }
  ];
  
  const lowStressContributors = generateDynamicStressContributors(lowStressQuestions, 'Work & Career');
  console.log('✅ Low stress contributors (should be empty):', lowStressContributors);
  
  return {
    workContributors,
    personalContributors,
    financialContributors,
    lowStressContributors,
    success: workContributors.length > 0 && personalContributors.length > 0 && financialContributors.length > 0 && lowStressContributors.length === 0
  };
}

/**
 * Run all tests for stress tags generator
 */
export function runStressTagsGeneratorTests() {
  console.log('🚀 Running Stress Tags Generator Tests...');
  
  try {
    const results = testDynamicStressContributors();
    
    if (results.success) {
      console.log('✅ All tests passed!');
    } else {
      console.log('❌ Some tests failed');
    }
    
    return results;
  } catch (error) {
    console.error('❌ Test error:', error);
    return { success: false, error: error.message };
  }
} 