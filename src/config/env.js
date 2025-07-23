// Environment configuration for Manova
// This file safely handles environment variables for both development and production

const config = {
  // OpenAI Configuration
  OPENAI_API_KEY: process.env?.OPENAI_API_KEY || '',
  
  // Azure OpenAI Configuration
  AZURE_OPENAI_API_KEY: process.env?.AZURE_OPENAI_API_KEY || '',
  AZURE_OPENAI_API_INSTANCE_NAME: process.env?.AZURE_OPENAI_API_INSTANCE_NAME || '',
  AZURE_OPENAI_API_DEPLOYMENT_NAME: process.env?.AZURE_OPENAI_API_DEPLOYMENT_NAME || 'gpt-4o',
  AZURE_OPENAI_API_VERSION: process.env?.AZURE_OPENAI_API_VERSION || '2024-12-01-preview',
  
  // Pinecone Configuration
  PINECONE_ENVIRONMENT: process.env?.PINECONE_ENVIRONMENT || 'us-east-1-aws',
  PINECONE_API_KEY: process.env?.PINECONE_API_KEY || '',
  PINECONE_INDEX_NAME: process.env?.PINECONE_INDEX_NAME || 'manova-emotions',
  
  // Check if required services are configured
  isOpenAIConfigured: () => {
    return !!(config.OPENAI_API_KEY || config.AZURE_OPENAI_API_KEY);
  },
  
  isAzureOpenAIConfigured: () => {
    return !!(config.AZURE_OPENAI_API_KEY && config.AZURE_OPENAI_API_INSTANCE_NAME);
  },
  
  isPineconeConfigured: () => {
    return !!(config.PINECONE_API_KEY && config.PINECONE_INDEX_NAME);
  },
  
  // Get configuration status
  getConfigStatus: () => {
    return {
      openai: config.isOpenAIConfigured(),
      azureOpenAI: config.isAzureOpenAIConfigured(),
      pinecone: config.isPineconeConfigured(),
      hasAnyService: config.isOpenAIConfigured() || config.isPineconeConfigured()
    };
  }
};

export default config; 