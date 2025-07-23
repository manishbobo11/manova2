import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

const client = new OpenAIClient(
  process.env.AZURE_OPENAI_ENDPOINT,
  new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY)
);

const deploymentName = process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  const { messages } = req.body;

  // Validate input
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Invalid messages format" });
  }

  try {
    const response = await client.getChatCompletions(deploymentName, messages, {
      temperature: 0.8,
    });

    const reply = response.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (err) {
    console.error("GPT Error:", err);
    res.status(500).json({ error: "Failed to get GPT response" });
  }
} 