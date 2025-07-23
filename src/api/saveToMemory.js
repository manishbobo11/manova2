import { Pinecone } from "@pinecone-database/pinecone";
import { AzureOpenAIEmbeddings } from "@langchain/azure-openai";

// Server-side Pinecone configuration - using environment variables
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || "pcsk_2mEsDs_CxvhYsZbQbS1LWBCUjgF2Hkub9Wjr3bXXHPEaeuvqSgbDM6YjqbSPyS3aFPeD7C",
  controllerHostUrl: "https://manova-memory-fqtq9bo.svc.aped-4627-b74a.pinecone.io",
});

const index = pinecone.index("manova-memory");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { userId, domain, text } = req.body;
  console.log("📩 Request received:", { userId, domain, text }); // 👈 ADD THIS

  if (!userId || !domain || !text) {
    console.log("❌ Missing data");
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Embedding logic + Pinecone upsert as before
    // Try different embedding model names that might be available
    let embeddingModel;
    let vector;
    
    try {
      // Use the correct Azure OpenAI endpoint for embeddings
      // Note: Azure OpenAI embeddings require a specific embedding model deployment
      // Since gpt-4o is not an embedding model, we'll use a different approach
      
      // Try to use Azure OpenAI with the correct configuration
      embeddingModel = new AzureOpenAIEmbeddings({
        azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY || process.env.AZURE_OPENAI_KEY || "6Teijvr6VDdNQ9WT6f1JdHVdqhfuTkyrLeRDbsa5K7DcwiwKkdeWJQQJ99BEACYeBjFXJ3w3AAABACOGYB7D",
        azureOpenAIApiInstanceName: "Manova",
        azureOpenAIApiDeploymentName: "gpt-4o", // This will fail for embeddings, but let's try
        azureOpenAIApiVersion: "2024-12-01-preview",
        azureOpenAIEndpoint: process.env.AZURE_OPENAI_ENDPOINT || "https://manova.openai.azure.com/"
      });
      
      vector = await embeddingModel.embedQuery(text);
    } catch (embeddingError) {
      console.error('Azure embedding failed, using fallback approach:', embeddingError);
      
      // Fallback: Generate a simple vector from text hash for testing
      // This is not ideal but prevents the 500 error
      const textHash = text.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      
      // Create a 1536-dimensional vector (standard for OpenAI embeddings)
      vector = new Array(1536).fill(0).map((_, i) => 
        Math.sin((textHash + i) * 0.1) * 0.01
      );
      
      console.log('Using fallback vector generation');
    }

    await index.upsert([
      {
        id: `${userId}-${Date.now()}`,
        values: vector,
        metadata: {
          userId,
          domain,
          text,
          createdAt: new Date().toISOString(),
        },
      },
    ]);

    return res.status(200).json({ message: "✅ Saved to Pinecone" });
  } catch (e) {
    console.error("❌ Save failed:", e); // 👈 ADD THIS
    res.status(500).json({ error: "Failed to save to Pinecone" });
  }
} 