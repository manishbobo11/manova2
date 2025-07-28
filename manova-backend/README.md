# Manova Backend

A Node.js backend API server for the Manova wellness application, designed for deployment on Render.

## Features

- Vector storage and querying with Pinecone
- CORS enabled for Vercel frontend
- Health check endpoint
- Environment-based configuration
- Production-ready setup

## Quick Start

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp env.example .env
```

3. Fill in your environment variables in `.env`

4. Start the development server:
```bash
npm run dev
```

### Production Deployment on Render

1. **Connect your repository** to Render
2. **Create a new Web Service** using the `render.yaml` configuration
3. **Set environment variables** in Render dashboard:
   - `PINECONE_API_KEY`
   - `PINECONE_ENVIRONMENT`
   - `PINECONE_INDEX_NAME`
   - `AZURE_OPENAI_API_KEY` (if using Azure)
   - `AZURE_OPENAI_ENDPOINT` (if using Azure)
   - `AZURE_OPENAI_DEPLOYMENT_NAME` (if using Azure)
   - `AZURE_OPENAI_API_VERSION` (if using Azure)
   - `FIREBASE_PROJECT_ID` (if using Firebase)
   - `FIREBASE_PRIVATE_KEY` (if using Firebase)
   - `FIREBASE_CLIENT_EMAIL` (if using Firebase)

4. **Deploy** - Render will automatically build and deploy your service

## API Endpoints

### Health Check
- `GET /health` - Service health status

### Vector Operations
- `POST /api/vector/upsert` - Store vector embeddings
- `POST /api/vector/query` - Query similar vectors

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5174) | No |
| `NODE_ENV` | Environment (production/development) | No |
| `PINECONE_API_KEY` | Pinecone API key | Yes |
| `PINECONE_ENVIRONMENT` | Pinecone environment | Yes |
| `PINECONE_INDEX_NAME` | Pinecone index name | Yes |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key | No |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint | No |
| `AZURE_OPENAI_DEPLOYMENT_NAME` | Azure OpenAI deployment name | No |
| `AZURE_OPENAI_API_VERSION` | Azure OpenAI API version | No |

## CORS Configuration

The backend is configured to accept requests from:
- `https://manova.vercel.app`
- `https://manova-git-main.vercel.app`
- `https://manova-git-develop.vercel.app`
- `http://localhost:3000`
- `http://localhost:5173`
- `http://localhost:5174`

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests (placeholder)

## Deployment Notes

- The service runs on port 5174 by default
- Render will automatically assign a public URL
- Environment variables marked as `sync: false` in `render.yaml` need to be set manually in Render dashboard
- The service includes health checks for monitoring

## Troubleshooting

1. **Check logs** in Render dashboard
2. **Verify environment variables** are set correctly
3. **Test health endpoint** at `https://your-service.onrender.com/health`
4. **Check CORS** if frontend can't connect 