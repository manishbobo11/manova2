import { ChatOpenAI } from "langchain/chat_models/azure_openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

  const { domain, stressSignals, userNote } = req.body;

  const model = new ChatOpenAI({
    azureOpenAIApiKey: "6Teijvr6VDdNQ9WT6f1JdHVdqhfuTkyrLeRDbsa5K7DcwiwKkdeWJQQJ99BEACYeBjFXJ3w3AAABACOGYB7D",
    azureOpenAIApiDeploymentName: "gpt-4o",
    azureOpenAIApiInstanceName: "Manova",
    azureOpenAIApiVersion: "2024-12-01-preview",
    temperature: 0.7,
  });

  const template = `
You are a compassionate mental wellness therapist helping a user in the "{domain}" area. 
They expressed signs of stress related to: {stressSignals}
User's own note: "{userNote}"

Based on this, provide an empathetic and actionable response with:
1. Validation of their emotions
2. Key insight about what's likely causing the stress
3. Personalized guidance for how to handle this
`;

  const prompt = new PromptTemplate({
    template,
    inputVariables: ["domain", "stressSignals", "userNote"],
  });

  const chain = new LLMChain({ llm: model, prompt });

  try {
    const response = await chain.call({ domain, stressSignals, userNote });
    res.status(200).json({ therapistAdvice: response.text });
  } catch (error) {
    console.error('Error generating therapist advice:', error);
    res.status(500).json({ error: 'Failed to generate therapist advice' });
  }
} 