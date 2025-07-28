# Environment Setup Guide for Manova

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

### Azure OpenAI Configuration
```bash
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name
```

### Pinecone Configuration
```bash
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=your_pinecone_environment_here
PINECONE_INDEX_NAME=manova-emotions
```

### Firebase Configuration (if using)
```bash
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

### Vector API Configuration
```bash
VITE_VECTOR_API_BASE_URL=http://localhost:8001/api/vector
```

## Important Notes

1. **PINECONE_ENVIRONMENT**: This is required for the Pinecone client to work properly. The error "The client configuration must have required property: environment" occurs when this is missing.

2. **Azure OpenAI Content Filter**: The AI responses may trigger content management policies. The prompts have been updated to be more compliant.

3. **Server Restart**: After updating environment variables, restart your development server.

## Troubleshooting

### Vector Store Errors
- Ensure `PINECONE_ENVIRONMENT` is set correctly
- Check that `PINECONE_API_KEY` is valid
- Verify the index name exists in your Pinecone console

### Azure OpenAI Errors
- Check API key and endpoint configuration
- Ensure deployment name is correct
- Monitor content filter triggers in Azure console

## Example .env file
```bash
# Copy this to .env and fill in your values
AZURE_OPENAI_API_KEY=sk-...
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX_NAME=manova-emotions
VITE_VECTOR_API_BASE_URL=http://localhost:8001/api/vector
``` 