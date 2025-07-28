import dotenv from 'dotenv';
import { Pinecone } from '@pinecone-database/pinecone';

dotenv.config();

const testSimple = async () => {
  try {
    console.log('🧪 Testing simple Pinecone initialization...');
    const apiKey = process.env.PINECONE_API_KEY;
    console.log('API Key available:', !!apiKey);
    
    // Try the most basic initialization
    const pc = new Pinecone({
      apiKey: apiKey,
      environment: process.env.PINECONE_ENVIRONMENT
    });
    
    console.log('✅ Pinecone client initialized successfully');
    console.log('Client type:', typeof pc);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
};

testSimple();