import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import dotenv from "dotenv";

dotenv.config();

const model = new ChatOpenAI({
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIApiDeploymentName: process.env.DEPLOYMENT_NAME,
  azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_ENDPOINT,
  temperature: 0.5,
});

const stressPrompt = new PromptTemplate({
  template: `You are a therapist assistant. Analyze the following answer:

Question: {question}
Answer: {answer}
Emotion: {emotion}

Is the user showing signs of stress? Reply with a JSON:
{{
  "stress_level": "High/Moderate/Low",
  "reason": "Explain in 1-2 lines"
}}`,
  inputVariables: ["question", "answer", "emotion"],
});

const chain = new LLMChain({ llm: model, prompt: stressPrompt });

export const getStressLevel = async ({ question, answer, emotion }) => {
  const res = await chain.call({ question, answer, emotion });
  return res.text;
};

// Improved utility to clean and parse LLM JSON output
export function cleanAndParseEnhancedResponse(responseText) {
  try {
    // Remove code block markers if present
    const cleaned = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    const parsed = JSON.parse(cleaned);
    console.log("🧠 Parsed enhanced stress analysis:", {
      score: parsed.enhancedScore || parsed.stress_level,
      emotion: parsed.enhancedEmotion || parsed.stress_level
    });
    return parsed;
  } catch (error) {
    console.error("❌ Failed to parse LLM response as JSON:", error);
    return {
      enhancedScore: 5,
      enhancedEmotion: "Unknown",
      enhancedIntensity: "Moderate",
      causeTag: "fallback_due_to_parse_error",
      reason: "Parse error"
    };
  }
}

// Enhanced Stress Detection Logic for Manova
// Uses only the LLM (getStressLevel) for stress detection
export async function analyzeStress(questionText, userAnswer) {
  try {
    const llmResult = await getStressLevel({ question: questionText, answer: userAnswer, emotion: "" });
    const parsed = cleanAndParseEnhancedResponse(llmResult);
    let score = 4;
    if (parsed.stress_level === "High") score = 8;
    else if (parsed.stress_level === "Moderate") score = 5;
    else if (parsed.stress_level === "Low") score = 2;
    return {
      enhancedScore: parsed.enhancedScore || score,
      enhancedEmotion: parsed.stress_level || parsed.enhancedEmotion || "Unclear",
      enhancedIntensity: score >= 8 ? "High" : score >= 5 ? "Moderate" : "Low",
      causeTag: parsed.causeTag || "llm",
      reason: parsed.reason || ""
    };
  } catch (e) {
    // If LLM fails, return generic fallback
    return {
      enhancedScore: 4,
      enhancedEmotion: "Unclear",
      enhancedIntensity: "Moderate",
      causeTag: "fallback",
      reason: "LLM call failed"
    };
  }
}

// Claude Command: Generate personalized causes + solutions
export async function generateDeepDiveFollowUp(responseText, domain, stressTag) {
  const prompt = `
You are a mental wellness assistant helping users reflect on their stress.

User shared this in the domain of "${domain}":
---
"${responseText}"
---

They were flagged as "${stressTag}" stress level.

Now:
1. List top 3 possible causes of stress from this message.
2. Give 3 personalized, practical suggestions to help them improve that domain.
Respond in this JSON format:

{
  "causes": ["...", "...", "..."],
  "suggestions": ["...", "...", "..."]
}
`;

  try {
    const completion = await callClaude(prompt); // Replace with your Claude API call
    const cleaned = completion.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn("⚠️ Deep dive generation failed, using fallback");
    return {
      causes: ["Unable to determine cause"],
      suggestions: [
        "Consider journaling your feelings",
        "Try speaking to a therapist",
        "Practice mindfulness or relaxation techniques"
      ]
    };
  }
} 