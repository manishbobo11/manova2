import dotenv from 'dotenv';
import { Pinecone } from '@pinecone-database/pinecone';

dotenv.config();

const createIndex = async () => {
  try {
    const apiKey = process.env.PINECONE_API_KEY;
    const indexName = 'manova-emotions'; // You can change this if needed
    const dimension = 1536; // Adjust if your embedding size is different

    const pinecone = new Pinecone({ apiKey });
    console.log('🔧 Pinecone client created');

    // Check if index already exists
    const indexesResult = await pinecone.listIndexes();
    const indexes = Array.isArray(indexesResult) ? indexesResult : indexesResult.indexes;
    console.log('📋 Indexes:', indexes);
    if (indexes && indexes.includes(indexName)) {
      console.log(`✅ Index '${indexName}' already exists.`);
      return;
    }

    // Create the index (latest argument structure)
    console.log(`🚀 Creating index '${indexName}'...`);
    await pinecone.createIndex({
      name: indexName,
      dimension,
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1',
        },
      },
    });
    console.log(`🎉 Index '${indexName}' created successfully!`);
  } catch (err) {
    console.error('❌ Error creating index:', err.message);
    console.error(err);
  }
};

createIndex(); 