import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Environment Variables Test:');
console.log('PINECONE_API_KEY:', process.env.PINECONE_API_KEY ? '✅ Set' : '❌ Not set');
console.log('PINECONE_ENVIRONMENT:', process.env.PINECONE_ENVIRONMENT ? '✅ Set' : '❌ Not set');
console.log('PINECONE_INDEX_NAME:', process.env.PINECONE_INDEX_NAME ? '✅ Set' : '❌ Not set');

if (process.env.PINECONE_API_KEY) {
  console.log('API Key prefix:', process.env.PINECONE_API_KEY.substring(0, 10) + '...');
}
if (process.env.PINECONE_ENVIRONMENT) {
  console.log('Environment:', process.env.PINECONE_ENVIRONMENT);
}
if (process.env.PINECONE_INDEX_NAME) {
  console.log('Index Name:', process.env.PINECONE_INDEX_NAME);
} 