import { upsertUserVector, querySimilarVectors } from '../utils/vectorStore';
import { getResponseEmbedding } from '../utils/embeddingService';
import { analyzeStressResponse } from './stressAnalysisLogic';

/**
 * Modular survey submission handler for Layer 1 AI system
 * Handles vector embedding and storage for each survey response
 */

/**
 * Process and store a single survey response with vector embedding
 * @param {Object} responseData - Survey response data
 * @param {string} responseData.userId - User's unique identifier
 * @param {string} responseData.questionId - Question identifier
 * @param {string} responseData.questionText - Full question text
 * @param {string} responseData.answerLabel - User's answer label
 * @param {number} responseData.answerValue - Numeric answer value
 * @param {string} responseData.domain - Wellness domain
 * @param {boolean} responseData.isPositive - Whether question is positive framed
 * @returns {Promise<Object>} Processing result
 */
export const processQuestionResponse = async (responseData) => {
  const {
    userId,
    questionId,
    questionText,
    answerLabel,
    answerValue,
    domain,
    isPositive = false
  } = responseData;
  
  // Enhanced validation before processing
  const validation = validateResponseData(responseData);
  if (!validation.valid) {
    console.error('❌ Response data validation failed:', validation.errors);
    return {
      success: false,
      questionId,
      error: `Validation failed: ${validation.errors.join(', ')}`,
      vectorStored: false
    };
  }
  
  try {
    console.log(`📝 Processing response for user ${userId}, question ${questionId}`);
    
    // Step 1: Perform stress analysis
    const stressAnalysis = await analyzeStressResponse(
      questionText,
      answerLabel,
      null, // emotion - will be detected by enhanced analysis
      domain,
      questionId
    );
    
    console.log(`🧠 Stress analysis completed:`, {
      questionId,
      basicScore: stressAnalysis.score,
      enhancedScore: stressAnalysis.enhanced?.score,
      emotion: stressAnalysis.enhanced?.tag || stressAnalysis.emotion,
      causeTag: stressAnalysis.enhanced?.causeTag
    });
    
    // Step 2: Generate vector embedding
    const embeddingData = {
      question: questionText,
      answer: answerLabel,
      domain: domain,
      stressScore: stressAnalysis.enhanced?.score || stressAnalysis.score || answerValue
    };
    
    const embedding = await getResponseEmbedding(embeddingData);
    console.log(`🔢 Generated embedding (${embedding.length} dimensions)`);
    
    // Step 3: Prepare comprehensive metadata
    const metadata = {
      timestamp: new Date().toISOString(),
      domain: domain,
      questionId: questionId,
      question: questionText,
      response: answerLabel,
      stressScore: stressAnalysis.enhanced?.score || stressAnalysis.score || answerValue,
      emotion: stressAnalysis.enhanced?.tag || stressAnalysis.emotion || '',
      intensity: stressAnalysis.enhanced?.intensity || stressAnalysis.intensity || 'Moderate',
      causeTag: stressAnalysis.enhanced?.causeTag || '',
      labelColor: stressAnalysis.enhanced?.labelColor || '',
      isPositive: isPositive,
      answerValue: answerValue
    };
    
    // Step 4: Store vector in Pinecone via API
    console.log(`📡 Attempting vector storage for ${userId} - ${domain}:${questionId}`);
    const vectorResult = await upsertUserVector(userId, embedding, metadata);
    
    if (vectorResult.success) {
      console.log(`✅ Vector stored successfully for ${userId} - ${domain}:${questionId}`, {
        vectorId: vectorResult.vectorId,
        metadata: {
          domain,
          stressScore: metadata.stressScore,
          emotion: metadata.emotion,
          timestamp: metadata.timestamp
        }
      });
    } else {
      console.warn(`⚠️ Vector storage failed for ${userId} - ${domain}:${questionId}:`, {
        error: vectorResult.error,
        metadata: metadata,
        continuingSurvey: true
      });
    }
    
    // Step 5: Check for recurring patterns after vector is stored
    let analysisOutput = {
      questionId,
      stressAnalysis,
      vectorId: vectorResult.vectorId || `${userId}_${Date.now()}`,
      vectorStored: vectorResult.success,
      metadata,
      embeddingGenerated: true,
      vectorError: vectorResult.error || null
    };
    
    try {
      console.log(`🔍 Checking for recurring patterns for ${userId} in domain ${domain}`);
      
      // Validate inputs before querying
      if (!userId || typeof userId !== 'string') {
        console.warn('⚠️ Invalid userId for recurring pattern check, skipping');
        analysisOutput.recurringTag = false;
        // Don't return here, continue to the final return statement
      } else if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
        console.warn('⚠️ Invalid embedding for recurring pattern check, skipping');
        analysisOutput.recurringTag = false;
        // Don't return here, continue to the final return statement  
      } else {
      
      const currentDomain = domain;
      const currentEmbedding = embedding;
      
      console.log(`📊 Querying with embedding length: ${currentEmbedding.length}, domain: ${currentDomain}`);
      const similarResponses = await querySimilarVectors(userId, currentEmbedding, 3);
      
      console.log(`📥 Received ${similarResponses?.length || 0} similar responses`);
      if (similarResponses && similarResponses.length > 0) {
        console.log('🔍 Sample response structure:', {
          hasMetadata: !!similarResponses[0]?.metadata,
          hasDomain: !!similarResponses[0]?.metadata?.domain,
          hasScore: !!similarResponses[0]?.score,
          sampleDomain: similarResponses[0]?.metadata?.domain,
          sampleScore: similarResponses[0]?.score
        });
      }
      
        // Safely check for recurring patterns
        if (!Array.isArray(similarResponses) || similarResponses.length === 0) {
          console.log(`📈 No similar responses found for ${userId} in ${domain} domain (this is normal for new users or first-time patterns)`);
          analysisOutput.recurringTag = false;
        } else {
          // Find recurring patterns with safe property access
          const recurringPattern = similarResponses.find(
            (res) => {
              if (!res || !res.metadata) {
                console.warn('⚠️ Invalid response object in similarResponses:', res);
                return false;
              }
              
              const matchesDomain = res.metadata.domain === currentDomain;
              const meetsThreshold = (res.score || 0) > 0.85;
              
              console.log(`🔍 Checking response: domain=${res.metadata.domain}, score=${res.score}, matches=${matchesDomain && meetsThreshold}`);
              
              return matchesDomain && meetsThreshold;
            }
          );
          
          if (recurringPattern) {
            analysisOutput.recurringTag = true;
            
            // Safely format the timestamp
            let formattedDate = 'Unknown date';
            try {
              if (recurringPattern.metadata.timestamp) {
                formattedDate = new Date(recurringPattern.metadata.timestamp).toLocaleDateString();
              }
            } catch (dateError) {
              console.warn('⚠️ Error formatting timestamp:', dateError);
            }
            
            analysisOutput.recurringMessage = `This response is emotionally similar to a past check-in from ${formattedDate}, possibly indicating a recurring concern.`;
            
            console.log(`🔄 Recurring pattern detected for ${userId} in ${domain} domain (similarity: ${recurringPattern.score})`);
            console.log(`📅 Previous similar response from: ${recurringPattern.metadata.timestamp}`);
          } else {
            analysisOutput.recurringTag = false;
            console.log(`📈 No significant recurring patterns detected for ${userId} in ${domain} domain`);
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ Recurring pattern analysis failed for ${userId}:`, error.message);
      console.error('Full error details:', error);
      analysisOutput.recurringTag = false;
      analysisOutput.recurringError = error.message;
    }
    
    return {
      success: true,
      ...analysisOutput
    };
    
  } catch (error) {
    console.error(`❌ Error processing response for ${questionId}:`, error);
    
    return {
      success: false,
      questionId,
      error: error.message,
      stressAnalysis: null,
      embeddingGenerated: false
    };
  }
};

/**
 * Process multiple responses in batch (for survey completion)
 * @param {string} userId - User's unique identifier
 * @param {Array} responses - Array of response objects
 * @param {Array} domains - Survey domains configuration
 * @returns {Promise<Object>} Batch processing result
 */
export const processBatchResponses = async (userId, responses, domains) => {
  try {
    console.log(`📦 Processing batch responses for user ${userId} (${Object.keys(responses).length} responses)`);
    
    const results = [];
    const errors = [];
    
    // Process each domain's questions
    for (const domain of domains) {
      for (const question of domain.questions) {
        const answerValue = responses[question.id];
        
        if (answerValue !== undefined && answerValue !== null) {
          const answerLabel = question.options?.find(opt => opt.value === answerValue)?.label || answerValue;
          
          const responseData = {
            userId,
            questionId: question.id,
            questionText: question.text,
            answerLabel,
            answerValue,
            domain: domain.name,
            isPositive: question.isPositive || question.positive || false
          };
          
          try {
            const result = await processQuestionResponse(responseData);
            results.push(result);
            
            if (!result.success) {
              errors.push({
                questionId: question.id,
                error: result.error
              });
            }
          } catch (error) {
            errors.push({
              questionId: question.id,
              error: error.message
            });
          }
        }
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const errorCount = errors.length;
    
    console.log(`📊 Batch processing completed: ${successCount} successful, ${errorCount} errors`);
    
    return {
      success: errorCount === 0,
      totalProcessed: results.length,
      successCount,
      errorCount,
      results,
      errors,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error in batch processing:', error);
    return {
      success: false,
      error: error.message,
      totalProcessed: 0,
      successCount: 0,
      errorCount: 1
    };
  }
};

/**
 * Validate response data before processing
 * @param {Object} responseData - Response data to validate
 * @returns {Object} Validation result
 */
export const validateResponseData = (responseData) => {
  const required = ['userId', 'questionId', 'questionText', 'answerLabel', 'domain'];
  const missing = required.filter(field => !responseData[field]);
  
  if (missing.length > 0) {
    return {
      valid: false,
      errors: [`Missing required fields: ${missing.join(', ')}`]
    };
  }
  
  if (typeof responseData.userId !== 'string' || responseData.userId.trim().length === 0) {
    return {
      valid: false,
      errors: ['Invalid userId: must be a non-empty string']
    };
  }
  
  return { valid: true, errors: [] };
};

/**
 * Get processing statistics for a user
 * @param {Array} results - Array of processing results
 * @returns {Object} Statistics summary
 */
export const getProcessingStats = (results) => {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  const stressLevels = successful.map(r => r.stressAnalysis?.enhanced?.score || r.stressAnalysis?.score || 0);
  const avgStressScore = stressLevels.length > 0 ? 
    stressLevels.reduce((sum, score) => sum + score, 0) / stressLevels.length : 0;
  
  const domains = [...new Set(successful.map(r => r.metadata?.domain))];
  const highStressCount = stressLevels.filter(score => score >= 7).length;
  
  return {
    totalResponses: results.length,
    successful: successful.length,
    failed: failed.length,
    averageStressScore: Math.round(avgStressScore * 100) / 100,
    domainsProcessed: domains,
    highStressResponses: highStressCount,
    embeddingsGenerated: successful.filter(r => r.embeddingGenerated).length
  };
};

export default {
  processQuestionResponse,
  processBatchResponses,
  validateResponseData,
  getProcessingStats
};