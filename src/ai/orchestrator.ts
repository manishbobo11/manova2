import { classifyIntent, IntentClassification } from './intentRouter';
import { toolDefinitions, ToolRegistry } from './tools';

interface Plan {
  intent: string;
  toolNeeded: boolean;
  toolName?: string;
  toolArgs?: any;
  context: any;
  strategy: string;
}

interface OrchestratorContext {
  userId: string;
  userLanguage: string;
  wellnessHistory?: any;
  currentStressLevel?: number;
  preferences?: any;
}

interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

interface ReplyContext {
  intent: IntentClassification;
  toolResult?: ToolResult;
  context: OrchestratorContext;
  userMessage: string;
  chatHistory: Array<{role: string, content: string}>;
}

/**
 * Main orchestrator function that manages the complete Sarthi response flow
 */
export async function orchestrateResponse(
  userMessage: string,
  chatHistory: Array<{role: string, content: string}>,
  context: OrchestratorContext
): Promise<string> {
  try {
    // Step 1: Classify intent
    const intent = await classifyIntent(userMessage, chatHistory);
    
    // Step 2: Create response plan
    const plan = await createPlan({
      intent,
      userMessage,
      chatHistory,
      context
    });
    
    // Step 3: Execute tool if needed
    let toolResult: ToolResult | undefined;
    if (plan.toolNeeded && plan.toolName) {
      toolResult = await callTool(plan.toolName, plan.toolArgs);
    }
    
    // Step 4: Compose final reply
    const final = await composeReply({
      intent,
      toolResult,
      context: {
        ...context,
        plan,
        userMessage,
        chatHistory
      }
    });
    
    // Step 5: Safety check
    const safe = await criticCheck(final);
    
    return safe;
    
  } catch (error) {
    console.error('Orchestrator error:', error);
    return "I'm having trouble processing that right now. Could you try rephrasing or let me know if you need immediate support?";
  }
}

/**
 * Creates a response plan based on intent and context
 */
async function createPlan(params: {
  intent: IntentClassification;
  userMessage: string;
  chatHistory: Array<{role: string, content: string}>;
  context: OrchestratorContext;
}): Promise<Plan> {
  const { intent, userMessage, context } = params;
  
  // Determine if tools are needed based on intent
  let toolNeeded = false;
  let toolName: string | undefined;
  let toolArgs: any = {};
  let strategy = '';
  
  switch (intent.intent) {
    case 'therapy_support':
      strategy = 'empathetic_validation';
      // Check if we need user history for personalized support
      if (userMessage.toLowerCase().includes('stress') || userMessage.toLowerCase().includes('anxiety')) {
        toolNeeded = true;
        toolName = 'fetch_checkins';
        toolArgs = { userId: context.userId, days: 7 };
      }
      break;
      
    case 'quick_tip':
      strategy = 'practical_advice';
      // Suggest micro-habits for common wellness domains
      if (userMessage.toLowerCase().includes('sleep') || userMessage.toLowerCase().includes('exercise')) {
        toolNeeded = true;
        toolName = 'suggest_micro_habits';
        toolArgs = { domain: extractDomain(userMessage) };
      }
      break;
      
    case 'plan_builder':
      strategy = 'structured_planning';
      toolNeeded = true;
      toolName = 'create_action_plan';
      toolArgs = { 
        goal: extractGoal(userMessage),
        horizon: extractHorizon(userMessage)
      };
      break;
      
    case 'crisis':
      strategy = 'crisis_intervention';
      // No tools needed for crisis - immediate response required
      break;
      
    case 'small_talk':
      strategy = 'casual_conversation';
      break;
      
    default:
      strategy = 'general_support';
  }
  
  return {
    intent: intent.intent,
    toolNeeded,
    toolName,
    toolArgs,
    context,
    strategy
  };
}

/**
 * Calls the specified tool with arguments
 */
