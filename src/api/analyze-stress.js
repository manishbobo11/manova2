import dotenv from 'dotenv';
dotenv.config();

import { AzureChatOpenAI } from "@langchain/azure-openai";
// import { Pinecone } from "@pinecone-database/pinecone"; // Optional

export async function analyzeStressAPI(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const { question, answer, emotion } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: question and answer are required'
      });
    }

    // Setup config (use env or fallback)
    const azureKey = process.env.AZURE_OPENAI_KEY || "6Teijvr6VDdNQ9WT6f1JdHVdqhfuTkyrLeRDbsa5K7DcwiwKkdeWJQQJ99BEACYeBjFXJ3w3AAABACOGYB7D";
    const azureEndpoint = process.env.AZURE_OPENAI_API_ENDPOINT || "https://manova.openai.azure.com/";
    const azureDeployment = process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME || "gpt-4o";
    const azureVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview";

    const model = new AzureChatOpenAI({
      azureOpenAIApiKey: azureKey,
      azureOpenAIApiDeploymentName: azureDeployment,
      azureOpenAIApiInstanceName: "Manova",
      azureOpenAIApiVersion: azureVersion,
      azureOpenAIEndpoint: azureEndpoint,
      temperature: 0.5
    });

    const prompt = `You are an expert mental wellness AI assistant.

Analyze the user's stress from the following input:

Question: "${question}"
Answer: "${answer}"
Emotion: "${emotion || 'Not specified'}"

Strictly respond with a JSON object using this format (no explanation, no extra text):
{
  "stress_level": "Low" | "Moderate" | "High",
  "reason": "string",
  "confidence": "Low" | "Medium" | "High"
}`;

    const aiResponse = await model.invoke([
      { role: 'system', content: 'You are an expert AI psychologist. Always respond in strict JSON only.' },
      { role: 'user', content: prompt }
    ]);

    let analysisResult;
    try {
      analysisResult = JSON.parse(aiResponse.content);
    } catch (e) {
      console.warn('⚠️ Fallback JSON used');
      console.warn('Raw AI Response:', aiResponse.content); // log for debugging
      analysisResult = {
        stress_level: "Low",
        reason: "Unable to parse AI response.",
        confidence: "Low"
      };
    }

    return res.status(200).json({
      success: true,
      data: analysisResult
    });

  } catch (error) {
    console.error('🔥 AI Analysis Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error during stress analysis'
    });
  }
}

export default analyzeStressAPI; 