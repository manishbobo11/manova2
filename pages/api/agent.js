import { runManovaAgent } from "../../src/services/ai/manovaAgent";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  const { messages, userId, context } = req.body;

  // Validate input
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Invalid messages format" });
  }

  try {
    const output = await runManovaAgent({ 
      messages, 
      userId: userId || "anonymous", 
      context: context || {} 
    });
    
    res.status(200).json({ reply: output });
  } catch (error) {
    console.error("Agent Error:", error);
    res.status(500).json({ 
      error: "Failed to get agent response",
      details: error.message 
    });
  }
} 