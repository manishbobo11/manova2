// Frontend-safe Azure configuration
// These values should be set in your .env file and exposed via Vite's import.meta.env

export const AZURE_CONFIG = {
  // Embedding deployment name - set this in your .env file
  EMBEDDING_DEPLOYMENT_NAME: import.meta.env.VITE_AZURE_EMBEDDING_DEPLOYMENT_NAME || "text-embedding-ada-002",
  
  // OpenAI API configuration
  OPENAI_KEY: import.meta.env.VITE_AZURE_OPENAI_KEY,
  OPENAI_ENDPOINT: import.meta.env.VITE_AZURE_OPENAI_ENDPOINT,
  OPENAI_API_VERSION: import.meta.env.VITE_AZURE_OPENAI_API_VERSION || "2024-12-01-preview",
  OPENAI_DEPLOYMENT_NAME: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o"
};

// Helper function to ensure endpoint is properly formatted
export const getFormattedEndpoint = (endpoint) => {
  if (!endpoint) return null;
  
  // Remove trailing slash if present
  let formatted = endpoint.replace(/\/$/, '');
  
  // Ensure it starts with https://
  if (!formatted.startsWith('https://')) {
    formatted = `https://${formatted}`;
  }
  
  return formatted;
};

// Validation function to check if required config is present
export const validateAzureConfig = () => {
  const missing = [];
  
  if (!AZURE_CONFIG.OPENAI_KEY) missing.push('VITE_AZURE_OPENAI_KEY');
  if (!AZURE_CONFIG.OPENAI_ENDPOINT) missing.push('VITE_AZURE_OPENAI_ENDPOINT');
  if (!AZURE_CONFIG.EMBEDDING_DEPLOYMENT_NAME) missing.push('VITE_AZURE_EMBEDDING_DEPLOYMENT_NAME');
  
  if (missing.length > 0) {
    console.error('Missing required Azure configuration:', missing.join(', '));
    return false;
  }
  
  return true;
}; 