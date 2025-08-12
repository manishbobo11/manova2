interface CriticChecklist {
  isEmpathetic: boolean;
  hasConcreteSteps: boolean;
  isLanguageConsistent: boolean;
  hasMedicalClaims: boolean;
}

interface CriticResult {
  passed: boolean;
  issues: string[];
  revisedResponse?: string;
}

/**
 * Main critic function that validates responses
 */
export async function criticCheck(response: string, context: {
  intent: string;
  userLanguage: string;
  originalMessage: string;
}): Promise<CriticResult> {
  
  // Run checklist
  const checklist = await runChecklist(response, context);
  
  // Check if any criteria failed
  const failedChecks = Object.entries(checklist)
    .filter(([key, value]) => !value)
    .map(([key]) => key);
  
  if (failedChecks.length === 0) {
    return {
      passed: true,
      issues: []
    };
  }
  
  // Request revision if any checks failed
  const revisedResponse = await requestRevision(response, failedChecks, context);
  
  return {
    passed: false,
    issues: failedChecks,
    revisedResponse
  };
}

/**
 * Runs the validation checklist
 */
async function runChecklist(response: string, context: {
  intent: string;
  userLanguage: string;
  originalMessage: string;
}): Promise<CriticChecklist> {
  
  const checklist: CriticChecklist = {
    isEmpathetic: false,
    hasConcreteSteps: false,
    isLanguageConsistent: false,
    hasMedicalClaims: false
  };
  
  // Check 1: Is it empathetic?
  checklist.isEmpathetic = checkEmpathy(response);
  
  // Check 2: Are there concrete steps?
  checklist.hasConcreteSteps = checkConcreteSteps(response);
  
  // Check 3: Is language consistent?
  checklist.isLanguageConsistent = checkLanguageConsistency(response, context.userLanguage);
  
  // Check 4: Any medical/clinical claims? (should be false - we want to avoid these)
  checklist.hasMedicalClaims = checkMedicalClaims(response);
  
  return checklist;
}

/**
 * Checks if response shows empathy
 */
function checkEmpathy(response: string): boolean {
  const empatheticPhrases = [
    'i hear you',
    'i understand',
    'i know how',
    'it\'s normal',
    'it\'s okay',
    'you\'re not alone',
    'i\'m here',
    'i care',
    'your feelings',
    'completely normal',
    'valid',
    'challenging',
    'overwhelming',
    'difficult',
    'struggling',
    'मैं सुन रहा हूं',
    'मैं समझता हूं',
    'यह सामान्य है',
    'आप अकेले नहीं हैं',
    'आपकी भावनाएं'
  ];
  
  const lowerResponse = response.toLowerCase();
  return empatheticPhrases.some(phrase => lowerResponse.includes(phrase));
}

/**
 * Checks if response contains concrete, actionable steps
 */
function checkConcreteSteps(response: string): boolean {
  // Look for bullet points, numbered lists, or action-oriented language
  const stepIndicators = [
    '•',
    '-',
    '*',
    '1.',
    '2.',
    '3.',
    'take',
    'do',
    'try',
    'start',
    'begin',
    'practice',
    'call',
    'write',
    'breathe',
    'walk',
    'meditate',
    'exercise',
    'reach out',
    'लें',
    'करें',
    'शुरू करें',
    'प्रयास करें',
    'कॉल करें',
    'लिखें'
  ];
  
  const lowerResponse = response.toLowerCase();
  return stepIndicators.some(indicator => lowerResponse.includes(indicator));
}

/**
 * Checks if language is consistent with user's language
 */
function checkLanguageConsistency(response: string, userLanguage: string): boolean {
  if (userLanguage === 'en') {
    // Check if response is primarily English
    const englishWords = response.toLowerCase().match(/\b[a-z]+\b/g) || [];
    const nonEnglishChars = response.match(/[^\x00-\x7F]/g) || [];
    return nonEnglishChars.length < englishWords.length * 0.3;
  }
  
  if (userLanguage === 'hi') {
    // Check if response contains Hindi characters
    const hindiChars = response.match(/[\u0900-\u097F]/g) || [];
    return hindiChars.length > 5; // At least 5 Hindi characters
  }
  
  // For other languages, assume consistency if no obvious language mixing
  return true;
}

