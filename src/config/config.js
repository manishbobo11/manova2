// Frontend configuration constants for Manova mental wellness platform
// These values are hardcoded for development - in production, use environment variables

export const AZURE_CONFIG = {
  // Azure OpenAI Configuration
  DEPLOYMENT_NAME: "text-embedding-3-small",
  ENDPOINT: "https://manova.openai.azure.com/",
  API_VERSION: "2024-12-01-preview",
  API_KEY: "6Teijvr6VDdNQ9WT6f1JdHVdqhfuTkyrLeRDbsa5K7DcwiwKkdeWJQQJ99BEACYeBjFXJ3w3AAABACOGYB7D",
  
  // Chat model deployment
  CHAT_DEPLOYMENT_NAME: "gpt-4o"
};

// Backward compatibility exports
export const AZURE_DEPLOYMENT_NAME = AZURE_CONFIG.DEPLOYMENT_NAME;
export const AZURE_ENDPOINT = AZURE_CONFIG.ENDPOINT;
export const AZURE_API_VERSION = AZURE_CONFIG.API_VERSION;
export const AZURE_API_KEY = AZURE_CONFIG.API_KEY;

// Validation function
export const validateAzureConfig = () => {
  const required = [
    AZURE_CONFIG.DEPLOYMENT_NAME,
    AZURE_CONFIG.ENDPOINT,
    AZURE_CONFIG.API_VERSION,
    AZURE_CONFIG.API_KEY
  ];
  
  const missing = required.filter(value => !value);
  
  if (missing.length > 0) {
    console.error('Missing Azure configuration values:', missing);
    return false;
  }
  
  return true;
}; 