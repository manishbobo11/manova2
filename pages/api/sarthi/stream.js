/**
 * Streaming Sarthi Chat API - GET endpoint
 * Provides real-time streaming responses using Server-Sent Events with Azure OpenAI
 */

import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// Azure OpenAI configuration
const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT;
const azureVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';
const azureKey = process.env.AZURE_OPENAI_API_KEY;

// Validate Azure OpenAI configuration
if (!azureEndpoint || !azureDeployment || !azureKey) {
  console.error('❌ Missing Azure OpenAI configuration');
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Quick auth validation
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    
    try {
      decodedToken = await getAuth().verifyIdToken(token);
    } catch (authError) {
      console.error('❌ Auth verification failed:', authError.message);
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    const userId = decodedToken.uid;
    const { message, language = 'English' } = req.query;

    if (!message) {
      return res.status(400).json({ error: 'Missing message parameter' });
    }

    console.log(`🔄 Starting streaming response for user ${userId}`);

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET',
    });

    // Create AbortController with 12s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ Request timeout after 12s');
      controller.abort();
    }, 12000);

    // Build Sarthi system prompt
    const systemPrompt = `You are Sarthi, an emotionally intelligent wellness companion. You are warm, empathetic, and supportive. You speak in a natural, conversational tone and provide helpful guidance for mental wellness.

Key traits:
- Warm and empathetic
- Conversational and natural
- Supportive and encouraging
- Practical and actionable advice
- Culturally sensitive
- Professional but friendly

Current user language preference: ${language}

Respond in a helpful, supportive manner that feels like talking to a caring friend.`;

    // Prepare messages for Azure OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    // Call Azure OpenAI with streaming using global agent
    const endpoint = `${azureEndpoint}/openai/deployments/${azureDeployment}/chat/completions?api-version=${azureVersion}`;
    
    // Use global HTTPS agent for connection reuse
    const https = require('https');
    const httpsAgent = new https.Agent({
      keepAlive: true,
      keepAliveMsecs: 30000,
      maxSockets: 50,
      maxFreeSockets: 10,
      timeout: 12000,
      freeSocketTimeout: 30000,
    });
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': azureKey,
        'Connection': 'keep-alive',
      },
      body: JSON.stringify({
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
        stream: true,
      }),
      signal: controller.signal,
      agent: httpsAgent
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Azure OpenAI error:', response.status, errorData);
      res.write(`event: error\ndata: ${JSON.stringify({ 
        error: 'Service temporarily unavailable',
        message: "I'm having trouble connecting right now. Please try again in a moment."
      })}\n\n`);
      return res.end();
    }

    // Clear timeout since we got a response
    clearTimeout(timeoutId);

    // Process streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            // Handle [DONE] signal
            if (data === '[DONE]') {
              res.write(`data: ${JSON.stringify({ type: 'complete' })}\n\n`);
              return res.end();
            }

            try {
              const parsed = JSON.parse(data);
              
              // Extract delta content
              if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                const delta = parsed.choices[0].delta;
                
                if (delta.content) {
                  // Send the content chunk
                  res.write(`data: ${JSON.stringify({ 
                    type: 'content', 
                    content: delta.content 
                  })}\n\n`);
                }
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', parseError);
            }
          }
        }
      }
    } catch (streamError) {
      if (streamError.name === 'AbortError') {
        console.log('⏰ Stream aborted due to timeout');
        res.write(`event: error\ndata: ${JSON.stringify({ 
          error: 'Request timeout',
          message: "I'm taking longer than expected to respond. Please try again."
        })}\n\n`);
      } else {
        console.error('❌ Stream processing error:', streamError);
        res.write(`event: error\ndata: ${JSON.stringify({ 
          error: 'Stream error',
          message: "Something went wrong with the connection. Please try again."
        })}\n\n`);
      }
    } finally {
      reader.releaseLock();
    }

    console.log(`✅ Streaming response completed for user ${userId}`);

  } catch (error) {
    console.error('❌ Streaming error:', error);
    
    // Send error event
    res.write(`event: error\ndata: ${JSON.stringify({ 
      error: 'Internal server error',
      message: "Sorry, I'm having a hiccup. Can we try that again?"
    })}\n\n`);
  } finally {
    res.end();
  }
}