/**
 * Checks if response contains medical/clinical claims (should be avoided)
 */
function checkMedicalClaims(response: string): boolean {
  const medicalTerms = [
    'diagnosis',
    'treatment',
    'therapy',
    'medication',
    'prescription',
    'doctor',
    'psychiatrist',
    'psychologist',
    'clinical',
    'medical',
    'cure',
    'heal',
    'fix',
    'solve',
    'treat',
    'diagnose',
    'disorder',
    'condition',
    'symptom',
    'syndrome',
    'निदान',
    'उपचार',
    'दवा',
    'डॉक्टर',
    'चिकित्सा',
    'इलाज',
    'रोग',
    'लक्षण'
  ];
  
  const lowerResponse = response.toLowerCase();
  return medicalTerms.some(term => lowerResponse.includes(term));
}

/**
 * Requests a revision from the AI model
 */
async function requestRevision(
  originalResponse: string, 
  failedChecks: string[], 
  context: {
    intent: string;
    userLanguage: string;
    originalMessage: string;
  }
): Promise<string> {
  
  const issues = failedChecks.map(check => {
    switch (check) {
      case 'isEmpathetic':
        return 'Add empathetic language (e.g., "I hear you", "I understand")';
      case 'hasConcreteSteps':
        return 'Include specific, actionable steps with bullet points';
      case 'isLanguageConsistent':
        return `Ensure response is in ${context.userLanguage === 'hi' ? 'Hindi' : 'English'}`;
      case 'hasMedicalClaims':
        return 'Remove any medical/clinical claims or diagnostic language';
      default:
        return 'Improve overall response quality';
    }
  }).join(', ');
  
  const prompt = `Revise this response to address these issues: ${issues}

Original response:
"${originalResponse}"

User message: "${context.originalMessage}"
Intent: ${context.intent}
Language: ${context.userLanguage}

Provide a concise revision that:
- Maintains the same structure and length
- Addresses all the issues mentioned
- Keeps the warm, supportive tone
- Avoids medical/clinical language`;

  try {
    // TODO: Replace with actual AI model call
    // const revision = await callAIModel(prompt);
    // return revision;
    
    // Placeholder revision logic
    return generatePlaceholderRevision(originalResponse, failedChecks, context);
    
  } catch (error) {
    console.error('Revision request failed:', error);
    return originalResponse; // Return original if revision fails
  }
}

/**
 * Generates a placeholder revision (replace with actual AI model)
 */
function generatePlaceholderRevision(
  originalResponse: string,
  failedChecks: string[],
  context: { intent: string; userLanguage: string; originalMessage: string }
): string {
  
  let revised = originalResponse;
  
  // Add empathy if missing
  if (failedChecks.includes('isEmpathetic')) {
    const empatheticStart = context.userLanguage === 'hi' 
      ? 'मैं आपकी बात सुन रहा हूं, और '
      : 'I hear you, and ';
    revised = empatheticStart + revised.toLowerCase();
  }
  
  // Add concrete steps if missing
  if (failedChecks.includes('hasConcreteSteps')) {
    const steps = context.userLanguage === 'hi'
      ? '\n\n• 3 गहरी सांसें लें\n• कुछ अच्छा सोचें\n• किसी से बात करें'
      : '\n\n• Take 3 deep breaths\n• Think of something positive\n• Talk to someone';
    revised += steps;
  }
  
  // Remove medical claims if present
  if (failedChecks.includes('hasMedicalClaims')) {
    const medicalTerms = ['diagnosis', 'treatment', 'therapy', 'medical', 'clinical'];
    medicalTerms.forEach(term => {
      revised = revised.replace(new RegExp(term, 'gi'), 'support');
    });
  }
  
  return revised;
}

/**
 * Quick validation function for testing
 */
export function quickValidate(response: string): {
  empathy: boolean;
  steps: boolean;
  medical: boolean;
} {
  return {
    empathy: checkEmpathy(response),
    steps: checkConcreteSteps(response),
    medical: checkMedicalClaims(response)
  };
}
