import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Add node-fetch for making HTTP requests
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// System prompt for analysis
const systemPrompt = `You are an AI assistant that analyzes user responses across different life domains.
Analyze the provided responses and determine:
1. The primary domain of concern (work, personal, financial, health, or identity)
2. The stress level (normal, moderate, or extreme)
3. A brief summary of the situation

Return the analysis in the following JSON format:
{
  "concernDomain": "work" | "personal" | "financial" | "health" | "identity",
  "stressLevel": "normal" | "moderate" | "extreme",
  "summary": "short text"
}`;

// POST /api/analyze endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const userResponses = req.body;

    // Call Azure OpenAI API
    const completion = await fetch(
      `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.AZURE_OPENAI_KEY,
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(userResponses) }
          ],
          response_format: { type: 'json_object' }
        }),
      }
    );

    const data = await completion.json();
    if (!completion.ok) {
      console.error('Azure OpenAI error:', data);
      return res.status(500).json({ error: data.error || data });
    }
    res.json(data.choices[0].message.content);
  } catch (error) {
    // Improved error logging
    if (error.response) {
      console.error('Azure OpenAI API error:', error.response.status, error.response.data);
      res.status(500).json({ error: error.response.data.error.message });
    } else {
      console.error('Error analyzing responses:', error.message || error);
      res.status(500).json({ error: error.message || 'Failed to analyze responses' });
    }
  }
});

// ✅ LIVE DEPLOYMENT DETAILS
const AZURE_OPENAI_KEY = "6Teijvr6VDdNQ9WT6f1JdHVdqhfuTkyrLeRDbsa5K7DcwiwKkdeWJQQJ99BEACYeBjFXJ3w3AAABACOGYB7D";
const AZURE_OPENAI_ENDPOINT = "https://manova.openai.azure.com/";
const AZURE_OPENAI_DEPLOYMENT_NAME = "gpt-4o"; // ✅ confirmed
const AZURE_OPENAI_API_VERSION = "2024-12-01-preview";

// Route to call Azure OpenAI GPT
app.post('/api/openai-chat', async (req, res) => {
  const { prompt } = req.body;

  // Defensive validation
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Invalid prompt. Please provide a non-empty string.' });
  }

  try {
    const endpoint = `${AZURE_OPENAI_ENDPOINT}openai/deployments/${AZURE_OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=${AZURE_OPENAI_API_VERSION}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_OPENAI_KEY,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a kind and empathetic mental wellness assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Azure OpenAI error:', data);
      return res.status(500).json({ error: data.error && data.error.message ? data.error.message : 'Unknown error from Azure OpenAI' });
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message || typeof data.choices[0].message.content !== 'string') {
      return res.status(500).json({ error: 'Invalid response from Azure OpenAI' });
    }

    res.json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).json({ error: 'Something went wrong with Azure OpenAI request' });
  }
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
}); 