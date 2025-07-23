# Environment Setup Guide

## Azure Configuration

The Azure configuration is now hardcoded in `src/config/config.js` for development:

```js
export const AZURE_CONFIG = {
  DEPLOYMENT_NAME: "text-embedding-3-small",
  ENDPOINT: "https://manova.openai.azure.com/",
  API_VERSION: "2024-12-01-preview",
  API_KEY: "6Teijvr6VDdNQ9WT6f1JdHVdqhfuTkyrLeRDbsa5K7DcwiwKkdeWJQQJ99BEACYeBjFXJ3w3AAABACOGYB7D",
  CHAT_DEPLOYMENT_NAME: "gpt-4o"
};
```

**Note**: In production, you should move these values to environment variables.

## Backend Server Setup

The backend server is configured with your Pinecone credentials. You can optionally create a `.env` file in your project root to override these defaults:

```env
# Pinecone Configuration for Vector Storage
PINECONE_API_KEY=pcsk_2mEsDs_CxvhYsZbQbS1LWBCUjgF2Hkub9Wjr3bXXHPEaeuvqSgbDM6YjqbSPyS3aFPeD7C
PINECONE_ENVIRONMENT=aped-4627-b74a
PINECONE_INDEX_NAME=manova-memory
PINECONE_CONTROLLER_HOST_URL=https://manova-memory-fqtq9bo.svc.aped-4627-b74a.pinecone.io
```

### Pinecone Configuration Status

✅ **Configured with your credentials**:
- **API Key**: `pcsk_2mEsDs_CxvhYsZbQbS1LWBCUjgF2Hkub9Wjr3bXXHPEaeuvqSgbDM6YjqbSPyS3aFPeD7C`
- **Environment**: `aped-4627-b74a`
- **Index Name**: `manova-memory`
- **Controller URL**: `https://manova-memory-fqtq9bo.svc.aped-4627-b74a.pinecone.io`

The backend server will use these credentials by default. No additional setup required!

## Quick Test

The configuration is now ready to use:

1. **Install dependencies**: `npm install`
2. **Start the backend server**: `npm run server` (in one terminal)
3. **Start the frontend**: `npm run dev` (in another terminal)
4. **Open browser console** and run: `window.testAllManovaFixes()`
5. **Check the results** - all tests should pass

**Note**: The backend is now configured with your Pinecone credentials and should work immediately!

## How to Get Azure OpenAI Credentials

1. **Go to Azure Portal**: https://portal.azure.com
2. **Find your OpenAI resource** or create one
3. **Get the API Key**:
   - Go to "Keys and Endpoint" in your resource
   - Copy "Key 1" or "Key 2"
4. **Get the Endpoint**:
   - Copy the "Endpoint" URL
5. **Check Deployment Names**:
   - Go to "Model deployments"
   - Note the exact names of your deployments
   - Make sure you have both a chat model (like gpt-4o) and an embedding model

## Common Issues Fixed

### 1. "API deployment for this resource does not exist"
- **Solution**: Check your deployment names in Azure Portal
- **Fix**: Update the deployment name in `src/config/config.js`

### 2. "Enhanced stress analysis failed: 500"
- **Solution**: The API endpoint is now fixed and should work
- **Check**: Make sure your backend server is running

### 3. "Vector upsert 404"
- **Solution**: The `/api/vector/upsert` endpoint is now implemented
- **Check**: Make sure your backend server is running on port 8001

## Testing

After setting up your environment variables:

1. **Restart your development server**
2. **Test in browser console**: `window.testManovaFixes()`
3. **Check the network tab** for any remaining errors

## Fallback Behavior

The system now includes graceful fallbacks:
- If Azure embedding fails → Uses deterministic fallback embedding
- If stress analysis fails → Uses intelligent fallback analysis
- If vector storage fails → Continues survey flow with warning

This ensures your survey system continues working even if some services are unavailable. 