// Client-side vector store service - now using direct Pinecone integration
import { upsertUserVector } from '../../utils/vectorStore';
import { getEmbeddingFromAzure } from '../../utils/embeddingService';

export const saveSurveyToVectorDB = async ({ userId, domain, text }) => {
  try {
    console.log('📝 Saving to vector DB:', { userId, domain, text });
    
    // Generate embedding using our new embedding service
    const embedding = await getEmbeddingFromAzure(text);
    
    // Prepare metadata
    const metadata = {
      timestamp: new Date().toISOString(),
      domain: domain,
      text: text,
      type: 'survey_response'
    };
    
    // Store in Pinecone using our new vector store
    const result = await upsertUserVector(userId, embedding, metadata);
    
    console.log('✅ Vector DB save result:', result);
    return { message: '✅ Saved to Pinecone', result };
    
  } catch (error) {
    console.warn('Vector upsert failed, fallback used', error);
    return { success: false, error: error.message };
  }
}; 