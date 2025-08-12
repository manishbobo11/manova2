export const toolDefinitions = [
  {
    name: "fetch_checkins",
    description: "Fetch user's wellness check-in history and calculate averages",
    parameters: {
      type: "object",
      properties: {
        userId: {
          type: "string",
          description: "User identifier"
        },
        days: {
          type: "number",
          description: "Number of days to look back (default: 30)",
          default: 30
        }
      },
      required: ["userId"]
    },
    returns: {
      type: "object",
      properties: {
        avgWellness: {
          type: "number",
          description: "Average wellness score over the period"
        },
        stressDomains: {
          type: "array",
          items: {
            type: "object",
            properties: {
              domain: {
                type: "string",
                description: "Stress domain name (e.g., 'work', 'relationships', 'health')"
              },
              score: {
                type: "number",
                description: "Average stress score for this domain"
              }
            }
          },
          description: "Array of stress domains with their average scores"
        },
        lastCheckinDate: {
          type: "string",
          description: "Date of the most recent check-in (ISO format)"
        }
      }
    }
  },
  {
    name: "suggest_micro_habits",
    description: "Suggest micro-habits for a specific wellness domain",
    parameters: {
      type: "object",
      properties: {
        domain: {
          type: "string",
          description: "Wellness domain (e.g., 'sleep', 'exercise', 'mindfulness', 'social', 'nutrition')",
          enum: ["sleep", "exercise", "mindfulness", "social", "nutrition", "work", "relationships"]
        }
      },
      required: ["domain"]
    },
    returns: {
      type: "array",
      items: {
        type: "string"
      },
      description: "Array of suggested micro-habits for the domain"
    }
  },
  {
    name: "create_action_plan",
    description: "Create a structured action plan for a specific goal",
    parameters: {
      type: "object",
      properties: {
        goal: {
          type: "string",
          description: "The goal to create an action plan for"
        },
        horizon: {
          type: "string",
          description: "Time horizon for the plan",
          enum: ["today", "week"]
        }
      },
      required: ["goal", "horizon"]
    },
    returns: {
      type: "object",
      properties: {
        steps: {
          type: "array",
          items: {
            type: "string"
          },
          description: "Ordered list of actionable steps"
        },
        timebox: {
          type: "array",
          items: {
            type: "string"
          },
          description: "Suggested time allocations for each step"
        }
      }
    }
  },
  {
    name: "lookup_resources",
    description: "Find relevant wellness resources for a specific topic",
    parameters: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description: "Topic to search for resources (e.g., 'anxiety', 'sleep hygiene', 'stress management')"
        },
        locale: {
          type: "string",
          description: "Language/locale for resources (e.g., 'en', 'hi', 'es')",
          default: "en"
        }
      },
      required: ["topic"]
    },
    returns: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Resource title"
          },
          url: {
            type: "string",
            description: "Resource URL"
          },
          type: {
            type: "string",
            description: "Resource type (e.g., 'article', 'video', 'exercise', 'meditation')",
            enum: ["article", "video", "exercise", "meditation", "tool", "community"]
          },
          description: {
            type: "string",
            description: "Brief description of the resource"
          }
        }
      },
      description: "Array of relevant resources for the topic"
    }
  }
];

// Type definitions for better TypeScript support
export interface CheckinData {
  avgWellness: number;
  stressDomains: Array<{
    domain: string;
    score: number;
  }>;
  lastCheckinDate: string;
}

export interface ActionPlan {
  steps: string[];
  timebox: string[];
}

export interface Resource {
  title: string;
  url: string;
  type: 'article' | 'video' | 'exercise' | 'meditation' | 'tool' | 'community';
  description: string;
}

// Tool function signatures
export type FetchCheckinsFunction = (userId: string, days?: number) => Promise<CheckinData>;
export type SuggestMicroHabitsFunction = (domain: string) => Promise<string[]>;
export type CreateActionPlanFunction = (goal: string, horizon: 'today' | 'week') => Promise<ActionPlan>;
export type LookupResourcesFunction = (topic: string, locale?: string) => Promise<Resource[]>;

// Tool registry
export interface ToolRegistry {
  fetch_checkins: FetchCheckinsFunction;
  suggest_micro_habits: SuggestMicroHabitsFunction;
  create_action_plan: CreateActionPlanFunction;
  lookup_resources: LookupResourcesFunction;
}
