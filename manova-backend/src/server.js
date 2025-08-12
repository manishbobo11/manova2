const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { Pinecone } = require('@pinecone-database/pinecone');
const vectorRouter = require('./routes/vectorRoutes');

// Load environment variables
dotenv.config();

// Initialize Express app (ONCE)
const app = express();

// Parse JSON bodies
app.use(express.json());

// Strict CORS configuration for manova.life
const allowedOrigins = [
  'https://manova.life',
  'https://www.manova.life',
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
};

// Apply CORS globally
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Health check endpoint (top of routes)
app.get('/healthz', (req, res) => res.status(200).send('ok'));

// Legacy health endpoint for compatibility
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'manova-backend'
  });
});

// Vector upsert endpoint (moved from index.js)
app.post('/api/vector/upsert', async (req, res) => {
  try {
    const { userId, embedding, metadata } = req.body;
    
    console.log('📝 Vector upsert request received:', {
      userId,
      embeddingLength: embedding ? embedding.length : 0,
      metadata
    });

    // Validate required fields
    if (!userId || !embedding || !metadata) {
      console.error('❌ Missing required fields:', { userId: !!userId, embedding: !!embedding, metadata: !!metadata });
      return res.status(400).json({ error: 'Missing required fields: userId, embedding, metadata' });
    }

    // Check if Pinecone credentials are available
    const apiKey = process.env.PINECONE_API_KEY;
    const environment = process.env.PINECONE_ENVIRONMENT;
    const indexName = process.env.PINECONE_INDEX_NAME || "manova-emotions";

    if (!apiKey || !environment) {
      console.error('❌ Missing Pinecone credentials');
      return res.status(500).json({ error: 'Pinecone configuration missing' });
    }

    console.log('🔧 Pinecone config:', { environment, indexName });

    const pinecone = new Pinecone();

    console.log('🔧 Pinecone initialization:', { 
      hasApiKey: !!apiKey, 
      environment, 
      indexName,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : 'none'
    });

    // Try to get the index and validate existence
    let index;
    try {
      index = pinecone.index(indexName);
      console.log('✅ Pinecone index accessed successfully');
      
      // Validate index existence and health
      const stats = await index.describeIndexStats();
      console.log("🧪 Pinecone Index Stats:", stats);
      
      if (!stats) {
        throw new Error('Index stats returned null - index may not exist');
      }
      
      console.log(`📊 Index health: ${stats.totalVectorCount || 0} vectors, ${stats.dimension || 0} dimensions`);
      
    } catch (indexError) {
      console.error('❌ Failed to access or validate Pinecone index:', indexError.message);
      return res.status(500).json({
        error: 'Pinecone index not accessible',
        message: indexError.message
      });
    }

    // Generate unique vector ID
    const vectorId = `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Ensure metadata includes userId for filtering
    const finalMetadata = {
      ...metadata,
      userId: userId,
      timestamp: new Date().toISOString()
    };

    const vectorData = {
      id: vectorId,
      values: embedding,
      metadata: finalMetadata
    };

    // Try to upsert the vector
    try {
      const namespace = ""; // Use empty string as default namespace
      
      console.log(`📤 Upserting vector to Pinecone:`, {
        id: vectorId,
        dimensions: embedding.length,
        metadataKeys: Object.keys(finalMetadata)
      });
      
      const upsertResponse = await index.namespace(namespace).upsert([vectorData]);
      
      console.log('✅ Vector upserted successfully:', upsertResponse);
      
      res.status(200).json({
        success: true,
        vectorId: vectorId,
        message: 'Vector stored successfully',
        upsertResponse: upsertResponse
      });
      
    } catch (upsertError) {
      console.error('❌ Error upserting vector:', upsertError);
      res.status(500).json({
        error: 'Failed to upsert vector',
        message: upsertError.message
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error in vector upsert:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Vector routes
app.use('/api/vector', vectorRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server (ONLY ONE listener)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API listening on ${PORT}`));
