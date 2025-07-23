import dotenv from 'dotenv';
import { Pinecone } from '@pinecone-database/pinecone';

dotenv.config();

const listIndexes = async () => {
  try {
    const apiKey = process.env.PINECONE_API_KEY;
    const environment = process.env.PINECONE_ENVIRONMENT;
    console.log('🔑 API Key:', apiKey ? apiKey.substring(0, 10) + '...' : '❌ Not set');
    console.log('🌎 Environment:', environment);

    if (!apiKey || !environment) {
      console.error('❌ Missing Pinecone API key or environment');
      return;
    }

    const pinecone = new Pinecone({ apiKey, environment });
    console.log('🔧 Pinecone client created');

    const indexes = await pinecone.listIndexes();
    console.log('📋 Indexes:', indexes);
  } catch (err) {
    console.error('❌ Error listing indexes:', err.message);
    console.error(err);
  }
};

listIndexes(); 