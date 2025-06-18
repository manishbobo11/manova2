import { useEffect, useState } from 'react';
import { getCheckinHistory } from '../services/userSurveyHistory';
import mcpService from '../services/mcp';
import staticQuestions from '../data/questions.json';

function extractDomainHistory(checkins, domain) {
  // Gather all responses for this domain
  const domainResponses = checkins
    .map(c => c.responses?.[domain])
    .filter(Boolean);
  if (domainResponses.length === 0) return null;

  // Extract repeated keywords/phrases from responseText or similar fields
  const allTexts = domainResponses
    .map(r => r.responseText || r.customReason || r.textInput || r.emotion || r.tags || '')
    .flat()
    .filter(Boolean);
  const phraseCounts = {};
  allTexts.forEach(kw => {
    if (typeof kw === 'string') {
      phraseCounts[kw] = (phraseCounts[kw] || 0) + 1;
    } else if (Array.isArray(kw)) {
      kw.forEach(k => { phraseCounts[k] = (phraseCounts[k] || 0) + 1; });
    }
  });
  const repeatedKeywords = Object.entries(phraseCounts)
    .filter(([_, count]) => count > 1)
    .map(([phrase]) => phrase);

  // Detect emotional tone shifts (e.g., from neutral to negative)
  const emotionalTones = domainResponses.map(r => r.emotion || r.emotionalTone || '').filter(Boolean);
  let emotionalTone = '';
  if (emotionalTones.length > 1) {
    const first = emotionalTones[0].toLowerCase();
    const last = emotionalTones[emotionalTones.length - 1].toLowerCase();
    if (first !== last) {
      emotionalTone = `${first} → ${last}`;
    } else {
      emotionalTone = last;
    }
  } else if (emotionalTones.length === 1) {
    emotionalTone = emotionalTones[0];
  }

  // Track frequency of concern using stressScore trends
  const stressScores = domainResponses.map(r => r.stressScore ?? r.value).filter(v => typeof v === 'number');
  let stressTrend = '';
  if (stressScores.length > 1) {
    const diffs = stressScores.slice(1).map((v, i) => v - stressScores[i]);
    const sum = diffs.reduce((a, b) => a + b, 0);
    if (sum > 0) stressTrend = 'increasing';
    else if (sum < 0) stressTrend = 'decreasing';
    else stressTrend = 'stable';
  }

  // Last response snippet
  const lastResponse = domainResponses[domainResponses.length - 1];
  const lastResponseSnippet = (lastResponse.responseText || lastResponse.customReason || lastResponse.textInput || lastResponse.emotion || '').toString().slice(0, 80);

  // Only return if there is a stress/emotional signal
  if (!stressScores.some(s => s > 2) && !repeatedKeywords.length && !emotionalTone) return null;

  return {
    stressTrend,
    emotionalTone,
    repeatedKeywords,
    lastResponseSnippet,
  };
}

/**
 * usePersonalizedQuestions
 * @param {string} userId
 * @param {string} userName
 * @returns {object} { questions, loading, error }
 */
export function usePersonalizedQuestions(userId, userName = '') {
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

        if (!checkins || checkins.length === 0) {
          setQuestions(staticQuestions);
          setLoading(false);
          return;
        }

        // Collect all domains with history
        const allDomains = Array.from(
          new Set(checkins.flatMap(c => Object.keys(c.responses || {})))
        );

        // For each domain, build a warm, specific prompt and call GPT
        const personalized = await Promise.all(
          allDomains.map(async (domain) => {
            // --- Emotional pattern recognition and context extraction ---
            const history = extractDomainHistory(checkins, domain);
            if (!history) return null;
            const { stressTrend, emotionalTone, repeatedKeywords, lastResponseSnippet } = history;

            // --- Build enhanced, warm, human GPT prompt with emotional context ---
            const prompt = `This user has shown${stressTrend ? ` ${stressTrend}` : ''} signs of${emotionalTone ? ` ${emotionalTone}` : ''} in the [${domain}] domain${repeatedKeywords.length ? `, with concerns like [${repeatedKeywords.join(', ')}] appearing repeatedly` : ''}. Based on their past answers — e.g., "${lastResponseSnippet}" — generate a deeply empathetic, new follow-up question that encourages trust, reflection, and openness. Keep the question natural and avoid repetition. Format output as: { domain, question, emotionalTone }`;
            // --- End emotional context injection ---

            const gptQ = await mcpService.generateResponse(userId, prompt);
            let content = gptQ?.choices?.[0]?.message?.content?.trim() || gptQ;
            // Remove code fences if present
            content = content.replace(/```json|```/g, '').trim();
            let parsed;
            try {
              parsed = JSON.parse(content);
            } catch (e) {
              // fallback: try to extract JSON
              const match = content.match(/\{[\s\S]*\}/);
              if (match) {
                parsed = JSON.parse(match[0]);
              } else {
                parsed = { domain, question: content, emotionalTone: emotionalTone || '' };
              }
            }
            // Ensure no repetition of old question (very basic check)
            if (parsed.question && checkins.some(c => Object.values(c.responses || {}).some(r => r.question === parsed.question))) {
              return null;
            }
            return parsed;
          })
        );
        setQuestions(personalized.filter(Boolean));
        setLoading(false);
      } catch (err) {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    }

    fetchQuestions();
    return () => { isMounted = false; };
  }, [userId, userName]);

  return { questions, loading, error };
} 