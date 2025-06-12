import { useEffect, useState } from 'react';
import { getCheckinHistory } from '../services/userSurveyHistory';
import mcpService from '../services/mcp';
import staticQuestions from '../data/questions.json';

/**
 * usePersonalizedQuestions
 * @param {string} userId
 * @returns {object} { questions, loading, error }
 */
export function usePersonalizedQuestions(userId) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    setLoading(true);
    setError(null);

    async function fetchQuestions() {
      try {
        const { checkins } = await getCheckinHistory(userId);
        if (!isMounted) return;

        // First check-in: use static questions
        if (!checkins || checkins.length === 0) {
          setQuestions(staticQuestions);
          setLoading(false);
          return;
        }

        // Second check-in: personalized follow-ups based on last check-in
        if (checkins.length === 1) {
          const last = checkins[0];
          // For each domain, generate a follow-up question
          const personalized = await Promise.all(
            Object.entries(last.responses).map(async ([domain, response]) => {
              const prompt = `This user previously felt '${response.emotion || response.value || response}' in domain '${domain}'. Ask a thoughtful and emotionally intelligent follow-up question.`;
              const gptQ = await mcpService.generateResponse(userId, prompt);
              return {
                domain,
                question: gptQ?.choices?.[0]?.message?.content?.trim() || gptQ,
              };
            })
          );
          setQuestions(personalized);
          setLoading(false);
          return;
        }

        // Third+ check-in: deep analysis and targeted deep-dive questions
        if (checkins.length >= 2) {
          // Analyze all past check-ins for emotional patterns
          const historySummary = checkins.map((c, i) => `Check-in #${i+1}: ${JSON.stringify(c.responses)}`).join('\n');
          const deepDiveQs = await Promise.all(
            Object.keys(checkins[0].responses).map(async (domain) => {
              const prompt = `Here is this user's check-in history for domain '${domain}':\n${historySummary}\n\nBased on their emotional patterns, generate a highly targeted, emotionally intelligent deep-dive question for their next check-in in this domain.`;
              const gptQ = await mcpService.generateResponse(userId, prompt);
              return {
                domain,
                question: gptQ?.choices?.[0]?.message?.content?.trim() || gptQ,
              };
            })
          );
          setQuestions(deepDiveQs);
          setLoading(false);
          return;
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    }

    fetchQuestions();
    return () => { isMounted = false; };
  }, [userId]);

  return { questions, loading, error };
} 