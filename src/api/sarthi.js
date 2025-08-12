import { createSarthi } from '../ai/sarthi.js';

// Initialize Sarthi instance
const sarthi = createSarthi({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-3.5-turbo',
  enableStreaming: true,
  enableCrisisDetection: true,
  enableMemory: true,
  enableTools: true
});

/**
 * POST /api/sarthi/chat
 * Main chat endpoint for Sarthi
 */
export async function POST(request) {
  try {
    const { message, userId, language = 'en', chatHistory = [] } = await request.json();

    if (!message || !userId) {
      return new Response(JSON.stringify({ 
        error: 'Message and userId are required' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create context for Sarthi
    const context = {
      userId,
      userLanguage: language,
      currentStressLevel: 5 // This could come from user profile
    };

    // Process message with Sarthi
    const response = await sarthi.processMessage(message, context, chatHistory);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Sarthi API error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * POST /api/sarthi/stream
 * Streaming chat endpoint for real-time responses
 */
export async function POST_STREAM(request) {
  try {
    const { message, userId, language = 'en', chatHistory = [] } = await request.json();

    if (!message || !userId) {
      return new Response(JSON.stringify({ 
        error: 'Message and userId are required' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const context = {
      userId,
      userLanguage: language,
      currentStressLevel: 5
    };

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const sarthiStream = sarthi.streamResponse(message, context, chatHistory);
          
          for await (const chunk of sarthiStream) {
            const data = JSON.stringify(chunk) + '\n';
            controller.enqueue(encoder.encode(data));
            
            if (chunk.done) break;
          }
          
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('Sarthi streaming API error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * GET /api/sarthi/context/:userId
 * Get user context and conversation history
 */
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.pathname.split('/').pop();

    if (!userId) {
      return new Response(JSON.stringify({ 
        error: 'UserId is required' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get user context and recent history
    const [context, history] = await Promise.all([
      sarthi.getUserContext(userId),
      sarthi.getRecentHistory(userId, 10)
    ]);

    return new Response(JSON.stringify({
      context,
      history,
      stats: sarthi.getStats()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Sarthi context API error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * DELETE /api/sarthi/user/:userId
 * Clear user data (GDPR compliance)
 */
export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const userId = url.pathname.split('/').pop();

    if (!userId) {
      return new Response(JSON.stringify({ 
        error: 'UserId is required' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await sarthi.clearUserData(userId);

    return new Response(JSON.stringify({
      message: 'User data cleared successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Sarthi delete API error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