async function callTool(toolName: string, args: any): Promise<ToolResult> {
  try {
    // TODO: Implement actual tool calls
    // This is a placeholder - replace with your actual tool implementations
    
    switch (toolName) {
      case 'fetch_checkins':
        // return await fetchCheckins(args.userId, args.days);
        return { success: true, data: { avgWellness: 7.2, stressDomains: [] } };
        
      case 'suggest_micro_habits':
        // return await suggestMicroHabits(args.domain);
        return { success: true, data: ['Take 3 deep breaths', 'Drink water'] };
        
      case 'create_action_plan':
        // return await createActionPlan(args.goal, args.horizon);
        return { success: true, data: { steps: ['Step 1'], timebox: ['10 min'] } };
        
      case 'lookup_resources':
        // return await lookupResources(args.topic, args.locale);
        return { success: true, data: [{ title: 'Resource', url: '#' }] };
        
      default:
        return { success: false, error: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Tool execution failed' };
  }
}

/**
 * Composes the final reply based on intent, tool results, and context
 */
async function composeReply(context: ReplyContext): Promise<string> {
  const { intent, toolResult, context: orchestratorContext } = context;
  
  // TODO: Implement AI model call to generate response
  // This should use the system prompt from system.sarthi.ts
  
  const prompt = `You are Sarthi. Generate a warm, solution-oriented response.

Intent: ${intent.intent}
Confidence: ${intent.confidence}
Language: ${intent.language}
${toolResult ? `Tool Result: ${JSON.stringify(toolResult.data)}` : ''}

User Message: ${context.userMessage}

Respond in ${intent.language} with:
- 1-2 sentences validation
- 2-5 actionable bullet points
- Optional motivational nudge
- Keep under 180 words`;

  // Placeholder response generation
  // Replace with actual AI model call
  return generatePlaceholderResponse(intent.intent, toolResult);
}

/**
 * Safety check for the final response
 */
async function criticCheck(response: string): Promise<string> {
  // TODO: Implement safety checks
  // - Check for harmful content
  // - Validate crisis response
  // - Ensure appropriate tone
  
  const crisisKeywords = ['suicide', 'self-harm', 'kill myself', 'end it all'];
  const hasCrisisContent = crisisKeywords.some(keyword => 
    response.toLowerCase().includes(keyword)
  );
  
  if (hasCrisisContent) {
    return `I'm concerned about what you're sharing. Please know you're not alone. For immediate support, call KIRAN at 1800-599-0019. This is a 24/7 crisis helpline. Your life matters, and there are people who want to help you.`;
  }
  
  return response;
}

// Helper functions
function extractDomain(message: string): string {
  const domains = ['sleep', 'exercise', 'mindfulness', 'social', 'nutrition', 'work', 'relationships'];
  const found = domains.find(domain => message.toLowerCase().includes(domain));
  return found || 'mindfulness';
}

function extractGoal(message: string): string {
  // Simple goal extraction - could be enhanced with NLP
  return message.length > 50 ? message.substring(0, 50) + '...' : message;
}

function extractHorizon(message: string): 'today' | 'week' {
  if (message.toLowerCase().includes('today') || message.toLowerCase().includes('now')) {
    return 'today';
  }
  return 'week';
}

function generatePlaceholderResponse(intent: string, toolResult?: ToolResult): string {
  const responses = {
    therapy_support: "I hear you, and it's completely normal to feel this way. Here are some gentle steps to help:\n• Take 3 deep breaths right now\n• Write down one thing you're grateful for\n• Reach out to someone you trust\n\nYou're doing better than you think. Want me to break this into a day plan?",
    quick_tip: "Great question! Here's a quick tip:\n• Start with just 2 minutes\n• Make it enjoyable\n• Track your progress\n\nSmall steps lead to big changes!",
    plan_builder: "Let's create a plan together:\n• Break it into smaller steps\n• Set specific times\n• Celebrate small wins\n\nYou've got this!",
    crisis: "I'm here with you right now. Please know you're not alone. For immediate support, call KIRAN at 1800-599-0019. This is a 24/7 crisis helpline.",
    small_talk: "It's nice to chat with you! How are you feeling today?"
  };
  
  return responses[intent as keyof typeof responses] || responses.therapy_support;
}
